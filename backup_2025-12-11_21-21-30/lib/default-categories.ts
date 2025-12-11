/**
 * Default categories that are automatically created for new users
 * and can be used to restore categories if needed
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Hrana i piće", icon: "ForkKnife", color: "#E09BA0", isActive: true },
  { name: "Restoran i kafići", icon: "Coffee", color: "#FFB84D", isActive: true },
  { name: "Stanovanje i komunalije", icon: "House", color: "#7BA5D1", isActive: true },
  { name: "Popravke i održavanje doma", icon: "Wrench", color: "#9F87C7", isActive: true },
  { name: "Vozilo i transport", icon: "Car", color: "#D68B8B", isActive: true },
  { name: "Zdravlje i nega", icon: "FirstAid", color: "#7EC4A3", isActive: true },
  { name: "Rekreacija i sport", icon: "Barbell", color: "#E6A574", isActive: true },
  { name: "Zabava i izlasci", icon: "GameController", color: "#B97BA8", isActive: true },
  { name: "Deca i porodica", icon: "Users", color: "#7DC4E4", isActive: true },
  { name: "Kućni ljubimci", icon: "PawPrint", color: "#E6B880", isActive: true },
  { name: "Odeća i obuća", icon: "TShirt", color: "#D896A8", isActive: true },
  { name: "Pretplate i članarine", icon: "CreditCard", color: "#9F8BC7", isActive: true },
  { name: "Putovanja", icon: "Airplane", color: "#85B8D9", isActive: true },
  { name: "Nameštaj i oprema", icon: "Armchair", color: "#A5B4BA", isActive: true },
  { name: "Tehnika i uređaji", icon: "Laptop", color: "#7BA3C7", isActive: true },
  { name: "Pokloni i donacije", icon: "Gift", color: "#D18B8B", isActive: true },
  { name: "Finansije i administracija", icon: "Bank", color: "#6FB39E", isActive: true },
  { name: "Alimentacija", icon: "Scales", color: "#B38BC7", isActive: true },
  { name: "Ostalo", icon: "Question", color: "#A5B4BA", isActive: true }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Plata", icon: "Money", color: "#6FB39E", isLoanRepayment: false, isActive: true },
  { name: "Honorar", icon: "Briefcase", color: "#7BA5D1", isLoanRepayment: false, isActive: true },
  { name: "Bonus", icon: "Gift", color: "#E6B880", isLoanRepayment: false, isActive: true },
  { name: "Dividenda", icon: "TrendUp", color: "#7EC4A3", isLoanRepayment: false, isActive: true },
  { name: "Renta", icon: "House", color: "#9F87C7", isLoanRepayment: false, isActive: true },
  { name: "Prodaja", icon: "ShoppingCart", color: "#E6A574", isLoanRepayment: false, isActive: true },
  { name: "Pokloni", icon: "Gift", color: "#E09BA0", isLoanRepayment: false, isActive: true },
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
