-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('DAYS_7', 'DAYS_10', 'DAYS_15', 'DAYS_30', 'YEAR_1', 'CUSTOM');

-- AlterTable User - Add activeGroupId
ALTER TABLE "User" ADD COLUMN "activeGroupId" TEXT;

-- AlterTable Group - Add new columns
ALTER TABLE "Group" ADD COLUMN "type" "GroupType" NOT NULL DEFAULT 'PERMANENT';
ALTER TABLE "Group" ADD COLUMN "durationType" "DurationType";
ALTER TABLE "Group" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Group" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Group" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeGroupId_fkey" FOREIGN KEY ("activeGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
