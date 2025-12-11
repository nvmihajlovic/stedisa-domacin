import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Odjavljeni ste" })
  response.cookies.delete("auth-token")
  return response
}
