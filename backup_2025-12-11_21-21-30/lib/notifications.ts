import { prisma } from "./prisma"

export type NotificationType = 
  | "GROUP_JOIN"
  | "EXPENSE_ADDED"
  | "EXPENSE_UPDATED"
  | "EXPENSE_DELETED"
  | "INCOME_ADDED"
  | "INCOME_UPDATED"
  | "INCOME_DELETED"
  | "SETTLEMENT_REQUEST"
  | "BUDGET_ALERT"
  | "GROUP_INVITE"
  | "PAYMENT_RECEIVED"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  groupId?: string
  expenseId?: string
  fromUserId?: string
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        groupId: params.groupId,
        expenseId: params.expenseId,
        fromUserId: params.fromUserId,
        isRead: false,
        emailSent: false
      }
    })

    console.log(`✅ Notification created: ${params.title} for user ${params.userId}`)
    
    return notification
  } catch (error) {
    console.error("❌ Error creating notification:", error)
    throw error
  }
}

/**
 * Send notification to all group members except the actor
 * Used when someone joins a group, adds expense, etc.
 */
export async function notifyGroupMembers(
  groupId: string,
  excludeUserId: string,  // don't notify the person who did the action
  notification: {
    type: NotificationType
    title: string
    message: string
    expenseId?: string
  }
) {
  try {
    // Get all active group members except the actor
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { not: excludeUserId },
        leftAt: null  // only active members
      },
      select: {
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Create notifications for all members
    const notifications = await Promise.all(
      members.map(member =>
        createNotification({
          userId: member.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          groupId,
          expenseId: notification.expenseId,
          fromUserId: excludeUserId
        })
      )
    )

    console.log(`✅ Notified ${members.length} group members`)
    
    return notifications
  } catch (error) {
    console.error("❌ Error notifying group members:", error)
    throw error
  }
}

/**
 * Send email notification (placeholder for future implementation)
 * You can integrate Resend, SendGrid, or Nodemailer here
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  htmlBody: string
) {
  // TODO: Implement email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'Domacin <notifications@domacin.app>',
  //   to: email,
  //   subject,
  //   html: htmlBody
  // })
  
  console.log(`📧 Email notification (not sent - implement later): ${email} - ${subject}`)
}
