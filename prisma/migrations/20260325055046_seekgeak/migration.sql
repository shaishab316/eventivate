-- CreateEnum
CREATE TYPE "SystemSource" AS ENUM ('SEATGEEK', 'ADMIN_CREATED');

-- CreateTable
CREATE TABLE "seat_geek_config" (
    "id" UUID NOT NULL,
    "imported_event_count" INTEGER NOT NULL DEFAULT 0,
    "required_event_count" INTEGER NOT NULL DEFAULT 0,
    "total_event_count" INTEGER NOT NULL DEFAULT 0,
    "sync_progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3),

    CONSTRAINT "seat_geek_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_events" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "venue_id" TEXT,
    "name" TEXT NOT NULL,
    "source" "SystemSource" NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION DEFAULT 0,
    "lng" DOUBLE PRECISION DEFAULT 0,
    "date" TIMESTAMP(3),

    CONSTRAINT "system_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_event_performers" (
    "event_id" TEXT NOT NULL,
    "performer_id" TEXT NOT NULL,

    CONSTRAINT "system_event_performers_pkey" PRIMARY KEY ("event_id","performer_id")
);

-- CreateTable
CREATE TABLE "system_performers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "score" DOUBLE PRECISION,
    "source" "SystemSource" NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,

    CONSTRAINT "system_performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_genres" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source" "SystemSource" NOT NULL,
    "source_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "system_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_performer_genres" (
    "performer_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "system_performer_genres_pkey" PRIMARY KEY ("performer_id","genre_id")
);

-- CreateTable
CREATE TABLE "system_venues" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION DEFAULT 0,
    "lng" DOUBLE PRECISION DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "image_url" TEXT,
    "source" "SystemSource" NOT NULL,
    "source_id" TEXT,
    "source_url" TEXT,

    CONSTRAINT "system_venues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_events_lat_lng_idx" ON "system_events"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "system_events_source_source_id_key" ON "system_events"("source", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_performers_source_source_id_key" ON "system_performers"("source", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_genres_source_source_id_key" ON "system_genres"("source", "source_id");

-- CreateIndex
CREATE INDEX "system_venues_lat_lng_idx" ON "system_venues"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "system_venues_source_source_id_key" ON "system_venues"("source", "source_id");

-- AddForeignKey
ALTER TABLE "system_events" ADD CONSTRAINT "system_events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "system_venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_event_performers" ADD CONSTRAINT "system_event_performers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "system_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_event_performers" ADD CONSTRAINT "system_event_performers_performer_id_fkey" FOREIGN KEY ("performer_id") REFERENCES "system_performers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_performer_genres" ADD CONSTRAINT "system_performer_genres_performer_id_fkey" FOREIGN KEY ("performer_id") REFERENCES "system_performers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_performer_genres" ADD CONSTRAINT "system_performer_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "system_genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
