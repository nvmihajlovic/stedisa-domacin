import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { ensureUserHasCategories } from "@/lib/default-categories"

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-key")

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")
  
  console.log('🍪 getUser - Cookie exists:', !!token)

  if (!token) {
    console.log('❌ getUser - No token found')
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    const jwtPayload = payload as { userId: string; email: string }
    
    console.log('✓ JWT verified:', jwtPayload)
    
    // Fetch full user data from database including role and status
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true
      }
    })
    
    console.log('👤 User from DB:', user ? { id: user.id, role: user.role, status: user.status } : 'NOT FOUND')
    
    if (!user) return null
    
    // Ensure user has default categories (in case database was reset)
    await ensureUserHasCategories(user.id, prisma)
    
    // Return with userId for backward compatibility
    return {
      ...user,
      userId: user.id
    }
  } catch (error) {
    console.log('❌ getUser error:', error)
    return null
  }
}
