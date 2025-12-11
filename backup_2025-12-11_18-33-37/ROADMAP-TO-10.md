# 🎯 DOMACIN - Roadmap to 10/10

**Current Score:** 9.5/10 ⬆️ (Previously 7.5/10)
**Target Score:** 10/10
**Timeline:** 2-4 weeks remaining
**Status:** Almost Complete! 🎉

**Recent Updates:**
- ✅ Group Settlement System - COMPLETE
- ✅ Recurring Transactions with Cron - COMPLETE
- ✅ CSV Export with date range picker - COMPLETE

---## 📊 PRIORITY MATRIX

### 🔴 P0 - CRITICAL (Must Have for Launch)
**Impact: HIGH | Effort: MEDIUM | Timeline: 2-3 weeks**

#### 1. Group Settlement System ⭐⭐⭐⭐⭐
**Current Gap:** Groups track expenses but don't calculate "who owes whom"

**What to Build:**
- [x] Algorithm: Calculate net balances between all group members ✅
- [x] UI: "Settlement" tab in group view showing: ✅
  - "You owe X to Person Y: 5,000 RSD"
  - "Person Z owes you: 3,500 RSD"
  - Net balance: -1,500 RSD (you owe in total)
- [x] "Settle Up" button to mark debt as paid ✅
- [x] Settlement history log ✅
- [x] Push notifications when someone settles up ✅

**Files to Create/Modify:**
```
lib/settlement-algorithm.ts        ✅ COMPLETE
app/api/groups/[id]/settlements/route.ts  ✅ COMPLETE
components/GroupSettlement.tsx     ✅ COMPLETE
app/(protected)/groups/[groupId]/page.tsx  ✅ COMPLETE
```

**Algorithm Example:**
```typescript
// If User A paid 100, User B paid 50, User C paid 0 for shared expense of 150
// Equal split: each should pay 50
// A overpaid 50, B paid correctly, C owes 50
// Result: C owes A 50 RSD
```

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ 💰 Settlements - Putovanje Kopaonik│
├─────────────────────────────────────┤
│ You owe:                            │
│ ➜ Marko     12,500 RSD [Settle Up] │
│ ➜ Ana        8,300 RSD [Settle Up] │
│                                      │
│ Owes you:                           │
│ ✓ Stefan    5,200 RSD  (paid ✓)   │
│                                      │
│ Net Balance: -15,600 RSD            │
└─────────────────────────────────────┘
```

---

#### 2. Recurring Transactions ⭐⭐⭐⭐⭐
**Current Gap:** User must manually add monthly bills every time

**What to Build:**
- [x] Database schema: `RecurringExpense` model ✅
- [x] UI: "Set as recurring" checkbox in Add Expense modal ✅
- [x] Frequency options: Daily, Weekly, Monthly, Yearly ✅
- [x] End date or "Indefinite" ✅
- [x] Cron job (Vercel Cron) to auto-create transactions ✅
- [x] UI: "Recurring Transactions" page showing all active recurrences ✅
- [x] Edit/Pause/Delete recurring transactions ✅

**Database Schema:**
```prisma
model RecurringTransaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  type        String   // "EXPENSE" or "INCOME"
  name        String
  amount      Float
  categoryId  String
  
  frequency   String   // "DAILY", "WEEKLY", "MONTHLY", "YEARLY"
  startDate   DateTime
  endDate     DateTime?
  
  lastCreated DateTime?
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Files to Create/Modify:**
```
prisma/schema.prisma              (ADD RecurringTransaction model)
app/api/recurring/route.ts        (NEW - CRUD)
app/api/cron/process-recurring/route.ts (NEW - auto-create)
app/recurring/page.tsx            (NEW - management page)
components/RecurringForm.tsx      (NEW)
app/expenses/page.tsx             (MODIFY - add "Set as recurring")
```

**Cron Job (Vercel):**
```typescript
// app/api/cron/process-recurring/route.ts
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Find all active recurring transactions due today
  const today = new Date()
  const due = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      OR: [
        { lastCreated: null },
        { lastCreated: { lt: getNextDueDate(today) } }
      ]
    }
  })

  // Create actual transactions
  for (const recurring of due) {
    await prisma.expense.create({
      data: {
        userId: recurring.userId,
        name: recurring.name,
        amount: recurring.amount,
        categoryId: recurring.categoryId,
        date: today,
        isRecurring: true,
        recurringId: recurring.id
      }
    })
    
    // Update lastCreated
    await prisma.recurringTransaction.update({
      where: { id: recurring.id },
      data: { lastCreated: today }
    })
  }

  return Response.json({ processed: due.length })
}
```

---

#### 3. Export & Backup System ⭐⭐⭐⭐
**Current Gap:** No way to export data or backup

**What to Build:**
- [x] PDF Export: Monthly/Yearly reports with charts ✅
- [x] CSV Export: All transactions for Excel ✅
- [x] JSON Export: Full data backup ✅
- [ ] Auto-backup to user's email (weekly) ⏳ (Optional feature)
- [x] "Download All Data" button in Profile ✅

**Features:**
1. **PDF Report:** ✅ COMPLETE
   - Use `jsPDF` + `html2canvas`
   - Include: Summary cards, expense breakdown pie chart, transaction list
   - Branding: Domacin logo, color scheme

2. **CSV Export:** ✅ COMPLETE
   - Format: Date, Name, Category, Amount, Type, Group, Note
   - Excel-compatible encoding (UTF-8 BOM)
   - Date range selector in UI

3. **JSON Backup:** ✅ COMPLETE
   - Full database dump for user
   - Can be re-imported if needed

**Files to Create:**
```
app/api/export/backup/route.ts    ✅ COMPLETE (JSON backup)
app/api/export/pdf-data/route.ts  ✅ COMPLETE (PDF data)
app/api/export/csv/route.ts       ✅ COMPLETE (CSV export)
app/profile/ProfileClient.tsx     ✅ COMPLETE (UI with CSV export)
```
app/api/export/backup/route.ts    (NEW)
components/ExportMenu.tsx         (NEW)
app/profile/page.tsx              (ADD export section)
```

**UI in Profile:**
```
┌─────────────────────────────┐
│ 📤 Export & Backup          │
├─────────────────────────────┤
│ [📄 Export PDF Report]      │
│ [📊 Export CSV (Excel)]     │
│ [💾 Download Full Backup]   │
│                              │
│ 🔄 Auto-backup: Enabled     │
│ Last backup: 2 days ago     │
└─────────────────────────────┘
```

---

### 🟡 P1 - HIGH PRIORITY (Competitive Edge)
**Impact: HIGH | Effort: HIGH | Timeline: 2 weeks**

#### 4. Advanced OCR System ⭐⭐⭐⭐
**Current Gap:** Tesseract.js only works well for EPS bills (~60% accuracy)

**What to Build:**
- [ ] Replace Tesseract with Google Vision API or AWS Textract
- [ ] Backend route for OCR processing (keep sensitive data on server)
- [ ] Manual correction UI after OCR scan
- [ ] "Confidence score" indicator
- [ ] Smart field detection: Amount, Date, Vendor
- [ ] Template learning (remember vendor formats)

**Tech Stack Decision:**
| Option | Accuracy | Cost | Pros | Cons |
|--------|----------|------|------|------|
| **Google Vision API** | 90%+ | $1.50/1000 | Best accuracy, multi-language | Requires credit card |
| **AWS Textract** | 85%+ | $1.50/1000 | Good for forms | Complex setup |
| **Tesseract.js (current)** | 60% | Free | No backend needed | Poor accuracy |
| **Azure Computer Vision** | 88%+ | Similar | Good Serbian support | Microsoft ecosystem lock-in |

**Recommendation:** Start with **Google Vision API Free Tier** (1000 requests/month free)

**Implementation:**
```typescript
// app/api/ocr/scan/route.ts
import vision from '@google-cloud/vision'

export async function POST(req: Request) {
  const { image } = await req.json()
  
  const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  })

  const [result] = await client.textDetection(image)
  const text = result.fullTextAnnotation?.text
  
  // Smart extraction
  const amount = extractAmount(text)
  const date = extractDate(text)
  const vendor = extractVendor(text)
  
  return Response.json({
    rawText: text,
    extracted: { amount, date, vendor },
    confidence: result.fullTextAnnotation?.confidence || 0
  })
}

function extractAmount(text: string): number | null {
  // Regex for Serbian currency formats
  const patterns = [
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*(?:RSD|din|дин)/i,
    /UKUPNO:?\s*(\d+[.,]?\d*)/i,
    /TOTAL:?\s*(\d+[.,]?\d*)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return parseFloat(match[1].replace(/[.,]/g, ''))
    }
  }
  return null
}
```

**Manual Correction UI:**
```
┌──────────────────────────────────┐
│ 📸 OCR Result                    │
├──────────────────────────────────┤
│ Confidence: 87% ⚡               │
│                                   │
│ Amount:  [_4,580 RSD_] ✏️        │
│ Date:    [_28.11.2025_] ✏️       │
│ Vendor:  [_Idea_] ✏️             │
│ Category: [Auto-detect: Hrana] ✏️│
│                                   │
│ Raw Text:                         │
│ "IDEA DOO BEOGRAD                │
│  28.11.2025 15:32                │
│  UKUPNO: 4.580,00 RSD"           │
│                                   │
│ [✓ Confirm & Save] [✗ Cancel]   │
└──────────────────────────────────┘
```

---

#### 5. Budget System & Alerts ⭐⭐⭐⭐
**Current Gap:** No way to set spending limits or get warnings

**What to Build:**
- [ ] Set monthly budget per category
- [ ] Overall monthly budget
- [ ] Visual progress bars (50% = yellow, 80% = red)
- [ ] Email/Push alerts when 80% reached
- [ ] Budget vs Actual comparison chart
- [ ] Year-over-year budget comparison

**Database Schema:**
```prisma
model Budget {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  
  categoryId String?  // null = overall budget
  category   Category? @relation(fields: [categoryId], references: [id])
  
  amount     Float
  period     String   // "MONTHLY", "YEARLY"
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([userId, categoryId, period])
}
```

**UI Component:**
```typescript
// components/BudgetProgress.tsx
<div className="space-y-3">
  {budgets.map(budget => {
    const spent = getCurrentSpending(budget)
    const percentage = (spent / budget.amount) * 100
    const color = percentage > 80 ? 'red' : percentage > 50 ? 'yellow' : 'green'
    
    return (
      <div key={budget.id}>
        <div className="flex justify-between mb-1">
          <span>{budget.category.name}</span>
          <span>{spent} / {budget.amount} RSD</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full">
          <div 
            className={`h-full rounded-full bg-${color}-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {percentage > 80 && (
          <p className="text-xs text-red-500 mt-1">
            ⚠️ Prekoračili ste 80% budžeta!
          </p>
        )}
      </div>
    )
  })}
</div>
```

**Alert System:**
```typescript
// lib/budget-alerts.ts
export async function checkBudgetAlerts(userId: string) {
  const budgets = await prisma.budget.findMany({ where: { userId } })
  
  for (const budget of budgets) {
    const spent = await getCurrentSpending(budget)
    const percentage = (spent / budget.amount) * 100
    
    if (percentage >= 80 && !budget.alert80Sent) {
      await sendEmail({
        to: user.email,
        subject: '⚠️ Budžet upozorenje - 80% potrošeno',
        body: `Potrošili ste ${spent} RSD od ${budget.amount} RSD za kategoriju ${budget.category.name}.`
      })
      
      await prisma.budget.update({
        where: { id: budget.id },
        data: { alert80Sent: true }
      })
    }
  }
}
```

---

### 🟢 P2 - NICE TO HAVE (Polishing)
**Impact: MEDIUM | Effort: LOW-MEDIUM | Timeline: 1 week**

#### 6. Multi-Currency Support ⭐⭐⭐
- [ ] Add `currency` field to Expense/Income
- [ ] Integrate exchange rate API (exchangerate-api.com - free)
- [ ] Auto-convert to RSD for statistics
- [ ] Show amounts in original currency + RSD equivalent

#### 7. Push Notifications ⭐⭐⭐
- [ ] One Signal or Firebase Cloud Messaging
- [ ] Notify on: Budget exceeded, Settlement request, Recurring transaction created
- [ ] In-app notification center

#### 8. Dark/Light Theme Toggle ⭐⭐
- [ ] Use `next-themes`
- [ ] Persist preference in localStorage
- [ ] Adjust all colors for light mode

#### 9. Mobile App (PWA) ⭐⭐⭐⭐
- [ ] Add service worker
- [ ] Offline mode with local storage sync
- [ ] Install prompt for "Add to Home Screen"
- [ ] Native-like gestures

#### 10. Social Features ⭐⭐
- [ ] Share statistics on social media (image generation)
- [ ] Referral system (invite friends)
- [ ] Leaderboard (gamification - "top savers this month")

---

## 🛠️ TECHNICAL IMPROVEMENTS

### Performance Optimizations
- [ ] Implement React Query for API caching
- [ ] Add database indices for common queries
- [ ] Lazy load charts (only when visible)
- [ ] Image optimization (next/image for all uploads)

### Security Enhancements
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Audit log for sensitive actions

### Testing
- [ ] Unit tests for settlement algorithm (Jest)
- [ ] E2E tests for critical flows (Playwright)
- [ ] Visual regression tests (Percy/Chromatic)

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: P0 Foundation
- ✅ Group Settlement Algorithm
- ✅ Settlement UI Components  
- ✅ Recurring Transactions Schema
- ✅ Recurring Transaction CRUD
- ✅ Cron Job for Auto-creation

### Week 3-4: P0 Completion
- ✅ Export System (CSV implemented)
- ⚠️ Export System (PDF pending)
- ⚠️ Backup System (pending)
- ✅ OCR API Integration (Google Vision)

### Week 5-6: P1 Features
- ✅ Advanced OCR with Context Analysis
- ✅ Budget System (COMPLETE)
- ✅ Budget Progress Bars
- ⚠️ Alert System (backend ready, email pending)
- ⚠️ Email Notifications (pending)

### Week 7-8: P2 Polish
- ⚠️ Multi-Currency (pending)
- ⚠️ Push Notifications (pending)
- ⚠️ PWA Setup (pending)
- ⚠️ Testing & Bug Fixes (ongoing)

---

## 🎯 SUCCESS METRICS

**Before (Current):**
- OCR Accuracy: 60%
- User Retention (Week 1): Unknown
- Export Options: 0
- Group Features: Basic tracking

**After (10/10):**
- OCR Accuracy: 90%+
- User Retention (Week 1): 70%+
- Export Options: 3 (PDF, CSV, JSON)
- Group Features: Full settlement system
- Recurring Transactions: Automated
- Budget Alerts: Real-time

---

## 💰 MONETIZATION STRATEGY (Post-Launch)

### Free Tier (Always Free)
- Up to 100 transactions/month
- 1 group membership
- Basic OCR (1000 scans/month)
- Manual exports

### Premium Tier ($4.99/month or $49/year)
- Unlimited transactions
- Unlimited groups
- Advanced OCR (10,000 scans/month)
- Auto-backup to cloud
- Priority email support
- Export scheduler
- Ad-free experience

### Business Tier ($19.99/month)
- Everything in Premium
- Multi-user workspace (5+ members)
- Advanced analytics
- API access
- Dedicated support

---

## 🚀 LAUNCH CHECKLIST

- [ ] All P0 features implemented
- [ ] At least 3 P1 features implemented
- [ ] Beta testing with 20+ users
- [ ] Bug fixes from beta feedback
- [ ] Performance audit (Lighthouse 90+)
- [ ] Security audit
- [ ] Legal pages (Terms, Privacy Policy)
- [ ] Landing page finalized
- [ ] Marketing materials (screenshots, video demo)
- [ ] Social media accounts created
- [ ] Product Hunt launch prepared
- [ ] Press kit ready

---

## 📝 NOTES

**Current Strengths to Maintain:**
- Beautiful UI/UX (don't compromise)
- Fast loading times
- Clean code architecture
- Comprehensive help system

**Risks to Mitigate:**
- OCR API costs (monitor usage, optimize)
- Database scaling (index optimization)
- User support load (comprehensive docs)

**Competitive Advantages:**
- Only Serbian-language finance app with OCR
- Better UI than MoneyLover
- More features than Splitwise (when complete)
- Free tier more generous than competitors

---

**Last Updated:** November 29, 2025  
**Next Review:** December 6, 2025  
**Status:** Ready to Execute 🚀
