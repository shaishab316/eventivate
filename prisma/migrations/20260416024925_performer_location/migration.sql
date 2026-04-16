-- AlterTable
ALTER TABLE "system_performers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "lng" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT;
