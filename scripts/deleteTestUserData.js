const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTestUserData() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
  });

  if (!user) {
    console.log('❌ Test user ne postoji');
    await prisma.$disconnect();
    return;
  }

  console.log('🗑️  Brisanje podataka za test usera...\n');

  const deletedExpenses = await prisma.expense.deleteMany({
    where: { userId: user.id }
  });

  const deletedIncomes = await prisma.income.deleteMany({
    where: { userId: user.id }
  });

  console.log(`✅ Obrisano ${deletedExpenses.count} troškova`);
  console.log(`✅ Obrisano ${deletedIncomes.count} prihoda`);
  console.log('\n🎉 Test user sada nema podatke!\n');

  await prisma.$disconnect();
}

deleteTestUserData();
