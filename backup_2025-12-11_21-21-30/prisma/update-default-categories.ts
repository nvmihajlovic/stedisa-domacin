import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDefaultCategories() {
  console.log('🔄 Ažuriram default kategorije za sve korisnike...\n')

  try {
    // Uzmi sve korisnike
    const users = await prisma.user.findMany()
    
    if (users.length === 0) {
      console.log('⚠️  Nema korisnika u bazi')
      return
    }

    console.log(`📋 Pronađeno ${users.length} korisnika\n`)

    // Default kategorije troškova sa Phosphor ikonama
    const defaultExpenseCategories = [
      { name: 'Hrana i piće', icon: 'ShoppingCart', color: '#FF6B6B' },
      { name: 'Gorivo', icon: 'GasPump', color: '#4ECDC4' },
      { name: 'Hemija', icon: 'Drop', color: '#FFE66D' },
      { name: 'Kozmetika', icon: 'Sparkle', color: '#FFA5D8' },
      { name: 'Odeća', icon: 'TShirt', color: '#C7CEEA' },
      { name: 'Obuća', icon: 'Sneaker', color: '#A8E6CF' },
      { name: 'Komunalije', icon: 'House', color: '#FF8B94' },
      { name: 'Energija', icon: 'Lightning', color: '#FFD93D' },
      { name: 'Pokućstvo', icon: 'Armchair', color: '#95E1D3' },
      { name: 'Restoran', icon: 'ForkKnife', color: '#F38181' },
      { name: 'Zabava', icon: 'GameController', color: '#AA96DA' },
      { name: 'Putovanje', icon: 'Airplane', color: '#6BCF7F' },
      { name: 'Stanarina', icon: 'Key', color: '#F67280' },
      { name: 'Pokloni', icon: 'Gift', color: '#FFB6C1' },
      { name: 'Kredit i kreditna kartica', icon: 'CreditCard', color: '#FF7B89' },
      { name: 'Lična nega', icon: 'User', color: '#FFAAA6' },
      { name: 'Rekreacija', icon: 'Barbell', color: '#7FD8BE' },
      { name: 'Održavanje doma', icon: 'Wrench', color: '#FFD571' },
      { name: 'Održavanje vozila', icon: 'Car', color: '#85D8CE' },
      { name: 'Registracija vozila', icon: 'IdentificationCard', color: '#9FACE6' },
      { name: 'Školarina', icon: 'GraduationCap', color: '#B8A4C9' },
      { name: 'Porezi', icon: 'Scales', color: '#FFB4A7' },
      { name: 'Osiguranje', icon: 'ShieldCheck', color: '#A8D8EA' },
      { name: 'Bankarski troškovi', icon: 'Bank', color: '#FCBAD3' },
      { name: 'Alimentacija', icon: 'Users', color: '#FFDFD3' },
      { name: 'Pretplate', icon: 'CreditCard', color: '#B5EAD7' },
      { name: 'Ostalo', icon: 'Question', color: '#D4A5A5' },
    ]

    // Default kategorije prihoda
    const defaultIncomeCategories = [
      { name: 'Plata', icon: 'Money', color: '#95E1D3' },
      { name: 'Freelance', icon: 'Laptop', color: '#F38181' },
      { name: 'Investicije', icon: 'TrendUp', color: '#AA96DA' },
      { name: 'Poklon', icon: 'Gift', color: '#FFB6C1' },
      { name: 'Ostalo', icon: 'Question', color: '#D4A5A5' },
    ]

    // Za svakog korisnika
    for (const user of users) {
      console.log(`👤 Ažuriram korisnika: ${user.email}`)

      // Proveri postojeće kategorije
      const existingCategories = await prisma.category.findMany({
        where: { userId: user.id }
      })
      
      const existingIncomeCategories = await prisma.incomeCategory.findMany({
        where: { userId: user.id }
      })

      console.log(`   📊 Trenutno: ${existingCategories.length} troškova, ${existingIncomeCategories.length} prihoda`)

      // Kreiraj samo nove kategorije (one koje ne postoje)
      let createdExpenseCount = 0
      for (const category of defaultExpenseCategories) {
        const exists = existingCategories.find(c => c.name === category.name)
        if (!exists) {
          await prisma.category.create({
            data: {
              ...category,
              userId: user.id,
            },
          })
          createdExpenseCount++
        }
      }

      let createdIncomeCount = 0
      for (const category of defaultIncomeCategories) {
        const exists = existingIncomeCategories.find(c => c.name === category.name)
        if (!exists) {
          await prisma.incomeCategory.create({
            data: {
              ...category,
              userId: user.id,
            },
          })
          createdIncomeCount++
        }
      }

      console.log(`   ✅ Dodato: ${createdExpenseCount} novih troškova, ${createdIncomeCount} novih prihoda\n`)
    }

    console.log('✅ Default kategorije uspešno ažurirane za sve korisnike!')
    console.log(`📊 Ukupno: ${defaultExpenseCategories.length} kategorija troškova, ${defaultIncomeCategories.length} kategorija prihoda`)
    
  } catch (error) {
    console.error('❌ Greška:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateDefaultCategories()
