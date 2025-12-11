const { PrismaClient } = require('@prisma/client')

// Connect to backup database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db.backup-2025-11-27_15-42-30'
    }
  }
})

async function main() {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      icon: true,
      color: true
    }
  })
  
  const incomeCategories = await prisma.incomeCategory.findMany({
    select: {
      name: true,
      icon: true,
      color: true
    }
  })
  
  console.log('\n📦 EXPENSE CATEGORIES FROM BACKUP:')
  categories.forEach(cat => {
    console.log(`{ name: '${cat.name}', icon: '${cat.icon}', color: '${cat.color}' },`)
  })
  
  console.log('\n💰 INCOME CATEGORIES FROM BACKUP:')
  incomeCategories.forEach(cat => {
    console.log(`{ name: '${cat.name}', icon: '${cat.icon}', color: '${cat.color}' },`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
