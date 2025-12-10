const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: 'cmiz4bdbp0000rva4m38rd1uk' },
      select: { name: true, id: true, icon: true },
      orderBy: { name: 'asc' }
    });
    
    console.log(`\nNađeno ${categories.length} kategorija:\n`);
    categories.forEach(c => {
      console.log(`  ${c.icon || '📁'} ${c.name} (${c.id})`);
    });
    
    const hasStanarina = categories.some(c => c.name === 'Stanarina i komunalije');
    const hasRezije = categories.some(c => c.name === 'Režije');
    
    console.log(`\n🔍 "Stanarina i komunalije": ${hasStanarina ? '✅ POSTOJI' : '❌ NE POSTOJI'}`);
    console.log(`🔍 "Režije": ${hasRezije ? '✅ POSTOJI' : '❌ NE POSTOJI'}`);
    
  } catch (error) {
    console.error('Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
