import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StatisticsClient from "./StatisticsClient"

// Force rebuild - Dec 3, 2025 22:30
export default async function StatisticsPage() {
  console.log('🔍 StatisticsPage server component executing...')
  const user = await getUser()
  console.log('👤 User:', user ? 'Found' : 'Not found')

  if (!user) {
    console.log('❌ No user, redirecting to login')
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
  })
  console.log('💾 DB User:', dbUser ? 'Found' : 'Not found')

  if (!dbUser) {
    console.log('❌ No DB user, redirecting to login')
    redirect("/login")
  }

  console.log('✅ Rendering StatisticsClient for user:', dbUser.email)
  return <StatisticsClient user={dbUser} />
}
