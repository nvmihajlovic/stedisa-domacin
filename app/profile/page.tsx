import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const user = await getUser()
  
  if (!user) {
    redirect("/login")
  }

  return <ProfileClient user={user} />
}
