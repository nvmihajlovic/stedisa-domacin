/**
 * Default categories that are automatically created for new users
 * and can be used to restore categories if needed
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "hrana i piće", icon: "ForkKnife", color: "#FFB4B4" },
  { name: "gorivo", icon: "GasPump", color: "#FFC999" },
  { name: "hemija", icon: "Drop", color: "#B8F0E8" },
  { name: "kozmetika", icon: "Sparkle", color: "#FFB8CC" },
  { name: "odeća", icon: "TShirt", color: "#C8F3E4" },
  { name: "obuća", icon: "ShoppingBag", color: "#FFE89E" },
  { name: "komunalije", icon: "House", color: "#A8CAFF" },
  { name: "energija", icon: "Lightning", color: "#FFF3B8" },
  { name: "pokućstvo", icon: "Armchair", color: "#E0C9F5" },
  { name: "restorani", icon: "ForkKnife", color: "#FFB8D1" },
  { name: "zabava", icon: "FilmSlate", color: "#C9E9F5" },
  { name: "putovanje", icon: "AirplaneTilt", color: "#FFD4DB" },
  { name: "stanarina", icon: "Buildings", color: "#D4C9ED" },
  { name: "pokloni", icon: "Gift", color: "#FFD0CC" },
  { name: "kredit", icon: "CreditCard", color: "#F5B3C4" },
  { name: "lična nega", icon: "User", color: "#FFD4C2" },
  { name: "rekreacija", icon: "Barbell", color: "#BAD0E8" },
  { name: "održavanje doma", icon: "Wrench", color: "#B8D4A8" },
  { name: "održavanje vozila", icon: "Car", color: "#A8BFD9" },
  { name: "registracija vozila", icon: "FileText", color: "#FFB8AC" },
  { name: "školarina", icon: "GraduationCap", color: "#B39ECF" },
  { name: "porezi", icon: "ChartBar", color: "#F5C9BF" },
  { name: "osiguranje", icon: "ShieldCheck", color: "#9BF0E8" },
  { name: "bankarski troškovi", icon: "Bank", color: "#E8D9C2" },
  { name: "alimentacija", icon: "UsersThree", color: "#F5B3AF" },
  { name: "pretplate", icon: "DeviceMobile", color: "#C9ABFF" },
  { name: "ostalo", icon: "Package", color: "#B8B8C9" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "lični dohodak", icon: "Money", color: "#9BF0C8", isLoanRepayment: false },
  { name: "prihod od rente", icon: "Buildings", color: "#88E8B8", isLoanRepayment: false },
  { name: "honorar", icon: "CurrencyCircleDollar", color: "#7ADDB0", isLoanRepayment: false },
  { name: "napojnica", icon: "Hand", color: "#6DD8C8", isLoanRepayment: false },
  { name: "ostalo", icon: "TrendUp", color: "#5CCCB8", isLoanRepayment: false },
];

/**
 * Ensures a user has default categories
 * Call this function after user login or when categories are empty
 */
export async function ensureUserHasCategories(userId: string, prisma: any) {
  // Check if user has any categories
  const existingExpenseCategories = await prisma.category.count({
    where: { userId }
  });

  const existingIncomeCategories = await prisma.incomeCategory.count({
    where: { userId }
  });

  // Add expense categories if none exist
  if (existingExpenseCategories === 0) {
    await prisma.category.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        userId
      }))
    });
    console.log(`✅ Created ${DEFAULT_EXPENSE_CATEGORIES.length} default expense categories for user ${userId}`);
  }

  // Add income categories if none exist
  if (existingIncomeCategories === 0) {
    await prisma.incomeCategory.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map(cat => ({
        ...cat,
        userId
      }))
    });
    console.log(`✅ Created ${DEFAULT_INCOME_CATEGORIES.length} default income categories for user ${userId}`);
  }
}
