const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Završavam kapitalizaciju...\n')

  const user = await prisma.user.findUnique({
    where: { email: 'nvmihajlovic@gmail.com' }
  })

  // Find all _TEMP categories
  const tempExpense = await prisma.category.findMany({ 
    where: { 
      userId: user.id,
      name: { contains: '_TEMP' }
    }
  })
  
  console.log('📦 Završavam kategorije troškova:')
  for (const cat of tempExpense) {
    const originalName = cat.name.replace('_TEMP', '')
    const newName = originalName.charAt(0).toUpperCase() + originalName.slice(1)
    
    // Check if capitalized version already exists
    const exists = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: newName,
        id: { not: cat.id }
      }
    })
    
    if (exists) {
      // Delete the _TEMP one, keep the existing capitalized one
      await prisma.category.delete({ where: { id: cat.id } })
      console.log(`  🗑️  Obrisan duplikat: "${cat.name}" (već postoji "${newName}")`)
    } else {
      // Rename _TEMP to proper name
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: newName }
      })
      console.log(`  ✅ "${originalName}" → "${newName}"`)
    }
  }

  // Same for income categories
  const tempIncome = await prisma.incomeCategory.findMany({ 
    where: { 
      userId: user.id,
      name: { contains: '_TEMP' }
    }
  })
  
  console.log('\n💰 Završavam kategorije prihoda:')
  for (const cat of tempIncome) {
    const originalName = cat.name.replace('_TEMP', '')
    const newName = originalName.charAt(0).toUpperCase() + originalName.slice(1)
    
    const exists = await prisma.incomeCategory.findFirst({
      where: {
        userId: user.id,
        name: newName,
        id: { not: cat.id }
      }
    })
    
    if (exists) {
      await prisma.incomeCategory.delete({ where: { id: cat.id } })
      console.log(`  🗑️  Obrisan duplikat: "${cat.name}" (već postoji "${newName}")`)
    } else {
      await prisma.incomeCategory.update({
        where: { id: cat.id },
        data: { name: newName }
      })
      console.log(`  ✅ "${originalName}" → "${newName}"`)
    }
  }

  console.log('\n🎉 Sve kategorije završene!')
  
  const finalExpense = await prisma.category.count({ where: { userId: user.id } })
  const finalIncome = await prisma.incomeCategory.count({ where: { userId: user.id } })
  console.log(`📊 Ukupno: ${finalExpense} kategorija troškova + ${finalIncome} kategorija prihoda`)
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
