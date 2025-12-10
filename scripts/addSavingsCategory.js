const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addSavingsCategory() {
  try {
    // Get all users
    const users = await prisma.user.findMany()
    
    console.log(`Found ${users.length} users`)
    
    for (const user of users) {
      // Check if user already has a Štednja category
      const existingSavingsCategory = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: 'Štednja'
        }
      })
      
      if (existingSavingsCategory) {
        // Update existing category to be marked as savings
        await prisma.category.update({
          where: { id: existingSavingsCategory.id },
          data: {
            isSavings: true,
            color: '#FFD700',
            icon: 'CurrencyCircleDollar'
          }
        })
        console.log(`✅ Updated existing Štednja category for user ${user.email}`)
      } else {
        // Create new Štednja category
        await prisma.category.create({
          data: {
            name: 'Štednja',
            userId: user.id,
            color: '#FFD700',
            icon: 'CurrencyCircleDollar',
            isSavings: true,
            isActive: true
          }
        })
        console.log(`✅ Created Štednja category for user ${user.email}`)
      }
    }
    
    console.log('\n🎉 Successfully added/updated Štednja category for all users!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSavingsCategory()
