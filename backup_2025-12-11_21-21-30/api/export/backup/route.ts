import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/export/backup
 * Generate full JSON backup of user's data
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        expenses: {
          include: {
            category: true,
            group: true,
          },
        },
        incomes: {
          include: {
            category: true,
            group: true,
          },
        },
        categories: true,
        incomeCategories: true,
        recurringExpenses: true,
        recurringIncomes: true,
        groupMemberships: {
          include: {
            group: true,
          },
        },
        ownedGroups: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        budgets: {
          include: {
            category: true,
          },
        },
        vendorMappings: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data from userData
    const { password, resetToken, verificationToken, ...safeUser } = userData as any

    // Create backup object
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
        currency: safeUser.currency,
        language: safeUser.language,
        createdAt: safeUser.createdAt,
      },
      statistics: {
        totalExpenses: safeUser.expenses.length,
        totalIncomes: safeUser.incomes.length,
        totalCategories: safeUser.categories.length,
        totalGroups: safeUser.ownedGroups.length + safeUser.groupMemberships.length,
        totalBudgets: safeUser.budgets.length,
      },
      data: {
        expenses: safeUser.expenses,
        incomes: safeUser.incomes,
        categories: safeUser.categories,
        incomeCategories: safeUser.incomeCategories,
        recurringExpenses: safeUser.recurringExpenses,
        recurringIncomes: safeUser.recurringIncomes,
        groups: safeUser.ownedGroups,
        groupMemberships: safeUser.groupMemberships,
        budgets: safeUser.budgets,
        vendorMappings: safeUser.vendorMappings,
      },
    }

    const filename = `domacin-backup-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating backup:', error)
    return NextResponse.json(
      { error: 'Failed to generate backup' },
      { status: 500 }
    )
  }
}
