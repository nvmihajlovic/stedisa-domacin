const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  const users = await prisma.user.findMany();
  console.log('\n=== KORISNICI ===');
  console.log('Broj korisnika:', users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.name})`));
  
  if (users.length > 0) {
    const userId = users[0].id;
    const expenseCategories = await prisma.category.findMany({ where: { userId } });
    const incomeCategories = await prisma.incomeCategory.findMany({ where: { userId } });
    
    console.log('\n=== KATEGORIJE TROŠKOVA ===');
    console.log('Broj:', expenseCategories.length);
    expenseCategories.forEach(c => console.log(`- ${c.name} (${c.icon})`));
    
    console.log('\n=== KATEGORIJE PRIHODA ===');
    console.log('Broj:', incomeCategories.length);
    incomeCategories.forEach(c => console.log(`- ${c.name} (${c.icon})`));
  }
  
  await prisma.$disconnect();
}

checkDatabase();
