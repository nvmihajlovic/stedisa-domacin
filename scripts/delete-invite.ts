import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteInvite() {
  try {
    const result = await prisma.inviteToken.deleteMany({
      where: {
        email: 'smeshka1@gmail.com'
      }
    })
    
    console.log(`✓ Obrisano ${result.count} pozivnica za smeshka1@gmail.com`)
  } catch (error) {
    console.error('✗ Greška:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteInvite()
