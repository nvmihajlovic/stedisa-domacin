/**
 * Script za inicijalizaciju optimizovanih kategorija
 * Pokreni sa: npx tsx scripts/seedOptimizedCategories.ts
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

async function seedCategories() {
  console.log('🌱 Pokretanje seed-a kategorija...\n');

  // Dohvati sve korisnike
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('❌ Nema korisnika u bazi. Prvo kreiraj korisnike.');
    return;
  }

  console.log(`✅ Pronađeno ${users.length} korisnika\n`);

  for (const user of users) {
    console.log(`\n👤 Seed kategorija za korisnika: ${user.name || user.email}`);
    
    // Proveri da li korisnik već ima kategorije
    const existingExpenseCategories = await prisma.category.count({
      where: { userId: user.id }
    });
    
    const existingIncomeCategories = await prisma.incomeCategory.count({
      where: { userId: user.id }
    });

    // Kategorije troškova
    if (existingExpenseCategories === 0) {
      console.log('  📝 Kreiram kategorije troškova...');
      for (const category of EXPENSE_CATEGORIES) {
        await prisma.category.create({
          data: {
            ...category,
            userId: user.id,
            isActive: true
          }
        });
      }
      console.log(`  ✅ Kreirano ${EXPENSE_CATEGORIES.length} kategorija troškova`);
    } else {
      console.log(`  ℹ️  Korisnik već ima ${existingExpenseCategories} kategorija troškova - preskačem`);
    }

    // Kategorije prihoda
    if (existingIncomeCategories === 0) {
      console.log('  📝 Kreiram kategorije prihoda...');
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
      console.log(`  ✅ Kreirano ${INCOME_CATEGORIES.length} kategorija prihoda`);
    } else {
      console.log(`  ℹ️  Korisnik već ima ${existingIncomeCategories} kategorija prihoda - preskačem`);
    }
  }

  console.log('\n\n🎉 Seed završen uspešno!');
  console.log('\n📊 Statistika:');
  console.log(`   • ${EXPENSE_CATEGORIES.length} kategorija troškova po korisniku`);
  console.log(`   • ${INCOME_CATEGORIES.length} kategorija prihoda po korisniku`);
  console.log(`   • Ukupno: ${EXPENSE_CATEGORIES.length + INCOME_CATEGORIES.length} kategorija\n`);
}

async function updateExistingCategories() {
  console.log('\n🔄 Ažuriranje postojećih kategorija...\n');
  
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    console.log(`\n👤 Ažuriranje za korisnika: ${user.name || user.email}`);
    
    // Ažuriraj kategorije troškova
    for (const category of EXPENSE_CATEGORIES) {
      const existing = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: category.name
        }
      });

      if (existing) {
        await prisma.category.update({
          where: { id: existing.id },
          data: {
            icon: category.icon,
            color: category.color
          }
        });
        console.log(`  ✅ Ažuriran: ${category.name}`);
      } else {
        await prisma.category.create({
          data: {
            ...category,
            userId: user.id,
            isActive: true
          }
        });
        console.log(`  ➕ Kreiran: ${category.name}`);
      }
    }

    // Ažuriraj kategorije prihoda
    for (const category of INCOME_CATEGORIES) {
      const existing = await prisma.incomeCategory.findFirst({
        where: {
          userId: user.id,
          name: category.name
        }
      });

      if (existing) {
        await prisma.incomeCategory.update({
          where: { id: existing.id },
          data: {
            icon: category.icon,
            color: category.color
          }
        });
        console.log(`  ✅ Ažuriran: ${category.name}`);
      } else {
        await prisma.incomeCategory.create({
          data: {
            ...category,
            userId: user.id,
            isActive: true,
            isLoanRepayment: false
          }
        });
        console.log(`  ➕ Kreiran: ${category.name}`);
      }
    }
  }
  
  console.log('\n✨ Ažuriranje završeno!');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldUpdate = args.includes('--update');

  try {
    if (shouldUpdate) {
      await updateExistingCategories();
    } else {
      await seedCategories();
    }
  } catch (error) {
    console.error('\n❌ Greška prilikom seed-a:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
