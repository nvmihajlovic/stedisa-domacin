# Email Configuration

To enable email notifications for budget alerts and other features:

## Option 1: Resend (Recommended)

1. Install Resend:
```bash
npm install resend
```

2. Create account at https://resend.com

3. Get your API key from dashboard

4. Add to `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

5. Verify your domain in Resend dashboard

6. Uncomment email code in `lib/email-service.ts`

## Option 2: Nodemailer (SMTP)

1. Install Nodemailer:
```bash
npm install nodemailer @types/nodemailer
```

2. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

3. Update `lib/email-service.ts` to use Nodemailer instead of Resend

## Cron Job Setup

### For Vercel deployment:

Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-budgets",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs budget checks daily at 9 AM.

### For other platforms:

Use external cron service (cron-job.org, EasyCron) to call:
```
GET https://yourdomain.com/api/cron/check-budgets
Authorization: Bearer YOUR_CRON_SECRET
```

Add `CRON_SECRET` to `.env` for security.

## Testing

Manually trigger budget check:
```bash
curl -X POST http://localhost:3000/api/cron/check-budgets
```

Or use the API route in your browser while logged in.

## Email Templates

Budget alert emails include:
- Alert type (80% warning or 100% exceeded)
- Category name
- Budget vs spent amount
- Remaining amount
- Link to budgets page
- Professional styling with your brand colors
