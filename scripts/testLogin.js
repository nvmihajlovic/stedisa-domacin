const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'test@test.com';
  const password = 'test123';
  
  console.log('\n🔍 Tražim korisnika:', email);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.log('❌ Korisnik ne postoji!');
    return;
  }
  
  console.log('✅ Korisnik pronađen:');
  console.log('  - Email:', user.email);
  console.log('  - Name:', user.name);
  console.log('  - Email Verified:', user.emailVerified);
  console.log('  - Password Hash:', user.password.substring(0, 20) + '...');
  
  console.log('\n🔑 Testiram password...');
  const isValid = await bcrypt.compare(password, user.password);
  
  if (isValid) {
    console.log('✅ Password je TAČAN!');
  } else {
    console.log('❌ Password je NETAČAN!');
    
    // Kreiraj novi hash
    console.log('\n🔄 Kreiram novi hash...');
    const newHash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { email },
      data: { password: newHash }
    });
    
    console.log('✅ Password ažuriran!');
    
    // Testiranje ponovo
    const retest = await bcrypt.compare(password, newHash);
    console.log('🔍 Nova provera:', retest ? 'OK' : 'FAIL');
  }
  
  await prisma.$disconnect();
}

testLogin();
