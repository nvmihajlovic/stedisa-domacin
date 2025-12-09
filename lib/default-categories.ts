/**
 * Default categories that are automatically created for new users
 * and can be used to restore categories if needed
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Hrana i piće", icon: "ForkKnife", color: "#FF6B9D", isActive: true },
  { name: "Restoran i kafići", icon: "Coffee", color: "#FFB84D", isActive: true },
  { name: "Stanovanje i komunalije", icon: "House", color: "#4DB5FF", isActive: true },
  { name: "Popravke i održavanje doma", icon: "Wrench", color: "#A78BFA", isActive: true },
  { name: "Vozilo i transport", icon: "Car", color: "#FF5757", isActive: true },
  { name: "Zdravlje i nega", icon: "FirstAid", color: "#45D38A", isActive: true },
  { name: "Rekreacija i sport", icon: "Barbell", color: "#FF8A4D", isActive: true },
  { name: "Zabava i izlasci", icon: "GameController", color: "#C339B5", isActive: true },
  { name: "Deca i porodica", icon: "Users", color: "#4ECFFF", isActive: true },
  { name: "Kućni ljubimci", icon: "PawPrint", color: "#FFB347", isActive: true },
  { name: "Odeća i obuća", icon: "TShirt", color: "#FF6B9D", isActive: true },
  { name: "Pretplate i članarine", icon: "CreditCard", color: "#8A63D2", isActive: true },
  { name: "Putovanja", icon: "Airplane", color: "#5DADE2", isActive: true },
  { name: "Nameštaj i oprema", icon: "Armchair", color: "#95A5A6", isActive: true },
  { name: "Tehnika i uređaji", icon: "Laptop", color: "#3498DB", isActive: true },
  { name: "Pokloni i donacije", icon: "Gift", color: "#E74C3C", isActive: true },
  { name: "Finansije i administracija", icon: "Bank", color: "#16A085", isActive: true },
  { name: "Alimentacija", icon: "Scales", color: "#9B59B6", isActive: true },
  { name: "Ostalo", icon: "Question", color: "#95A5A6", isActive: true }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Plata", icon: "Money", color: "#1FBFA4", isLoanRepayment: false, isActive: true },
  { name: "Honorar", icon: "Briefcase", color: "#4DB5FF", isLoanRepayment: false, isActive: true },
  { name: "Bonus", icon: "Gift", color: "#FFB84D", isLoanRepayment: false, isActive: true },
  { name: "Dividenda", icon: "TrendUp", color: "#45D38A", isLoanRepayment: false, isActive: true },
  { name: "Renta", icon: "House", color: "#A78BFA", isLoanRepayment: false, isActive: true },
  { name: "Prodaja", icon: "ShoppingCart", color: "#FF8A4D", isLoanRepayment: false, isActive: true },
  { name: "Pokloni", icon: "Gift", color: "#FF6B9D", isLoanRepayment: false, isActive: true },
  { name: "Ostalo", icon: "CurrencyCircleDollar", color: "#95A5A6", isLoanRepayment: false, isActive: true },
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
