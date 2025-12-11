const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function recreateGroup() {
  try {
    console.log('🔧 Kreiram grupu Mihajlovići ponovo...')
    
    // Pronađi admin korisnika
    const adminUser = await prisma.user.findUnique({
      where: { email: 'nvmihajlovic@gmail.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin korisnik nije pronađen')
      return
    }
    
    // Pronađi dummy korisnika
    const dummyUser = await prisma.user.findUnique({
      where: { email: 'dummy@test.com' }
    })
    
    if (!dummyUser) {
      console.log('❌ Dummy korisnik nije pronađen')
      return
    }
    
    // Kreiraj grupu
    const group = await prisma.group.create({
      data: {
        name: 'Mihajlovići',
        description: 'Porodična grupa za praćenje zajedničkih troškova',
        ownerId: adminUser.id,
      }
    })
    
    console.log('✅ Grupa kreirana:', group.name)
    
    // Dodaj admin korisnika kao člana (owner)
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: adminUser.id,
        role: 'owner',
        permissions: 'view,add,edit,delete,invite,manage'
      }
    })
    
    console.log('✅ Admin korisnik dodat u grupu')
    
    // Dodaj dummy korisnika kao člana
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: dummyUser.id,
        role: 'member',
        permissions: 'view,add'
      }
    })
    
    console.log('✅ Dummy korisnik dodat u grupu')
    
    // Ažuriraj dummy korisnikove transakcije da imaju groupId
    await prisma.expense.updateMany({
      where: { userId: dummyUser.id },
      data: { groupId: group.id }
    })
    
    await prisma.income.updateMany({
      where: { userId: dummyUser.id },
      data: { groupId: group.id }
    })
    
    console.log('✅ Transakcije dummy korisnika povezane sa grupom')
    
    console.log('\n🎉 SVE ZAVRŠENO!')
    console.log('👥 Grupa: Mihajlovići')
    console.log('👤 Članovi: nvmihajlovic@gmail.com (owner), dummy@test.com (member)')
    console.log('📊 Nova statistika će biti dostupna u grupi!')
    
  } catch (error) {
    console.error('❌ GREŠKA:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

recreateGroup()
