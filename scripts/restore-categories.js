/**
 * Standalone script to restore categories for a user
 * Usage: node scripts/restore-categories.js <user-email>
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "hrana i piće", icon: "ForkKnife", color: "#FF6B6B" },
  { name: "gorivo", icon: "GasPump", color: "#FFA500" },
  { name: "hemija", icon: "Drop", color: "#95E1D3" },
  { name: "kozmetika", icon: "Sparkle", color: "#FF85A2" },
  { name: "odeća", icon: "TShirt", color: "#A8E6CF" },
  { name: "obuća", icon: "ShoppingBag", color: "#FFD93D" },
  { name: "komunalije", icon: "House", color: "#4C8BEA" },
  { name: "energija", icon: "Lightning", color: "#FFE66D" },
  { name: "pokućstvo", icon: "Armchair", color: "#C490E4" },
  { name: "restorani", icon: "ForkKnife", color: "#FF6B9D" },
  { name: "zabava", icon: "FilmSlate", color: "#A8D8EA" },
  { name: "putovanje", icon: "AirplaneTilt", color: "#FFB6C1" },
  { name: "stanarina", icon: "Buildings", color: "#B4A7D6" },
  { name: "pokloni", icon: "Gift", color: "#FFAAA5" },
  { name: "kredit", icon: "CreditCard", color: "#E4586E" },
  { name: "lična nega", icon: "User", color: "#F8B195" },
  { name: "rekreacija", icon: "Barbell", color: "#92A8D1" },
  { name: "održavanje doma", icon: "Wrench", color: "#88B04B" },
  { name: "održavanje vozila", icon: "Car", color: "#5B84B1" },
  { name: "registracija vozila", icon: "FileText", color: "#FC766A" },
  { name: "školarina", icon: "GraduationCap", color: "#5F4B8B" },
  { name: "porezi", icon: "ChartBar", color: "#E69A8D" },
  { name: "osiguranje", icon: "ShieldCheck", color: "#42EADD" },
  { name: "bankarski troškovi", icon: "Bank", color: "#CDB599" },
  { name: "alimentacija", icon: "UsersThree", color: "#DD4A48" },
  { name: "pretplate", icon: "DeviceMobile", color: "#9F70FF" },
  { name: "ostalo", icon: "Package", color: "#7A7A8C" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "lični dohodak", icon: "Money", color: "#45D38A", isLoanRepayment: false },
  { name: "prihod od rente", icon: "Buildings", color: "#2ECC71", isLoanRepayment: false },
  { name: "honorar", icon: "CurrencyCircleDollar", color: "#27AE60", isLoanRepayment: false },
  { name: "napojnica", icon: "Hand", color: "#1ABC9C", isLoanRepayment: false },
  { name: "ostalo", icon: "TrendUp", color: "#16A085", isLoanRepayment: false },
];

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('❌ Usage: node scripts/restore-categories.js <user-email>')
    console.log('Example: node scripts/restore-categories.js nvmihajlovic@gmail.com')
    process.exit(1)
  }

  console.log(`🔍 Looking for user: ${email}`)
  
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log(`❌ User not found: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)

  // Count existing categories
  const existingExpense = await prisma.category.count({ where: { userId: user.id } })
  const existingIncome = await prisma.incomeCategory.count({ where: { userId: user.id } })

  console.log(`📊 Current categories:`)
  console.log(`   - Expense: ${existingExpense}`)
  console.log(`   - Income: ${existingIncome}`)

  // Add missing categories
  console.log(`\n🔄 Restoring default categories...`)

  if (existingExpense === 0) {
    await prisma.category.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        userId: user.id
      }))
    })
    console.log(`✅ Added ${DEFAULT_EXPENSE_CATEGORIES.length} expense categories`)
  } else {
    console.log(`ℹ️  User already has expense categories, skipping...`)
  }

  if (existingIncome === 0) {
    await prisma.incomeCategory.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map(cat => ({
        ...cat,
        userId: user.id
      }))
    })
    console.log(`✅ Added ${DEFAULT_INCOME_CATEGORIES.length} income categories`)
  } else {
    console.log(`ℹ️  User already has income categories, skipping...`)
  }

  // Final count
  const finalExpense = await prisma.category.count({ where: { userId: user.id } })
  const finalIncome = await prisma.incomeCategory.count({ where: { userId: user.id } })

  console.log(`\n📊 Final categories:`)
  console.log(`   - Expense: ${finalExpense}`)
  console.log(`   - Income: ${finalIncome}`)
  console.log(`\n🎉 Done!`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
