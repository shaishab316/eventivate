/*
  Warnings:

  - Changed the type of `profile_type` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "profile_type",
ADD COLUMN     "profile_type" "EUserRole" NOT NULL;

-- DropEnum
DROP TYPE "ProfileType";
