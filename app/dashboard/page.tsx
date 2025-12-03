import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"
import { TourProvider } from "@/contexts/TourContext"

export default async function DashboardPage() {
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

  return (
    <TourProvider>
      <DashboardClient user={dbUser} />
    </TourProvider>
  )
}
