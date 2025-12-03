-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "details" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "settledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settlement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorCategoryMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorCategoryMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorCategoryMapping_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RSD',
    "language" TEXT NOT NULL DEFAULT 'sr',
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT,
    "phone" TEXT,
    "dateFormat" TEXT,
    "notifications" BOOLEAN DEFAULT true,
    "recurringNotifications" BOOLEAN DEFAULT true,
    "theme" TEXT,
    "primaryColor" TEXT,
    "fontSize" TEXT,
    "chartType" TEXT
);
INSERT INTO "new_User" ("chartType", "createdAt", "currency", "dateFormat", "email", "emailVerified", "fontSize", "id", "language", "name", "notifications", "password", "phone", "primaryColor", "recurringNotifications", "theme", "updatedAt", "username", "verificationToken", "verificationTokenExpiry") SELECT "chartType", "createdAt", "currency", "dateFormat", "email", "emailVerified", "fontSize", "id", "language", "name", "notifications", "password", "phone", "primaryColor", "recurringNotifications", "theme", "updatedAt", "username", "verificationToken", "verificationTokenExpiry" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Settlement_groupId_idx" ON "Settlement"("groupId");

-- CreateIndex
CREATE INDEX "Settlement_fromUserId_idx" ON "Settlement"("fromUserId");

-- CreateIndex
CREATE INDEX "Settlement_toUserId_idx" ON "Settlement"("toUserId");

-- CreateIndex
CREATE INDEX "VendorCategoryMapping_userId_idx" ON "VendorCategoryMapping"("userId");

-- CreateIndex
CREATE INDEX "VendorCategoryMapping_vendorName_idx" ON "VendorCategoryMapping"("vendorName");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCategoryMapping_userId_vendorName_key" ON "VendorCategoryMapping"("userId", "vendorName");
