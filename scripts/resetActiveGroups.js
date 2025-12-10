const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetActiveGroups() {
  try {
    // Find all users with activeGroupId set
    const usersWithActiveGroup = await prisma.user.findMany({
      where: {
        activeGroupId: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        activeGroupId: true
      }
    })

    console.log(`Found ${usersWithActiveGroup.length} users with active groups`)

    for (const user of usersWithActiveGroup) {
      // Check if the active group still exists
      const groupExists = await prisma.group.findUnique({
        where: { id: user.activeGroupId }
      })

      if (!groupExists) {
        console.log(`❌ Group ${user.activeGroupId} doesn't exist for user ${user.email}`)
        
        // Reset activeGroupId to null
        await prisma.user.update({
          where: { id: user.id },
          data: { activeGroupId: null }
        })
        
        console.log(`✅ Reset activeGroupId for ${user.email}`)
      } else {
        console.log(`✅ Group ${user.activeGroupId} exists for ${user.email}`)
      }
    }

    console.log('\n🎉 Finished checking and resetting active groups!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetActiveGroups()
