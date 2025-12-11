import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import GroupClient from "./GroupClient"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { groupId } = await params

  return <GroupClient groupId={groupId} />
}
