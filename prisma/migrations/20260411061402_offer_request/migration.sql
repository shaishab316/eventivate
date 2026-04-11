-- CreateEnum
CREATE TYPE "OfferRequestKind" AS ENUM ('VENUE', 'ARTIST');

-- CreateTable
CREATE TABLE "offer_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "kind" "OfferRequestKind" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "date" TIMESTAMP(3),
    "time" TIMESTAMP(3),
    "budget" TEXT,
    "additional_info" TEXT,
    "artist_name" TEXT,
    "venue_name" TEXT,
    "system_performer_id" TEXT,
    "system_venue_id" TEXT,

    CONSTRAINT "offer_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offer_requests" ADD CONSTRAINT "offer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_requests" ADD CONSTRAINT "offer_requests_system_performer_id_fkey" FOREIGN KEY ("system_performer_id") REFERENCES "system_performers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_requests" ADD CONSTRAINT "offer_requests_system_venue_id_fkey" FOREIGN KEY ("system_venue_id") REFERENCES "system_venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
