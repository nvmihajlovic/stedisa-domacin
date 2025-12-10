const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
    select: {
      name: true,
      aiAssistantEnabled: true
    }
  });

  console.log('\n📊 Test User AI Assistant Status:');
  console.log('Name:', user?.name);
  console.log('aiAssistantEnabled:', user?.aiAssistantEnabled);
  console.log('Type:', typeof user?.aiAssistantEnabled);
  console.log('\n');

  await prisma.$disconnect();
})();
