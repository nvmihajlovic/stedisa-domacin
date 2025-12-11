/**
 * Email service for sending notifications
 * 
 * To enable email notifications:
 * 1. Install Resend: npm install resend
 * 2. Get API key from https://resend.com
 * 3. Add to .env: RESEND_API_KEY=re_xxx
 * 4. Verify domain in Resend dashboard
 * 5. Set FROM_EMAIL=noreply@yourdomain.com
 * 
 * Alternative: Use Nodemailer with SMTP
 * npm install nodemailer @types/nodemailer
 */

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
 * Send budget alert email using Resend
 */
export async function sendBudgetAlertEmail(alert: BudgetAlert): Promise<void> {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [EMAIL] Budget alert ${alert.alertType} (Resend not configured):`, {
        category: alert.categoryName || 'Overall',
        spent: alert.spent,
        budget: alert.budgetAmount,
        percentage: Math.round(alert.percentage),
      })
      return
    }

    const { Resend } = await import('resend')
    const prisma = (await import('@/lib/prisma')).default
    const resend = new Resend(process.env.RESEND_API_KEY)

    const user = await prisma.user.findUnique({
      where: { id: alert.userId },
      select: { email: true, name: true },
    })

    if (!user?.email) {
      console.error('User email not found for alert')
      return
    }

    const subject = alert.alertType === '80%'
      ? `⚠️ Budžet dostigao ${Math.round(alert.percentage)}%`
      : `🚨 Budžet prekoračen!`

    const categoryText = alert.categoryName
      ? `za kategoriju "${alert.categoryName}"`
      : 'ukupan'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9F70FF 0%, #6B46C1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: ${alert.alertType === '80%' ? '#FEF3C7' : '#FEE2E2'}; border-left: 4px solid ${alert.alertType === '80%' ? '#F59E0B' : '#EF4444'}; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #9F70FF; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .button { display: inline-block; background: #9F70FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${alert.alertType === '80%' ? '⚠️ Upozorenje o budžetu' : '🚨 Budžet prekoračen'}</h1>
            </div>
            <div class="content">
              <p>Pozdrav${user.name ? ` ${user.name}` : ''},</p>
              
              <div class="alert-box">
                <h2 style="margin-top: 0;">Tvoj ${categoryText} budžet je dostigao <strong>${Math.round(alert.percentage)}%</strong></h2>
                ${alert.alertType === '80%' 
                  ? '<p>Blizu si limita! Preporučujemo da budeš oprezan sa dalјim troškovima ovog meseca.</p>'
                  : '<p>Prekoračio si planiran budžet. Vreme je da preispitaš svoje troškove ili prilagodiš budžet.</p>'
                }
              </div>

              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${alert.budgetAmount.toLocaleString('sr-RS')} RSD</div>
                  <div class="stat-label">Budžet</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${alert.spent.toLocaleString('sr-RS')} RSD</div>
                  <div class="stat-label">Potrošeno</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${Math.max(0, alert.budgetAmount - alert.spent).toLocaleString('sr-RS')} RSD</div>
                  <div class="stat-label">Preostalo</div>
                </div>
              </div>

              <p>Proveri detalјe u aplikaciji i prilagodi svoje troškove:</p>
              <center>
                <a href="${process.env.NEXTAUTH_URL}/budgets" class="button">Pogledaj budžete</a>
              </center>
            </div>
            <div class="footer">
              <p>Ovo je automatska notifikacija iz Domacin aplikacije.<br>
              Ako želiš da isključiš notifikacije, podesi to u svom profilu.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Domacin <noreply@domacin.app>',
      to: user.email,
      subject,
      html,
    })

    console.log(`✅ Budget alert email sent to ${user.email}`)

  } catch (error) {
    console.error('Error sending budget alert email:', error)
    throw error
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  console.log(`📧 [EMAIL] Welcome email to ${email}`)
  // Implement when Resend is configured
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  console.log(`📧 [EMAIL] Password reset to ${email}`)
  // Implement when Resend is configured
}

/**
 * Send group settlement notification
 */
export async function sendSettlementNotification(
  email: string,
  groupName: string,
  amount: number,
  recipientName: string
): Promise<void> {
  console.log(`📧 [EMAIL] Settlement notification to ${email}: ${amount} RSD to ${recipientName}`)
  // Implement when Resend is configured
}
