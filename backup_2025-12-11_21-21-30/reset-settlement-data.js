const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetData() {
  // Delete pending settlement
  await prisma.settlement.deleteMany({
    where: { status: 'PENDING' }
  })
  console.log('✓ Deleted pending settlements')
  
  // Reset splits to unpaid
  await prisma.split.updateMany({
    where: {
      groupId: 'cmink9j4d0003rvjcz93z57ia'
    },
    data: {
      isPaid: false,
      paidAt: null
    }
  })
  console.log('✓ Reset splits to unpaid')
  
  await prisma.$disconnect()
  console.log('\n✅ Data reset complete!')
}

resetData()
