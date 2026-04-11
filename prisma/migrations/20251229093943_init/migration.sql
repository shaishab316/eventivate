-- CreateEnum
CREATE TYPE "EAgentOfferStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "EBannerType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "EEventStatus" AS ENUM ('UPCOMING', 'PUBLISHED', 'COMPLETED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "ESubscriptionInterval" AS ENUM ('WEEKLY', 'HALF_MONTHLY', 'MONTHLY', 'TWO_MONTHLY', 'QUARTERLY', 'FOUR_MONTHLY', 'HALF_YEARLY', 'YEARLY', 'TWO_YEARLY');

-- CreateEnum
CREATE TYPE "ETicketStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "EUserRole" AS ENUM ('USER', 'ORGANIZER', 'VENUE', 'ARTIST', 'AGENT');

-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EVenueOfferStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED', 'TIMEOUT');

-- CreateTable
CREATE TABLE "agent_offers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "EAgentOfferStatus" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "agent_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "agent_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "admin_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "banner_url" TEXT NOT NULL,
    "banner_type" "EBannerType" NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_ids" TEXT[],

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EEventStatus" NOT NULL DEFAULT 'PUBLISHED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT NOT NULL,
    "ticket_price" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "artist_names" TEXT[],
    "organizer_id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "available_capacity" INTEGER NOT NULL,
    "can_buy_tickets" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mails" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" "EUserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chat_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location" TEXT NOT NULL DEFAULT 'N/A',
    "date" TIMESTAMP(3),
    "venue_id" TEXT,
    "agent_id" TEXT,
    "artist_id" TEXT,
    "organizer_id" TEXT,
    "is_venue_accepted" BOOLEAN NOT NULL DEFAULT false,
    "is_agent_accepted" BOOLEAN NOT NULL DEFAULT false,
    "is_artist_accepted" BOOLEAN NOT NULL DEFAULT false,
    "is_organizer_accepted" BOOLEAN NOT NULL DEFAULT false,
    "venue_document_url" TEXT,
    "agent_document_url" TEXT,
    "artist_document_url" TEXT,
    "organizer_document_url" TEXT,
    "venue_document_uploaded_at" TIMESTAMP(3),
    "agent_document_uploaded_at" TIMESTAMP(3),
    "artist_document_uploaded_at" TIMESTAMP(3),
    "organizer_document_uploaded_at" TIMESTAMP(3),
    "is_fully_accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "stripe_product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "features" TEXT[],
    "price" INTEGER NOT NULL,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "subscribed_user_count" INTEGER NOT NULL DEFAULT 0,
    "subscription_interval" "ESubscriptionInterval" NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "sl" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "ETicketStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stripe_transaction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "subscription_name" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "EUserRole" NOT NULL DEFAULT 'USER',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "otp_id" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL DEFAULT '/images/placeholder.png',
    "name" TEXT NOT NULL DEFAULT 'Getavails User',
    "gender" "EGender" NOT NULL DEFAULT 'OTHER',
    "location" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripe_customer_id" TEXT,
    "stripe_account_id" TEXT,
    "is_stripe_connected" BOOLEAN NOT NULL DEFAULT false,
    "subscription_name" TEXT,
    "subscription_expires_at" TIMESTAMP(3),
    "experience" TEXT,
    "genre" TEXT,
    "availability" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "price" TEXT,
    "venue_type" TEXT,
    "capacity" INTEGER,
    "agent_artists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agent_pending_artists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "artist_agents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "artist_pending_agents" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_offers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "EVenueOfferStatus" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue_id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,

    CONSTRAINT "venue_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActiveAgentOffers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActiveAgentOffers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserChats" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserChats_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SeenMessages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SeenMessages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActiveVenueOffers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActiveVenueOffers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_user_ids_key" ON "chats"("user_ids");

-- CreateIndex
CREATE INDEX "idx_remarks" ON "mails"("remarks");

-- CreateIndex
CREATE INDEX "idx_email" ON "mails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_product_id_key" ON "subscriptions"("stripe_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_name_key" ON "subscriptions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "_ActiveAgentOffers_B_index" ON "_ActiveAgentOffers"("B");

-- CreateIndex
CREATE INDEX "_UserChats_B_index" ON "_UserChats"("B");

-- CreateIndex
CREATE INDEX "_SeenMessages_B_index" ON "_SeenMessages"("B");

-- CreateIndex
CREATE INDEX "_ActiveVenueOffers_B_index" ON "_ActiveVenueOffers"("B");

-- AddForeignKey
ALTER TABLE "agent_offers" ADD CONSTRAINT "agent_offers_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_offers" ADD CONSTRAINT "agent_offers_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_offers" ADD CONSTRAINT "agent_offers_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_name_fkey" FOREIGN KEY ("subscription_name") REFERENCES "subscriptions"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_offers" ADD CONSTRAINT "venue_offers_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_offers" ADD CONSTRAINT "venue_offers_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveAgentOffers" ADD CONSTRAINT "_ActiveAgentOffers_A_fkey" FOREIGN KEY ("A") REFERENCES "agent_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveAgentOffers" ADD CONSTRAINT "_ActiveAgentOffers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserChats" ADD CONSTRAINT "_UserChats_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserChats" ADD CONSTRAINT "_UserChats_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeenMessages" ADD CONSTRAINT "_SeenMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeenMessages" ADD CONSTRAINT "_SeenMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveVenueOffers" ADD CONSTRAINT "_ActiveVenueOffers_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveVenueOffers" ADD CONSTRAINT "_ActiveVenueOffers_B_fkey" FOREIGN KEY ("B") REFERENCES "venue_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
