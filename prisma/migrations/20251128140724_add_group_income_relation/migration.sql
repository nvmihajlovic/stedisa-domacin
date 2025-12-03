-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringExpenseId" TEXT,
    "groupId" TEXT,
    "splitAmount" REAL,
    "paidBy" TEXT,
    "currency" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expense_recurringExpenseId_fkey" FOREIGN KEY ("recurringExpenseId") REFERENCES "RecurringExpense" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "categoryId", "createdAt", "currency", "date", "description", "groupId", "id", "isRecurring", "note", "paidBy", "receiptUrl", "recurringExpenseId", "splitAmount", "updatedAt", "userId") SELECT "amount", "categoryId", "createdAt", "currency", "date", "description", "groupId", "id", "isRecurring", "note", "paidBy", "receiptUrl", "recurringExpenseId", "splitAmount", "updatedAt", "userId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE TABLE "new_Income" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringIncomeId" TEXT,
    "groupId" TEXT,
    "loanRepaymentAmount" REAL,
    "currency" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Income_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IncomeCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Income_recurringIncomeId_fkey" FOREIGN KEY ("recurringIncomeId") REFERENCES "RecurringIncome" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Income_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Income" ("amount", "categoryId", "createdAt", "currency", "date", "description", "id", "isRecurring", "loanRepaymentAmount", "note", "recurringIncomeId", "updatedAt", "userId") SELECT "amount", "categoryId", "createdAt", "currency", "date", "description", "id", "isRecurring", "loanRepaymentAmount", "note", "recurringIncomeId", "updatedAt", "userId" FROM "Income";
DROP TABLE "Income";
ALTER TABLE "new_Income" RENAME TO "Income";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
