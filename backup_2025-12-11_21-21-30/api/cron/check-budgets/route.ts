import { NextRequest, NextResponse } from 'next/server'
import { checkBudgetAlerts } from '@/lib/budget-alerts'
import { sendBudgetAlertEmail } from '@/lib/email-service'

/**
 * Cron job endpoint to check all budgets and send alerts
 * This should be called daily via Vercel Cron or external service
 * 
 * To secure this endpoint, add CRON_SECRET to .env and check headers:
 * Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Starting budget alerts check...')
    const alerts = await checkBudgetAlerts()

    if (alerts.length === 0) {
      console.log('✅ No budget alerts to send')
      return NextResponse.json({
        success: true,
        message: 'No alerts triggered',
        alertsChecked: 0,
      })
    }

    // Send email notifications for each alert
    const emailResults = await Promise.allSettled(
      alerts.map(alert => sendBudgetAlertEmail(alert))
    )

    const successCount = emailResults.filter(r => r.status === 'fulfilled').length
    const failureCount = emailResults.filter(r => r.status === 'rejected').length

    console.log(`📧 Sent ${successCount} alerts, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Processed ${alerts.length} budget alerts`,
      alertsTriggered: alerts.length,
      emailsSent: successCount,
      emailsFailed: failureCount,
      alerts: alerts.map(a => ({
        budgetId: a.budgetId,
        category: a.categoryName,
        alertType: a.alertType,
        percentage: Math.round(a.percentage),
      })),
    })
  } catch (error) {
    console.error('Error in budget check cron:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * Manual trigger endpoint (POST)
 * Can be used for testing or manual runs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: request.headers,
    }).then(res => res.json())

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`🔧 Manual budget check triggered by ${session.user.email}`)
    const alerts = await checkBudgetAlerts()

    return NextResponse.json({
      success: true,
      message: `Manual check completed`,
      alertsTriggered: alerts.length,
      alerts,
    })
  } catch (error) {
    console.error('Error in manual budget check:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
