# 💰 Funkcionalnost Štednje - Kompletna Dokumentacija

## 📋 Pregled

Kompletna funkcionalnost za upravljanje ciljevima štednje sa opcijama za:
- ✅ Ličnu i grupnu štednju
- ✅ Multi-valutnu podršku (RSD, EUR, USD)
- ✅ Mesečno i godišnje praćenje ciljeva
- ✅ Automatsko mesečno štedenje
- ✅ Vizuelni progress tracking
- ✅ Kategorije štednje
- ✅ Integraciju sa statistikama

---

## 🎯 Karakteristike

### 1. **Kreiranje Cilja Štednje**

Korisnik može kreirati cilj štednje sa sledećim opcijama:

- **Naziv cilja**: "Odmor 2025", "Novi automobil", "Emergency fond"
- **Tip štednje**: Lična ili Grupna
- **Ciljani iznos**: Željeni iznos za uštediti
- **Valuta**: RSD, EUR ili USD
- **Kategorija**: Izabrati iz postojećih kategorija troškova
- **Period**: Mesečno ili Godišnje
- **Rok (za godišnje)**: Datum do kada želite da ostvarite cilj
- **Automatsko štedenje**: Opcija da se automatski kreira trošak svaki mesec

### 2. **Automatsko Mesečno Štedenje**

Kada je uključena opcija "Automatsko mesečno štedenje":

- **Iznos mesečno**: Koliko se automatski uplaćuje
- **Dan u mesecu**: Koji dan se automatski kreira trošak (1-28)
- **Automatska kreacija**: Sistem automatski kreira:
  - Contribution (uplaćuje u cilj)
  - Expense (trošak pod izabranom kategorijom)
  - Povećava currentAmount cilja

### 3. **Vizuelni Prikaz**

**Kartica cilja štednje prikazuje:**
- Progress bar sa procentom ostvarenja
- Trenutni iznos vs. ciljani iznos
- Preostali iznos do cilja
- Period (mesečno/godišnje)
- Kategorija sa ikonom i bojom
- Status: "Automatsko" badge ako je recurring
- Akcije: Edit, Delete, "Dodaj novac"

**Statistika (4 kartice):**
- 💰 Ukupno uštedeno
- 🎯 Ciljani iznos
- 📈 Prosečan napredak (%)
- 📅 Broj aktivnih ciljeva

### 4. **Ručno Dodavanje Novca**

Korisnik može manuelno dodati novac u cilj:
- Klikne "Dodaj novac" na kartici cilja
- Unese iznos
- Sistem kreira SavingsContribution
- Automatski povećava currentAmount

### 5. **Integracija sa Statistikama**

Štednja se uračunava u:
- Troškove (kada se kreira automatski ili ručno)
- Total balance
- Kategorije troškova
- Mesečne/godišnje izveštaje

---

## 🗂️ Struktura Baze Podataka

### Model: `SavingsGoal`

```prisma
model SavingsGoal {
  id                   String                @id @default(cuid())
  userId               String
  groupId              String?
  name                 String
  targetAmount         Float
  currentAmount        Float                 @default(0)
  currency             String                @default("RSD")
  categoryId           String
  period               String                @default("monthly")
  targetDate           DateTime?
  isRecurring          Boolean               @default(false)
  recurringFrequency   String?
  recurringDayOfMonth  Int?
  recurringAmount      Float?
  isActive             Boolean               @default(true)
  color                String                @default("#FFD700")
  icon                 String                @default("CurrencyDollar")
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt
  user                 User                  @relation(fields: [userId], references: [id])
  category             Category              @relation(fields: [categoryId], references: [id])
  group                Group?                @relation(fields: [groupId], references: [id])
  contributions        SavingsContribution[]
}
```

### Model: `SavingsContribution`

```prisma
model SavingsContribution {
  id            String      @id @default(cuid())
  savingsGoalId String
  userId        String
  amount        Float
  currency      String      @default("RSD")
  description   String?
  isAutomatic   Boolean     @default(false)
  createdAt     DateTime    @default(now())
  savingsGoal   SavingsGoal @relation(fields: [savingsGoalId], references: [id])
  user          User        @relation(fields: [userId], references: [id])
}
```

---

## 🔗 API Endpoints

### **GET /api/savings**
Vraća sve aktivne ciljeve štednje za korisnika.

**Query Parameters:**
- `groupId` (optional): Filter by group

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Odmor 2025",
      "targetAmount": 100000,
      "currentAmount": 45000,
      "currency": "RSD",
      "category": {
        "id": "...",
        "name": "Putovanja",
        "icon": "Airplane",
        "color": "#3B82F6"
      },
      "isRecurring": true,
      "recurringAmount": 15000,
      "recurringDayOfMonth": 5,
      "contributions": [...]
    }
  ]
}
```

### **POST /api/savings**
Kreira novi cilj štednje.

**Body:**
```json
{
  "name": "Novi automobil",
  "targetAmount": 500000,
  "currency": "EUR",
  "categoryId": "clx...",
  "period": "yearly",
  "targetDate": "2025-12-31",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "recurringDayOfMonth": 10,
  "recurringAmount": 20000,
  "groupId": null
}
```

### **PUT /api/savings/{id}**
Ažurira postojeći cilj štednje.

### **DELETE /api/savings/{id}**
Briše cilj štednje.

### **POST /api/savings/{id}/contribute**
Dodaje ručnu uplatu u cilj.

**Body:**
```json
{
  "amount": 10000,
  "currency": "RSD",
  "description": "Bonus sa posla",
  "isAutomatic": false
}
```

---

## ⚙️ Cron Job - Automatsko Štedenje

### Kako radi:

Endpoint: **POST /api/recurring/process**

Procesuira sve due recurring transakcije, uključujući štednju.

**Za svaki SavingsGoal gde je `isRecurring=true`:**

1. Proveri da li je danas `recurringDayOfMonth`
2. Kreira `SavingsContribution`:
   - amount = recurringAmount
   - isAutomatic = true
   - description = "Automatsko mesečno štedenje"
3. Povećava `currentAmount` cilja
4. Kreira `Expense`:
   - description = "Štednja: {goalName}"
   - categoryId = cilj.categoryId
   - amount = recurringAmount
   - isRecurring = true
   - paymentMethod = "transfer"

### Primer Response:

```json
{
  "success": true,
  "processedAt": "2025-12-10T00:01:00Z",
  "expenses": { "created": 2, "errors": 0 },
  "incomes": { "created": 1, "errors": 0 },
  "savings": { "created": 3, "errors": 0 }
}
```

---

## 🎨 UI Komponente

### 1. **`/app/savings/page.tsx`**
Glavna stranica sa listom ciljeva, statistikama i akcijama.

### 2. **`/components/SavingsGoalModal.tsx`**
Modal za kreiranje/editovanje cilja štednje.

**Karakteristike:**
- Izbor tipa (lična/grupna)
- Unos osnovnih podataka
- CategorySelector za izbor kategorije
- Toggle za automatsko štedenje
- Day-of-month selector
- Preview poruka

### 3. **`/components/SavingsGoalCard.tsx`**
Kartica za prikaz pojedinačnog cilja.

**Karakteristike:**
- Progress bar sa procentom
- 3 stat kartice (cilj, preostalo, period)
- Recurring info panel
- "Dodaj novac" dugme
- Contribute modal za ručne uplate

### 4. **Dashboard Quick Access**
Dodat link "Štednja" u brze linkove sa PiggyBank ikonom.

---

## 📊 Integracija sa Statistikama

Štednja se prikazuje kao:

1. **Troškovi**: Automatski kreirani troškovi sa kategorijom "Štednja"
2. **Budget tracking**: Uračunava se u budžet izabrane kategorije
3. **Total expenses**: Doprinosi ukupnom trošku
4. **Category breakdown**: Prikazuje se u prikazu po kategorijama

**Specijalno formatiranje:**
- Štednja troškovi imaju **pastelno zlatnu boju** (#FFD700)
- Ikonica: CurrencyDollar (💰)
- Označeni kao "Recurring" ako su automatski

---

## 🚀 Kako Koristiti

### 1. **Kreiraj cilj**
- Idi na `/savings` (ili klikni "Štednja" u brzim linkovima)
- Klikni "+ Novi cilj"
- Popuni formu:
  - Naziv: "Emergency fond"
  - Ciljani iznos: 200,000 RSD
  - Kategorija: "Štednja"
  - Period: Godišnje
  - Uključi automatsko štedenje:
    - Iznos mesečno: 16,667 RSD
    - Dan u mesecu: 1. dan
- Klikni "Kreiraj cilj"

### 2. **Dodaj novac ručno**
- Klikni "Dodaj novac" na kartici cilja
- Unesi iznos (npr. 5,000 RSD)
- Klikni "Dodaj"

### 3. **Izmeni cilj**
- Klikni ikonu Edit na kartici
- Promeni željene parametre
- Možeš da:
  - Povećaš/smanjišciljani iznos
  - Promeniš recurring amount
  - Promeniš dan u mesecu
  - Isključiš automatsko štedenje

### 4. **Obriši cilj**
- Klikni ikonu Trash na kartici
- Potvrdi brisanje

---

## 🎯 Primer Scenario

**Scenario: Štednja za odmor**

1. **Cilj:** Uštediti 120,000 RSD za letnji odmor
2. **Period:** Godišnje (do juna 2026)
3. **Mesečno:** 10,000 RSD automatski (1. dana u mesecu)

**Šta se dešava:**

- **1. januara 2025**: Sistem kreira:
  - Contribution: +10,000 RSD u "Odmor 2025"
  - Expense: "Štednja: Odmor 2025" - 10,000 RSD (kategorija: Putovanja)
  - currentAmount: 10,000 / 120,000 (8.3%)

- **15. januara 2025**: Korisnik dodaje bonus:
  - Ručno doda 5,000 RSD
  - currentAmount: 15,000 / 120,000 (12.5%)

- **1. februara 2025**: Automatski:
  - Contribution: +10,000 RSD
  - currentAmount: 25,000 / 120,000 (20.8%)

- **... i tako dalje svaki mesec**

- **Juni 2026**: Ostvareno! 💰
  - currentAmount: 120,000 / 120,000 (100%)
  - Status: "✓ Cilj ostvaren!"

---

## 🔧 Tehnički Detalji

### Boja Štednje: Pastelno zlatna

```css
color: #FFD700 (Gold)
background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)
border: 2px solid rgba(255, 215, 0, 0.3)
```

### Ikonica: CurrencyDollar

```tsx
import { CurrencyDollar } from '@phosphor-icons/react'
<CurrencyDollar size={24} weight="bold" />
```

### Automatski Expense kada je Recurring

```typescript
await prisma.expense.create({
  data: {
    userId: savingsGoal.userId,
    amount: savingsGoal.recurringAmount,
    description: `Štednja: ${savingsGoal.name}`,
    categoryId: savingsGoal.categoryId,
    date: new Date(),
    isRecurring: true,
    currency: savingsGoal.currency,
    paymentMethod: 'transfer'
  }
})
```

---

## ✅ Testiranje

### Test Case 1: Kreiranje osnovnog cilja

```
1. Idi na /savings
2. Klikni "+ Novi cilj"
3. Unesi:
   - Naziv: "Test Cilj"
   - Iznos: 50,000 RSD
   - Kategorija: Ostalo
4. Klikni "Kreiraj cilj"

✓ Očekivano: Kartica se prikazuje sa 0 / 50,000 (0%)
```

### Test Case 2: Ručno dodavanje

```
1. Klikni "Dodaj novac" na test cilju
2. Unesi: 10,000 RSD
3. Klikni "Dodaj"

✓ Očekivano: Progress bar ide na 10,000 / 50,000 (20%)
```

### Test Case 3: Automatsko štedenje

```
1. Kreiraj cilj sa recurring enabled
2. Postavi recurring amount: 5,000 RSD
3. Postavi dan: danas
4. Pokreni cron job: POST /api/recurring/process

✓ Očekivano: 
   - Novi Contribution kreiran
   - Novi Expense kreiran
   - currentAmount povećan
```

### Test Case 4: Ostvarenje cilja

```
1. Kreiraj cilj: 10,000 RSD
2. Dodaj 10,000 RSD
3. Proveri karticu

✓ Očekivano: 
   - Progress bar zelene boje
   - Dugme: "✓ Cilj ostvaren!" (disabled)
```

---

## 🐛 Troubleshooting

**Problem:** Automatsko štedenje se ne kreira

- Proveri da li je `isRecurring = true`
- Proveri da li je `recurringDayOfMonth` postavljen
- Proveri da li je danas traženi dan
- Proveri da li cron job radi (POST /api/recurring/process)

**Problem:** Trošak se ne prikazuje u Expenses

- Proveri da li je kategorija validna
- Proveri da li je expense uspešno kreiran (proveri bazu)
- Refresh stranicu /expenses

**Problem:** Progress bar ne prikazuje ispravno

- Proveri `currentAmount` u bazi
- Proveri da li su contributions kreirane
- Refresh komponentu

---

## 📚 Zaključak

Kompletna funkcionalnost štednje omogućava korisnicima da:
- 🎯 Postave jasne ciljeve štednje
- 💰 Automatski štede svaki mesec
- 📊 Prate napredak vizuelno
- 💳 Integrišu štednju sa troškovima
- 🌍 Koriste multi-valutnu podršku
- 👥 Štede individualno ili u grupi

Sistem je potpuno integrisana sa ostalim funkcionalnostima aplikacije (Expenses, Budgets, Statistics) i omogućava fleksibilno upravljanje ličnim finansijama! 🚀
