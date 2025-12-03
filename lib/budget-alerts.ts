import { prisma } from '@/lib/prisma'

interface BudgetAlert {
  userId: string
  budgetId: string
  categoryName: string | null
  budgetAmount: number
  spent: number
  percentage: number
  alertType: '80%' | '100%'
}

/**
 * Check all budgets and return alerts for those exceeding thresholds
 */
export async function checkBudgetAlerts(): Promise<BudgetAlert[]> {
  const alerts: BudgetAlert[] = []
  const now = new Date()

  try {
    // Get all active budgets
    const budgets = await prisma.budget.findMany({
      include: {
        category: true,
        user: true,
      },
    })

    for (const budget of budgets) {
      // Calculate date range based on period
      const startDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1)

      const endDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

      // Get expenses for this budget
      const where: any = {
        userId: budget.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      }

      if (budget.categoryId) {
        where.categoryId = budget.categoryId
      }

      const expenses = await prisma.expense.findMany({ where })
      const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const percentage = (spent / budget.amount) * 100

      // Check if we need to send 80% alert
      if (percentage >= 80 && percentage < 100 && !budget.alert80Sent) {
        alerts.push({
          userId: budget.userId,
          budgetId: budget.id,
          categoryName: budget.category?.name || null,
          budgetAmount: budget.amount,
          spent,
          percentage,
          alertType: '80%',
        })

        // Mark as sent
        await prisma.budget.update({
          where: { id: budget.id },
          data: { alert80Sent: true },
        })

        console.log(`⚠️ Budget alert 80% for user ${budget.user.email}: ${budget.category?.name || 'Overall'} - ${spent}/${budget.amount} RSD`)
      }

      // Check if we need to send 100% alert
      if (percentage >= 100 && !budget.alert100Sent) {
        alerts.push({
          userId: budget.userId,
          budgetId: budget.id,
          categoryName: budget.category?.name || null,
          budgetAmount: budget.amount,
          spent,
          percentage,
          alertType: '100%',
        })

        // Mark as sent
        await prisma.budget.update({
          where: { id: budget.id },
          data: { alert100Sent: true },
        })

        console.log(`🚨 Budget alert 100% for user ${budget.user.email}: ${budget.category?.name || 'Overall'} - ${spent}/${budget.amount} RSD`)
      }

      // Reset alerts if we're in a new period
      const lastReset = budget.lastResetAt
      const shouldReset = budget.period === 'MONTHLY'
        ? lastReset.getMonth() !== now.getMonth()
        : lastReset.getFullYear() !== now.getFullYear()

      if (shouldReset) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            alert80Sent: false,
            alert100Sent: false,
            lastResetAt: now,
          },
        })
        console.log(`🔄 Reset alerts for budget ${budget.id}`)
      }
    }

    return alerts
  } catch (error) {
    console.error('Error checking budget alerts:', error)
    return []
  }
}

/**
 * Get budget status for a specific user
 */
export async function getUserBudgetStatus(userId: string) {
  const now = new Date()
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { category: true },
  })

  const statuses = await Promise.all(
    budgets.map(async (budget) => {
      const startDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1)

      const endDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

      const where: any = {
        userId,
        date: { gte: startDate, lte: endDate },
      }

      if (budget.categoryId) {
        where.categoryId = budget.categoryId
      }

      const expenses = await prisma.expense.findMany({ where })
      const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const percentage = (spent / budget.amount) * 100

      return {
        budgetId: budget.id,
        categoryName: budget.category?.name || 'Overall',
        budgetAmount: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok',
      }
    })
  )

  return statuses
}

/**
 * Check budget alerts for a specific user after expense creation
 * Creates in-app notifications for budget warnings
 */
export async function checkUserBudgetAlerts(userId: string, categoryId?: string): Promise<BudgetAlert[]> {
  const alerts: BudgetAlert[] = []
  const now = new Date()

  try {
    // Get budgets for this user (either category-specific or overall)
    const where: any = { userId }
    if (categoryId) {
      where.OR = [
        { categoryId: categoryId },
        { categoryId: null }, // Overall budget
      ]
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
        user: true,
      },
    })

    for (const budget of budgets) {
      // Calculate date range based on period
      const startDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1)

      const endDate = budget.period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

      // Get expenses for this budget
      const expenseWhere: any = {
        userId: budget.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      }

      if (budget.categoryId) {
        expenseWhere.categoryId = budget.categoryId
      }

      const expenses = await prisma.expense.findMany({ where: expenseWhere })
      const spent = expenses.reduce((sum, exp) => sum + exp.amountInRSD, 0)
      const percentage = (spent / budget.amount) * 100

      // Check if we need to send 80% alert
      if (percentage >= 80 && percentage < 100 && !budget.alert80Sent) {
        alerts.push({
          userId: budget.userId,
          budgetId: budget.id,
          categoryName: budget.category?.name || null,
          budgetAmount: budget.amount,
          spent,
          percentage,
          alertType: '80%',
        })

        // Mark as sent and create notification
        await prisma.budget.update({
          where: { id: budget.id },
          data: { alert80Sent: true },
        })

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: budget.userId,
            type: 'BUDGET_WARNING',
            title: '⚠️ Upozorenje o budžetu',
            message: `Potrošili ste ${percentage.toFixed(0)}% budžeta za ${budget.category?.name || 'ukupan budžet'}. Preostalo: ${(budget.amount - spent).toLocaleString('sr-RS')} RSD`,
          },
        })

        console.log(`⚠️ Budget alert 80% for user: ${budget.category?.name || 'Overall'} - ${spent.toFixed(0)}/${budget.amount} RSD`)
      }

      // Check if we need to send 100% alert
      if (percentage >= 100 && !budget.alert100Sent) {
        alerts.push({
          userId: budget.userId,
          budgetId: budget.id,
          categoryName: budget.category?.name || null,
          budgetAmount: budget.amount,
          spent,
          percentage,
          alertType: '100%',
        })

        // Mark as sent and create notification
        await prisma.budget.update({
          where: { id: budget.id },
          data: { alert100Sent: true },
        })

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: budget.userId,
            type: 'BUDGET_EXCEEDED',
            title: '🚨 Budžet prekoračen!',
            message: `Prekoračili ste budžet za ${budget.category?.name || 'ukupan budžet'}. Potrošeno: ${spent.toLocaleString('sr-RS')} RSD od ${budget.amount.toLocaleString('sr-RS')} RSD`,
          },
        })

        console.log(`🚨 Budget alert 100% for user: ${budget.category?.name || 'Overall'} - ${spent.toFixed(0)}/${budget.amount} RSD`)
      }
    }

    return alerts
  } catch (error) {
    console.error('Error checking user budget alerts:', error)
    return []
  }
}
