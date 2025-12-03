import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StatisticsClient from "./StatisticsClient"

// Force rebuild - Dec 3, 2025 22:30
export default async function StatisticsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
  })

  if (!dbUser) {
    redirect("/login")
  }

  return <StatisticsClient user={dbUser} />
}
