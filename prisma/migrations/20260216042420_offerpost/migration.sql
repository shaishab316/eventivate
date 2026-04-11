-- CreateEnum
CREATE TYPE "EOfferpostStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EOfferpostGigRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EOfferpostMsgAttachmentType" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'OTHER');

-- CreateTable
CREATE TABLE "offerposts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT,
    "status" "EOfferpostStatus" NOT NULL DEFAULT 'PENDING',
    "attachment_url" TEXT,

    CONSTRAINT "offerposts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerpost_gigs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,
    "owner_role" "EUserRole" NOT NULL,
    "genre" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "banner_url" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT NOT NULL DEFAULT 'N/A',
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "budget_min" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budget_max" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target_for_agents" BOOLEAN NOT NULL DEFAULT false,
    "target_for_artists" BOOLEAN NOT NULL DEFAULT false,
    "target_for_venues" BOOLEAN NOT NULL DEFAULT false,
    "target_for_organizers" BOOLEAN NOT NULL DEFAULT false,
    "target_for_managers" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "offerpost_gigs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerpost_gig_availabilities" (
    "id" TEXT NOT NULL,
    "gig_id" TEXT NOT NULL,
    "available_date_from" DATE NOT NULL,
    "available_date_to" DATE NOT NULL,
    "available_time_from" TIME NOT NULL,
    "available_time_to" TIME NOT NULL,

    CONSTRAINT "offerpost_gig_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerpost_gig_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gig_id" TEXT NOT NULL,
    "requester_id" TEXT,
    "referenced_offerpost_id" TEXT,
    "message" TEXT,
    "reject_reason" TEXT,
    "status" "EOfferpostGigRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "offerpost_gig_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerpost_msgs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "offerpost_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "attachment_url" TEXT,
    "attachment_type" "EOfferpostMsgAttachmentType",

    CONSTRAINT "offerpost_msgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OfferpostMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OfferpostMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OfferpostAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OfferpostAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GigOfferposts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GigOfferposts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "offerposts_owner_id_idx" ON "offerposts"("owner_id");

-- CreateIndex
CREATE INDEX "offerposts_status_idx" ON "offerposts"("status");

-- CreateIndex
CREATE INDEX "offerpost_gigs_owner_id_idx" ON "offerpost_gigs"("owner_id");

-- CreateIndex
CREATE INDEX "offerpost_gigs_owner_role_idx" ON "offerpost_gigs"("owner_role");

-- CreateIndex
CREATE INDEX "offerpost_gigs_genre_idx" ON "offerpost_gigs"("genre");

-- CreateIndex
CREATE INDEX "offerpost_gigs_keywords_idx" ON "offerpost_gigs"("keywords");

-- CreateIndex
CREATE INDEX "offerpost_gigs_location_lat_location_lng_idx" ON "offerpost_gigs"("location_lat", "location_lng");

-- CreateIndex
CREATE INDEX "offerpost_gigs_budget_min_budget_max_idx" ON "offerpost_gigs"("budget_min", "budget_max");

-- CreateIndex
CREATE INDEX "offerpost_gigs_is_active_idx" ON "offerpost_gigs"("is_active");

-- CreateIndex
CREATE INDEX "offerpost_gigs_target_for_agents_target_for_artists_target__idx" ON "offerpost_gigs"("target_for_agents", "target_for_artists", "target_for_venues", "target_for_organizers", "target_for_managers");

-- CreateIndex
CREATE INDEX "offerpost_gig_availabilities_gig_id_idx" ON "offerpost_gig_availabilities"("gig_id");

-- CreateIndex
CREATE INDEX "offerpost_gig_availabilities_available_date_from_available__idx" ON "offerpost_gig_availabilities"("available_date_from", "available_date_to");

-- CreateIndex
CREATE INDEX "offerpost_gig_requests_gig_id_idx" ON "offerpost_gig_requests"("gig_id");

-- CreateIndex
CREATE INDEX "offerpost_gig_requests_requester_id_idx" ON "offerpost_gig_requests"("requester_id");

-- CreateIndex
CREATE INDEX "offerpost_gig_requests_referenced_offerpost_id_idx" ON "offerpost_gig_requests"("referenced_offerpost_id");

-- CreateIndex
CREATE INDEX "offerpost_gig_requests_status_idx" ON "offerpost_gig_requests"("status");

-- CreateIndex
CREATE INDEX "offerpost_msgs_offerpost_id_idx" ON "offerpost_msgs"("offerpost_id");

-- CreateIndex
CREATE INDEX "offerpost_msgs_sender_id_idx" ON "offerpost_msgs"("sender_id");

-- CreateIndex
CREATE INDEX "offerpost_msgs_created_at_idx" ON "offerpost_msgs"("created_at");

-- CreateIndex
CREATE INDEX "_OfferpostMembers_B_index" ON "_OfferpostMembers"("B");

-- CreateIndex
CREATE INDEX "_OfferpostAdmins_B_index" ON "_OfferpostAdmins"("B");

-- CreateIndex
CREATE INDEX "_GigOfferposts_B_index" ON "_GigOfferposts"("B");

-- AddForeignKey
ALTER TABLE "offerposts" ADD CONSTRAINT "offerposts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_gigs" ADD CONSTRAINT "offerpost_gigs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_gig_availabilities" ADD CONSTRAINT "offerpost_gig_availabilities_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "offerpost_gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_gig_requests" ADD CONSTRAINT "offerpost_gig_requests_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "offerpost_gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_gig_requests" ADD CONSTRAINT "offerpost_gig_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_gig_requests" ADD CONSTRAINT "offerpost_gig_requests_referenced_offerpost_id_fkey" FOREIGN KEY ("referenced_offerpost_id") REFERENCES "offerposts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_msgs" ADD CONSTRAINT "offerpost_msgs_offerpost_id_fkey" FOREIGN KEY ("offerpost_id") REFERENCES "offerposts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerpost_msgs" ADD CONSTRAINT "offerpost_msgs_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferpostMembers" ADD CONSTRAINT "_OfferpostMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "offerposts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferpostMembers" ADD CONSTRAINT "_OfferpostMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferpostAdmins" ADD CONSTRAINT "_OfferpostAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "offerposts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferpostAdmins" ADD CONSTRAINT "_OfferpostAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GigOfferposts" ADD CONSTRAINT "_GigOfferposts_A_fkey" FOREIGN KEY ("A") REFERENCES "offerposts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GigOfferposts" ADD CONSTRAINT "_GigOfferposts_B_fkey" FOREIGN KEY ("B") REFERENCES "offerpost_gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
