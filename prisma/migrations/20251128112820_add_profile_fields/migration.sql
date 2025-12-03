-- AlterTable
ALTER TABLE "User" ADD COLUMN "chartType" TEXT;
ALTER TABLE "User" ADD COLUMN "dateFormat" TEXT;
ALTER TABLE "User" ADD COLUMN "fontSize" TEXT;
ALTER TABLE "User" ADD COLUMN "notifications" BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "primaryColor" TEXT;
ALTER TABLE "User" ADD COLUMN "recurringNotifications" BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN "theme" TEXT;
