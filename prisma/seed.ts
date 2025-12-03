import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../lib/default-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create user from backup
  const hashedPassword = await bcrypt.hash('Palamida18!', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'nvmihajlovic@gmail.com',
      password: hashedPassword,
      name: 'Nikola Mihajlovic',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log('✅ User created:', user.email)

  // Seed default categories using centralized definitions
  await prisma.category.createMany({
    data: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      userId: user.id
    }))
  });

  await prisma.incomeCategory.createMany({
    data: DEFAULT_INCOME_CATEGORIES.map(cat => ({
      ...cat,
      userId: user.id
    }))
  });

  console.log('✅ Categories created')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
