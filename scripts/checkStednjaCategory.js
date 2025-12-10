const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Štednja category...\n')

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: 'tednja' } },
        { isSavings: true }
      ]
    },
    include: {
      user: { select: { email: true } }
    }
  })

  console.log(`Found ${categories.length} Štednja/Savings categories:\n`)
  
  categories.forEach(cat => {
    console.log(`ID: ${cat.id}`)
    console.log(`Name: ${cat.name}`)
    console.log(`isSavings: ${cat.isSavings}`)
    console.log(`color: ${cat.color}`)
    console.log(`User: ${cat.user.email}`)
    console.log()
  })

  await prisma.$disconnect()
}

main().catch(console.error)
