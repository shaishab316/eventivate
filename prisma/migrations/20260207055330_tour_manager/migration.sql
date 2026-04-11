-- AlterEnum
ALTER TYPE "EUserRole" ADD VALUE 'TOUR_MANAGER';

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "is_tour_manager_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tour_manager_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "calendars" (
    "id" TEXT NOT NULL,
    "google_calender_id" TEXT,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "connected_at" TIMESTAMP(3),
    "disconnected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_calender_tokens" (
    "id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "id_token" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "scope" TEXT,
    "token_type" TEXT,
    "expire_at" TIMESTAMP(3),

    CONSTRAINT "_calender_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendars_user_id_key" ON "calendars"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_calender_tokens_calendar_id_key" ON "_calender_tokens"("calendar_id");

-- CreateIndex
CREATE INDEX "users_role_is_active_is_verified_idx" ON "users"("role", "is_active", "is_verified");

-- CreateIndex
CREATE INDEX "users_location_lat_location_lng_idx" ON "users"("location_lat", "location_lng");

-- CreateIndex
CREATE INDEX "users_genre_idx" ON "users"("genre");

-- CreateIndex
CREATE INDEX "users_role_is_active_is_verified_genre_idx" ON "users"("role", "is_active", "is_verified", "genre");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE INDEX "users_location_idx" ON "users"("location");

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_calender_tokens" ADD CONSTRAINT "_calender_tokens_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_tour_manager_id_fkey" FOREIGN KEY ("tour_manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
