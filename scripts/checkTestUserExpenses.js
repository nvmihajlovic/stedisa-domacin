const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExpenses() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
    select: { id: true, name: true }
  });

  if (!user) {
    console.log('❌ Test user ne postoji');
    await prisma.$disconnect();
    return;
  }

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      amount: true,
      description: true,
      groupId: true,
      date: true
    }
  });

  const incomes = await prisma.income.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      amount: true,
      description: true,
      groupId: true,
      date: true
    }
  });

  console.log('\n🔍 TEST USER:', user.name, `(${user.id})`);
  console.log('\n📊 TROŠKOVI (' + expenses.length + '):');
  expenses.forEach(e => {
    console.log(`  - ${e.description}: ${e.amount} RSD | groupId: ${e.groupId || 'NULL'} | date: ${e.date.toISOString().split('T')[0]}`);
  });

  console.log('\n💰 PRIHODI (' + incomes.length + '):');
  incomes.forEach(i => {
    console.log(`  - ${i.description}: ${i.amount} RSD | groupId: ${i.groupId || 'NULL'} | date: ${i.date.toISOString().split('T')[0]}`);
  });

  console.log('\n💡 Ako želiš da obrišeš ove test podatke, pokreni:');
  console.log('   node scripts/deleteTestUserData.js\n');

  await prisma.$disconnect();
}

checkExpenses();
