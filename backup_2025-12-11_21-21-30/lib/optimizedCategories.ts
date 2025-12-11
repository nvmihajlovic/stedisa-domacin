// Optimizovane kategorije sa Phosphor ikonama

export const EXPENSE_CATEGORIES = [
  { name: "Hrana i piće", icon: "ForkKnife", color: "#FF6B9D" },
  { name: "Restoran i kafići", icon: "Coffee", color: "#FFB84D" },
  { name: "Stanovanje i komunalije", icon: "House", color: "#4DB5FF" },
  { name: "Popravke i održavanje doma", icon: "Wrench", color: "#A78BFA" },
  { name: "Vozilo i transport", icon: "Car", color: "#FF5757" },
  { name: "Zdravlje i nega", icon: "FirstAid", color: "#45D38A" },
  { name: "Rekreacija i sport", icon: "Barbell", color: "#FF8A4D" },
  { name: "Zabava i izlasci", icon: "GameController", color: "#C339B5" },
  { name: "Deca i porodica", icon: "Users", color: "#4ECFFF" },
  { name: "Kućni ljubimci", icon: "PawPrint", color: "#FFB347" },
  { name: "Odeća i obuća", icon: "TShirt", color: "#FF6B9D" },
  { name: "Pretplate i članarine", icon: "CreditCard", color: "#8A63D2" },
  { name: "Putovanja", icon: "Airplane", color: "#5DADE2" },
  { name: "Nameštaj i oprema", icon: "Armchair", color: "#95A5A6" },
  { name: "Tehnika i uređaji", icon: "Laptop", color: "#3498DB" },
  { name: "Pokloni i donacije", icon: "Gift", color: "#E74C3C" },
  { name: "Finansije i administracija", icon: "Bank", color: "#16A085" },
  { name: "Alimentacija", icon: "Scales", color: "#9B59B6" },
  { name: "Ostalo", icon: "Question", color: "#95A5A6" }
] as const;

export const INCOME_CATEGORIES = [
  { name: "Plata", icon: "Money", color: "#1FBFA4" },
  { name: "Honorar", icon: "Briefcase", color: "#4DB5FF" },
  { name: "Bonus", icon: "Gift", color: "#FFB84D" },
  { name: "Dividenda", icon: "TrendUp", color: "#45D38A" },
  { name: "Renta", icon: "House", color: "#A78BFA" },
  { name: "Prodaja", icon: "ShoppingCart", color: "#FF8A4D" },
  { name: "Pokloni", icon: "Gift", color: "#FF6B9D" },
  { name: "Ostalo", icon: "CurrencyCircleDollar", color: "#95A5A6" }
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
