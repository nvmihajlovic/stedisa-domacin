const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewUser() {
  const email = 'test@test.com';
  const password = 'test123';
  
  // Proveri da li korisnik već postoji
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log('\n⚠️  Korisnik već postoji, brišem ga...');
    await prisma.user.delete({ where: { email } });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Test User',
      emailVerified: true
    }
  });
  
  console.log('\n✅ Novi korisnik kreiran!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\n🔄 Dodajem kategorije...\n');
  
  // Učitaj kategorije
  const DEFAULT_EXPENSE_CATEGORIES = [
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

  const DEFAULT_INCOME_CATEGORIES = [
    { name: "Plata", icon: "Money", color: "#1FBFA4", isLoanRepayment: false, isActive: true },
    { name: "Honorar", icon: "Briefcase", color: "#4DB5FF", isLoanRepayment: false, isActive: true },
    { name: "Bonus", icon: "Gift", color: "#FFB84D", isLoanRepayment: false, isActive: true },
    { name: "Dividenda", icon: "TrendUp", color: "#45D38A", isLoanRepayment: false, isActive: true },
    { name: "Renta", icon: "House", color: "#A78BFA", isLoanRepayment: false, isActive: true },
    { name: "Prodaja", icon: "ShoppingCart", color: "#FF8A4D", isLoanRepayment: false, isActive: true },
    { name: "Pokloni", icon: "Gift", color: "#FF6B9D", isLoanRepayment: false, isActive: true },
    { name: "Ostalo", icon: "CurrencyCircleDollar", color: "#95A5A6", isLoanRepayment: false, isActive: true }
  ];
  
  await prisma.category.createMany({
    data: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      userId: user.id
    }))
  });
  
  await prisma.incomeCategory.createMany({
    data: DEFAULT_INCOME_CATEGORIES.map(cat => ({
      ...cat,
      userId: user.id
    }))
  });
  
  console.log('✅ Kreirano', DEFAULT_EXPENSE_CATEGORIES.length, 'kategorija troškova');
  console.log('✅ Kreirano', DEFAULT_INCOME_CATEGORIES.length, 'kategorija prihoda');
  console.log('\n🎉 Sve spremno!\n');
  
  await prisma.$disconnect();
}

createNewUser();
