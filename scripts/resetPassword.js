const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'nvmihajlovic@gmail.com';
  const newPassword = 'Password123!';
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { 
      password: hashedPassword,
      emailVerified: true 
    }
  });
  
  console.log('\n✅ Password resetovan!');
  console.log('Email:', email);
  console.log('Password:', newPassword);
  console.log('\n');
  
  await prisma.$disconnect();
}

resetPassword();
