const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableAIAssistant() {
  const email = 'test@test.com';
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: { id: true, name: true, aiAssistantEnabled: true }
  });
  
  if (!user) {
    console.log('❌ Test user ne postoji');
    await prisma.$disconnect();
    return;
  }

  console.log('\n📊 Trenutni status:');
  console.log('User:', user.name);
  console.log('AI Assistant:', user.aiAssistantEnabled);

  // Omogući AI asistenta
  await prisma.user.update({
    where: { email },
    data: { aiAssistantEnabled: true }
  });

  console.log('\n✅ AI Assistant omogućen!');
  console.log('💡 Također obriši localStorage u browseru:');
  console.log('   localStorage.removeItem("ai_assistant_enabled")');
  console.log('   ili postavi:');
  console.log('   localStorage.setItem("ai_assistant_enabled", "true")');
  console.log('\n');

  await prisma.$disconnect();
}

enableAIAssistant();
