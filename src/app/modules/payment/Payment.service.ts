import { StatusCodes } from 'http-status-codes';
import { EAgentOfferStatus, ETicketStatus, prisma } from '../../../utils/db';
import type {
  TAcceptAgentOfferMetadata,
  TAcceptVenueOfferMetadata,
} from '../organizer/Organizer.interface';
import ServerError from '../../../errors/ServerError';
import { TWithdrawArgs } from './Payment.interface';
import { UserServices } from '../user/User.service';
import Stripe from 'stripe';
import { stripe } from './Payment.utils';
import { TTicketMetadata } from '../ticket/Ticket.interface';
import config from '../../../config';
import ora from 'ora';
import chalk from 'chalk';

/**
 * Payment Services
 */
export const PaymentServices = {
  /**
   * Accept agent offer
   *
   * @event agent_offer
   */
  async agent_offer(session: Stripe.Checkout.Session) {
    const metadata = session.metadata as TAcceptAgentOfferMetadata;

    const offer = await prisma.agentOffer.findFirst({
      where: { id: metadata.offer_id },
      select: {
        agent_id: true,
        artist_id: true,
        organizer_id: true,
        status: true,
      },
    });

    if (!offer) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Agent Offer not found');
    }

    //? if offer is already approved
    if (offer.status === EAgentOfferStatus.APPROVED) return;

    // 🧾 Retrieve the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    // 🧩 Retrieve the related Charge (since charges are not auto-included)
    const charge = await stripe.charges.retrieve(
      paymentIntent.latest_charge as string,
    );

    // 💸 Retrieve the Balance Transaction for the fee info
    const { fee } = await stripe.balanceTransactions.retrieve(
      charge.balance_transaction as string,
    );

    //? remove fee form amount
    const amount = Number(metadata.amount) - fee / 100;

    const artistAmount = Math.floor(amount * 80) / 100; //? 80% to artist
    const agentAmount = Math.floor(amount * 20) / 100; //? 20% to agent

    await prisma.$transaction(async tx => {
      //? add money in artist wallet
      await tx.user.update({
        where: { id: offer.artist_id },
        data: { balance: { increment: artistAmount } },
        select: { balance: true }, //? skip body
      });

      //? add money in agent wallet
      await tx.user.update({
        where: { id: offer.agent_id },
        data: { balance: { increment: agentAmount } },
        select: { balance: true }, //? skip body
      });

      //? add artist in organizer active artists
      await tx.user.update({
        where: { id: offer.organizer_id },
        data: {
          organizer_active_artists: {
            connect: {
              id: metadata.offer_id,
            },
          },
        },
      });

      //? update agent offer
      await tx.agentOffer.update({
        where: { id: metadata.offer_id },
        data: { status: EAgentOfferStatus.APPROVED, approved_at: new Date() },
      });
    });
  },

  /**
   * Accept venue offer
   *
   * @event venue_offer
   */
  async venue_offer(session: Stripe.Checkout.Session) {
    const metadata = session.metadata as TAcceptVenueOfferMetadata;

    const offer = await prisma.venueOffer.findFirst({
      where: { id: metadata.offer_id },
      select: {
        venue_id: true,
        organizer_id: true,
        status: true,
      },
    });

    if (!offer) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Agent Offer not found');
    }

    //? if offer is already approved
    if (offer.status === EAgentOfferStatus.APPROVED) return;

    // 🧾 Retrieve the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    // 🧩 Retrieve the related Charge (since charges are not auto-included)
    const charge = await stripe.charges.retrieve(
      paymentIntent.latest_charge as string,
    );

    // 💸 Retrieve the Balance Transaction for the fee info
    const { fee } = await stripe.balanceTransactions.retrieve(
      charge.balance_transaction as string,
    );

    //? remove fee form amount
    const venueAmount = Number(metadata.amount) - fee / 100;

    await prisma.$transaction(async tx => {
      //? add money in venue wallet
      await tx.user.update({
        where: { id: offer.venue_id },
        data: { balance: { increment: venueAmount } },
        select: { balance: true }, //? skip body
      });

      //? add venue in organizer
      await tx.user.update({
        where: { id: offer.organizer_id },
        data: {
          organizer_active_venues: {
            connect: {
              id: metadata.offer_id,
            },
          },
        },
      });

      //? update venue offer
      await tx.venueOffer.update({
        where: { id: metadata.offer_id },
        data: { status: EAgentOfferStatus.APPROVED, approved_at: new Date() },
      });
    });
  },

  /**
   * Withdraw money
   *
   * @event withdraw
   */
  async withdraw({ amount, user }: TWithdrawArgs) {
    if (user.balance < amount) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        "You don't have enough balance",
      );
    }

    if (!user.is_stripe_connected) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        "You haven't connected your Stripe account",
      );
    }

    if (!user.stripe_account_id) {
      await UserServices.stripeAccountConnect({ user_id: user.id });

      throw new ServerError(
        StatusCodes.ACCEPTED,
        'Stripe account connecting. Try again later!',
      );
    }

    const spinner = ora({
      color: 'yellow',
      text: `Withdrawing ${amount} from ${user.email}`,
    }).start();

    try {
      spinner.text = `Checking Stripe account and balance for ${user.email}`;

      if (!user?.stripe_account_id) {
        throw new Error('Stripe account not found');
      }

      //? ensure user has enough balance
      if (user.balance < amount) {
        throw new Error(
          `Insufficient balance, current balance: ${user.balance}, required balance: ${amount} ${config.payment.currency}`,
        );
      }

      spinner.text = `Transferring ${amount} ${config.payment.currency} to ${user.email}`;

      await stripe.transfers.create({
        amount: amount * 100,
        currency: config.payment.currency,
        destination: user.stripe_account_id,
        description: `Transfer to ${user.email}`,
      });

      spinner.text = `Retrieving balance for ${user.email}`;

      const balance = (
        await stripe.balance.retrieve({ stripeAccount: user.stripe_account_id })
      ).available.find(b => b.currency === config.payment.currency)?.amount;

      if (!balance) {
        throw new Error('Transfer failed');
      }

      spinner.text = `Payout ${balance / 100} ${config.payment.currency} to ${user.email}`;

      await stripe.payouts.create(
        { amount: balance, currency: config.payment.currency },
        { stripeAccount: user.stripe_account_id },
      );

      spinner.text = `Updating balance for ${user.email}`;

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      });

      spinner.succeed(
        chalk.green(
          `${amount} ${config.payment.currency} withdrawn successfully to ${user.email}`,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(chalk.red(`Withdrawal failed: ${error.message}`));
      }
    }
  },

  /**
   * Ticket purchase
   *
   * @event ticket_purchase
   */
  async ticket_purchase(session: Stripe.Checkout.Session) {
    const { ticket_ids } = session.metadata as TTicketMetadata;

    await prisma.ticket.updateMany({
      where: { id: { in: ticket_ids.split(',') } },
      data: { status: ETicketStatus.PAID, expires_at: null },
    });
  },
};
