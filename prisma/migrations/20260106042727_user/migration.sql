/*
  Warnings:

  - A unique constraint covering the columns `[sl]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "sl" SERIAL NOT NULL,
ALTER COLUMN "avatar" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_sl_key" ON "users"("sl");
