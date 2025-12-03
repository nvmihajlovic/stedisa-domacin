import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'nvmihajlovic@gmail.com'
  const password = 'pass123'
  const name = 'Nemanja'

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: true,
      role: 'admin',
      status: 'active',
    },
  })

  console.log('✅ User created successfully!')
  console.log('📧 Email:', email)
  console.log('🔑 Password:', password)
  console.log('👤 Name:', name)
  console.log('🆔 ID:', user.id)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
