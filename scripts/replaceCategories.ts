/**
 * Script za POTPUNU ZAMENU kategorija novim optimizovanim kategorijama
 * UPOZORENJE: Briše SVE stare kategorije i kreira nove!
 * Pokreni sa: npx tsx scripts/replaceCategories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
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
];

const INCOME_CATEGORIES = [
  { name: "Plata", icon: "Money", color: "#1FBFA4" },
  { name: "Honorar", icon: "Briefcase", color: "#4DB5FF" },
  { name: "Bonus", icon: "Gift", color: "#FFB84D" },
  { name: "Dividenda", icon: "TrendUp", color: "#45D38A" },
  { name: "Renta", icon: "House", color: "#A78BFA" },
  { name: "Prodaja", icon: "ShoppingCart", color: "#FF8A4D" },
  { name: "Pokloni", icon: "Gift", color: "#FF6B9D" },
  { name: "Ostalo", icon: "CurrencyCircleDollar", color: "#95A5A6" }
];

async function replaceCategories() {
  console.log('\n🔄 ZAMENA KATEGORIJA - BRISANJE I KREIRANJE NOVIH\n');
  console.log('⚠️  UPOZORENJE: Ovo će obrisati SVE postojeće kategorije!\n');
  
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('❌ Nema korisnika u bazi.');
    return;
  }

  console.log(`✅ Pronađeno ${users.length} korisnika\n`);

  for (const user of users) {
    console.log(`\n👤 Procesiranje korisnika: ${user.name || user.email}`);
    
    // BRISANJE STARIH KATEGORIJA
    console.log('  🗑️  Brisanje starih kategorija troškova...');
    const deletedExpenses = await prisma.category.deleteMany({
      where: { userId: user.id }
    });
    console.log(`     Obrisano: ${deletedExpenses.count} kategorija`);

    console.log('  🗑️  Brisanje starih kategorija prihoda...');
    const deletedIncomes = await prisma.incomeCategory.deleteMany({
      where: { userId: user.id }
    });
    console.log(`     Obrisano: ${deletedIncomes.count} kategorija`);

    // KREIRANJE NOVIH KATEGORIJA
    console.log('  ➕ Kreiranje novih kategorija troškova...');
    for (const category of EXPENSE_CATEGORIES) {
      await prisma.category.create({
        data: {
          ...category,
          userId: user.id,
          isActive: true
        }
      });
    }
    console.log(`     ✅ Kreirano: ${EXPENSE_CATEGORIES.length} kategorija`);

    console.log('  ➕ Kreiranje novih kategorija prihoda...');
    for (const category of INCOME_CATEGORIES) {
      await prisma.incomeCategory.create({
        data: {
          ...category,
          userId: user.id,
          isActive: true,
          isLoanRepayment: false
        }
      });
    }
    console.log(`     ✅ Kreirano: ${INCOME_CATEGORIES.length} kategorija`);
  }

  console.log('\n\n🎉 Zamena kategorija završena uspešno!');
  console.log('\n📊 Nova struktura:');
  console.log(`   • ${EXPENSE_CATEGORIES.length} kategorija troškova po korisniku`);
  console.log(`   • ${INCOME_CATEGORIES.length} kategorija prihoda po korisniku`);
  console.log(`   • Ukupno: ${EXPENSE_CATEGORIES.length + INCOME_CATEGORIES.length} kategorija\n`);
}

async function main() {
  try {
    await replaceCategories();
  } catch (error) {
    console.error('\n❌ Greška:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
