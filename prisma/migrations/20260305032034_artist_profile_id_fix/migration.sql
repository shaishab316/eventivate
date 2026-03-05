/*
  Warnings:

  - The primary key for the `artist_media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `media_id` on the `artist_media` table. All the data in the column will be lost.
  - The primary key for the `artist_riders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rider_id` on the `artist_riders` table. All the data in the column will be lost.
  - The primary key for the `artist_social_links` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `social_link_id` on the `artist_social_links` table. All the data in the column will be lost.
  - The primary key for the `artist_tracks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `track_id` on the `artist_tracks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "artist_media" DROP CONSTRAINT "artist_media_pkey",
DROP COLUMN "media_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "artist_media_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "artist_riders" DROP CONSTRAINT "artist_riders_pkey",
DROP COLUMN "rider_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "artist_riders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "artist_social_links" DROP CONSTRAINT "artist_social_links_pkey",
DROP COLUMN "social_link_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "artist_social_links_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "artist_tracks" DROP CONSTRAINT "artist_tracks_pkey",
DROP COLUMN "track_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "artist_tracks_pkey" PRIMARY KEY ("id");
