import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { ensureUserHasCategories } from "@/lib/default-categories"

/**
 * Restore default categories for the current user
 * This endpoint is useful when categories are accidentally deleted
 */
export async function POST() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Niste prijavljeni" },
        { status: 401 }
      )
    }

    // Get current category counts
    const expenseCategoriesCount = await prisma.category.count({
      where: { userId: user.id }
    })

    const incomeCategoriesCount = await prisma.incomeCategory.count({
      where: { userId: user.id }
    })

    // Restore categories
    await ensureUserHasCategories(user.id, prisma)

    // Get new counts
    const newExpenseCategoriesCount = await prisma.category.count({
      where: { userId: user.id }
    })

    const newIncomeCategoriesCount = await prisma.incomeCategory.count({
      where: { userId: user.id }
    })

    const addedExpense = newExpenseCategoriesCount - expenseCategoriesCount
    const addedIncome = newIncomeCategoriesCount - incomeCategoriesCount

    return NextResponse.json({
      message: "Kategorije uspešno obnovljene",
      added: {
        expense: addedExpense,
        income: addedIncome
      },
      total: {
        expense: newExpenseCategoriesCount,
        income: newIncomeCategoriesCount
      }
    })
  } catch (error) {
    console.error("Restore categories error:", error)
    return NextResponse.json(
      { error: "Greška pri obnavljanju kategorija" },
      { status: 500 }
    )
  }
}
