/*
  Warnings:

  - You are about to drop the column `description` on the `artist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `artist_profiles` table. All the data in the column will be lost.
  - The `genre` column on the `artist_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EArtistType" AS ENUM ('SOLO', 'BAND', 'DJ', 'PRODUCER', 'COMEDIAN', 'SPEAKER');

-- CreateEnum
CREATE TYPE "ESocialPlatform" AS ENUM ('INSTAGRAM', 'TWITTER', 'FACEBOOK', 'YOUTUBE', 'TIKTOK', 'SPOTIFY', 'SOUNDCLOUD', 'APPLE_MUSIC', 'LINKEDIN', 'WEBSITE');

-- CreateEnum
CREATE TYPE "ERiderType" AS ENUM ('TECHNICAL', 'HOSPITALITY');

-- CreateEnum
CREATE TYPE "EMediaType" AS ENUM ('PHOTO', 'VIDEO');

-- AlterTable
ALTER TABLE "artist_profiles" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "artist_type" "EArtistType",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "booking_fee_currency" TEXT DEFAULT 'USD',
ADD COLUMN     "booking_fee_max" INTEGER,
ADD COLUMN     "booking_fee_min" INTEGER,
ADD COLUMN     "cover_photo" TEXT,
ADD COLUMN     "press_kit" TEXT,
ADD COLUMN     "profile_photo" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "real_name" TEXT,
ADD COLUMN     "stage_name" TEXT,
ADD COLUMN     "sub_genre" TEXT[],
ADD COLUMN     "total_performances" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "years_active" INTEGER,
DROP COLUMN "genre",
ADD COLUMN     "genre" TEXT[];

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "artist_profile_members" (
    "member_id" SERIAL NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "photo" TEXT,

    CONSTRAINT "artist_profile_members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "artist_social_links" (
    "social_link_id" TEXT NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "platform" "ESocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "artist_social_links_pkey" PRIMARY KEY ("social_link_id")
);

-- CreateTable
CREATE TABLE "artist_riders" (
    "rider_id" TEXT NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rider_type" "ERiderType" NOT NULL,
    "item" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "artist_riders_pkey" PRIMARY KEY ("rider_id")
);

-- CreateTable
CREATE TABLE "artist_media" (
    "media_id" TEXT NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "media_type" "EMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "caption" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "artist_media_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "artist_tracks" (
    "track_id" TEXT NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "artist_tracks_pkey" PRIMARY KEY ("track_id")
);

-- CreateIndex
CREATE INDEX "artist_profile_members_artist_profile_id_idx" ON "artist_profile_members"("artist_profile_id");

-- CreateIndex
CREATE INDEX "artist_social_links_artist_profile_id_idx" ON "artist_social_links"("artist_profile_id");

-- CreateIndex
CREATE INDEX "artist_riders_artist_profile_id_idx" ON "artist_riders"("artist_profile_id");

-- CreateIndex
CREATE INDEX "artist_media_artist_profile_id_idx" ON "artist_media"("artist_profile_id");

-- CreateIndex
CREATE INDEX "artist_tracks_artist_profile_id_idx" ON "artist_tracks"("artist_profile_id");

-- AddForeignKey
ALTER TABLE "artist_profile_members" ADD CONSTRAINT "artist_profile_members_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("artist_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_social_links" ADD CONSTRAINT "artist_social_links_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("artist_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_riders" ADD CONSTRAINT "artist_riders_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("artist_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_media" ADD CONSTRAINT "artist_media_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("artist_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_tracks" ADD CONSTRAINT "artist_tracks_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("artist_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
