import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { stripe, stripWebhookEventMap } from '../payment/Payment.utils';
import config from '../../../config';
import chalk from 'chalk';
import {
  TGetAvailableSubscriptions,
  TStripWebhookEvent,
  TSubscriptionCreate,
  TSubscriptionEdit,
  TUserSubscriptionMetadata,
} from './Subscription.interface';
import { Prisma, User as TUser } from '../../../utils/db';
import {
  subscriptionSearchableFields as searchableFields,
  subscriptionIntervalMap,
  subscriptionOmit,
} from './Subscription.constant';
import { prisma } from '../../../utils/db';
import { logger } from '../../../utils/logger';
import env from '../../../utils/env';
import { TPagination } from '../../../utils/server/serveResponse';

export const SubscriptionServices = {
  async createSubscription(subscriptionData: TSubscriptionCreate) {
    const { name, price, subscription_interval } = subscriptionData;

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        name,
      },
    });

    if (existingSubscription)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `Subscription with name ${name} already exists`,
      );

    // Create Stripe product
    const { id: product_id } = await stripe.products.create({
      name,
    });

    // Create Stripe price {like a plan or subscription}
    const { id: subscription_id } = await stripe.prices.create({
      unit_amount: price * 100,
      currency: config.payment.currency,
      recurring: subscriptionIntervalMap[subscription_interval],
      product: product_id,
    });

    const subscription = await prisma.subscription.create({
      data: {
        ...subscriptionData,
        stripe_product_id: product_id,
        stripe_subscription_id: subscription_id,
      },
    });

    logger.info(
      chalk.green(
        `🎉 Successfully created subscription: ${chalk.bold.underline(name)}`,
      ),
    );

    return subscription;
  },

  async renewSubscriptionsAndWebhook() {
    logger.info(
      chalk.yellow(`🔑 Renewing ${chalk.bold.underline('subscriptions')}...`),
    );

    const subscriptions = await prisma.subscription.findMany();
    const BATCH_SIZE = 5; // process 5 subscriptions at a time

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);

      // Run the batch in parallel
      await Promise.allSettled(
        batch.map(async subscription => {
          let { stripe_product_id, stripe_subscription_id } = subscription;
          const { name, price, subscription_interval } = subscription;
          let needDBupdate = false;

          // Check Stripe product
          try {
            await stripe.products.retrieve(stripe_product_id);
          } catch (err: any) {
            if (
              err.statusCode === StatusCodes.NOT_FOUND ||
              err.statusCode === 404
            ) {
              const product = await stripe.products.create({ name });
              stripe_product_id = product.id;
              needDBupdate = true;
            } else throw err;
          }

          // Check Stripe price
          try {
            await stripe.prices.retrieve(stripe_subscription_id);
          } catch (err: any) {
            if (
              err.statusCode === StatusCodes.NOT_FOUND ||
              err.statusCode === 404
            ) {
              const priceObj = await stripe.prices.create({
                unit_amount: price * 100,
                currency: config.payment.currency,
                recurring: subscriptionIntervalMap[subscription_interval],
                product: stripe_product_id,
              });
              stripe_subscription_id = priceObj.id;
              needDBupdate = true;
            } else throw err;
          }

          // Update DB if needed
          if (needDBupdate) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { stripe_product_id, stripe_subscription_id },
            });
          }
        }),
      );
    }

    logger.info(
      chalk.green(
        `🔑 Renewed ${chalk.bold.underline('subscriptions')} successfully`,
      ),
    );

    if (process.env.STRIPE_WEB_HOOK_SECRET) return;

    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const { webhook_endpoint } = config.url.payment;

    const existingWebhook = webhooks.data.find(
      ({ url }) => url === webhook_endpoint,
    );

    if (existingWebhook) {
      await stripe.webhookEndpoints.del(existingWebhook.id);
    }

    const events = Object.keys(stripWebhookEventMap) as TStripWebhookEvent[];

    const newWebhook = await stripe.webhookEndpoints.create({
      url: webhook_endpoint,
      enabled_events: events,
      description: `Webhook for ${config.server.name}`,
    });

    config.payment.stripe.web_hook_secret = env(
      'stripe web hook secret',
      newWebhook.secret,
      {
        regex: '^whsec_[0-9a-zA-Z]{32,}$',
      },
    );
  },

  async editSubscription({ subscription_id, ...payload }: TSubscriptionEdit) {
    const subscription = (await prisma.subscription.findUnique({
      where: { id: subscription_id },
    }))!;

    let { stripe_subscription_id } = subscription;
    const { name, price, subscription_interval } = subscription;

    // Update product name if changed
    if (name && name !== subscription.name) {
      await stripe.products.update(subscription.stripe_product_id, {
        name,
      });
    }

    // If price or interval changed -> deactivate old + create new
    if (
      (price && price !== subscription.price) ||
      (subscription_interval &&
        subscription_interval !== subscription.subscription_interval)
    ) {
      await stripe.prices.update(stripe_subscription_id, { active: false });

      const newPrice = await stripe.prices.create({
        unit_amount: (price ?? subscription.price) * 100,
        currency: config.payment.currency,
        recurring:
          subscriptionIntervalMap[
            subscription_interval ?? subscription.subscription_interval
          ],
        product: subscription.stripe_product_id,
      });

      stripe_subscription_id = newPrice.id;
    }

    // Update DB
    const updated = await prisma.subscription.update({
      where: { id: subscription_id },
      data: {
        ...payload,
        stripe_subscription_id,
      },
    });

    logger.info(
      chalk.yellow(
        `✏️ Updated subscription: ${chalk.bold(subscription.name)} → ${chalk.bold(updated.name)}`,
      ),
    );

    return updated;
  },

  async deleteSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    await stripe.prices.update(subscription.stripe_subscription_id, {
      active: false,
    });

    logger.info(
      chalk.red(`❌ Deleted subscription: ${chalk.bold(subscription.name)}`),
    );
  },

  async getAvailableSubscriptions({
    page,
    limit,
    search,
    subscription_interval,
    minPrice,
    maxPrice,
  }: TGetAvailableSubscriptions) {
    const where: Prisma.SubscriptionWhereInput = {};

    if (search)
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    if (subscription_interval)
      where.subscription_interval = subscription_interval;

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit: subscriptionOmit,
    });

    const priceRange = await prisma.subscription.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    const total = await prisma.subscription.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        priceRange: {
          min: priceRange?._min?.price ?? 0,
          max: priceRange?._max?.price ?? 0,
        },
      },
      subscriptions,
    };
  },

  async getSubscriptionDetails(subscriptionId: string) {
    return prisma.subscription.findUnique({
      where: { id: subscriptionId },
      omit: subscriptionOmit,
    });
  },

  async subscribePlan({
    subscriptionId,
    user,
  }: {
    subscriptionId: string;
    user: TUser;
  }) {
    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        subscribed_user_count: {
          increment: 1,
        },
      },
    });

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

      customerId = customer.id;
    } else {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error: any) {
        if (error.statusCode === 404) {
          // Customer was deleted in Stripe → re-create
          const newCustomer = await stripe.customers.create({
            email: user.email,
            name: user.name,
          });

          customerId = newCustomer.id;
        } else {
          throw error;
        }
      }
    }

    // Update Stripe Subscription customer id to DB
    if (customerId !== user.stripe_customer_id) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripe_customer_id: customerId,
        },
      });
    }

    const metadata: TUserSubscriptionMetadata = {
      purpose: 'subscription',
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_avatar: user.avatar ?? config.server.default_avatar,
      subscription_name: subscription.name,
      subscription_features: subscription.features.join(', '),
      subscription_interval: subscription.subscription_interval,
    };

    return stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: subscription.stripe_subscription_id, quantity: 1 }],
      success_url: config.url.payment.success_callback,
      cancel_url: config.url.payment.cancel_callback,
      metadata,
      subscription_data: {
        metadata,
        description: subscription.name,
      },
    });
  },
};
