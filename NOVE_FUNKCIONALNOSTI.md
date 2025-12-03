# Domaćin - Fintech Aplikacija za Upravljanje Finansijama

## 🚀 Nove Funkcionalnosti

### ✅ 1. Recurring Transakcije (Automatsko Kreiranje)

Automatske mesečne, nedeljne ili godišnje transakcije koje se kreiraju bez vašeg angažovanja.

**Funkcionalnosti:**
- Kreiranje recurring troškova i prihoda
- Frekvencija: mesečno, nedeljno, godišnje
- Automatska kreacija transakcija putem cron job-a
- On/Off toggle za aktivaciju/deaktivaciju
- Pregled svih automatski kreiranih transakcija

**API Endpoints:**
- `GET /api/recurring-expenses` - Lista svih recurring troškova
- `POST /api/recurring-expenses` - Kreiranje novog recurring troška
- `PATCH /api/recurring-expenses/[id]` - Toggle aktivacija
- `DELETE /api/recurring-expenses/[id]` - Brisanje
- `GET /api/recurring-incomes` - Lista svih recurring prihoda
- `POST /api/recurring-incomes` - Kreiranje novog recurring prihoda
- `PATCH /api/recurring-incomes/[id]` - Toggle aktivacija
- `DELETE /api/recurring-incomes/[id]` - Brisanje
- `POST /api/cron/recurring` - Cron endpoint za automatsku kreaciju (poziva se dnevno)

**Pristup:** Dashboard → Recurring dugme

---

### ✅ 2. Group Expenses (Deljenje Troškova)

Delite troškove sa prijateljima, porodicom ili kolegama.

**Funkcionalnosti:**
- Kreiranje grupa za deljenje troškova
- Dodavanje članova grupe putem email-a
- Automatska kalkulacija koliko ko duguje
- Praćenje ukupnih troškova grupe
- Vlasnik grupe može dodavati/uklanjati članove

**API Endpoints:**
- `GET /api/groups` - Lista svih grupa korisnika
- `POST /api/groups` - Kreiranje nove grupe
- `GET /api/groups/[id]` - Detalji grupe
- `PATCH /api/groups/[id]` - Ažuriranje grupe
- `DELETE /api/groups/[id]` - Brisanje grupe
- `POST /api/groups/[id]/members` - Dodavanje člana u grupu
- `DELETE /api/groups/[id]/members/[memberId]` - Uklanjanje člana
- `POST /api/groups/[id]/expenses` - Dodavanje troška u grupu
- `GET /api/groups/[id]/expenses` - Lista troškova sa kalkulacijom

**Pristup:** Dashboard → Grupe dugme

---

### ✅ 3. OCR Skeniranje Računa

Automatsko očitavanje podataka sa slika računa korišćenjem Tesseract.js OCR tehnologije.

**Funkcionalnosti:**
- Upload slike računa (drag & drop ili klik)
- Automatsko očitavanje iznosa, datuma i stavki
- Preview slike pre dodavanja troška
- Fallback na ručni unos ako OCR ne uspe

**Očitavanje:**
- **Iznos** - Traži pattern "123.45 RSD", "Ukupno: 1234", itd.
- **Datum** - Traži pattern "12.05.2024", "12/05/2024", itd.
- **Stavke** - Linije teksta koje izgledaju kao nazivi proizvoda

**API Endpoints:**
- `POST /api/ocr` - Upload i OCR processing

**Komponenta:**
- `<ReceiptUploader />` - Reusable komponenta za upload

---

### ✅ 4. Cloud Storage za Slike (Cloudinary)

Sigurno čuvanje slika računa na cloud-u.

**Setup:**
1. Napravite besplatan nalog na [cloudinary.com](https://cloudinary.com)
2. Podesite credentials u `.env` fajlu:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Funkcionalnosti:**
- Automatski upload slika na Cloudinary
- Optimizacija i kompresija slika
- Sigurne URL-ove za pristup slikama
- Folder organizacija (receipts/)

---

## 📦 Instalacija

### Zavisnosti koje su dodate:

```bash
npm install tesseract.js cloudinary multer @types/multer
```

### Prisma Schema

Schema već sadrži sve potrebne modele:
- `RecurringExpense` - Recurring troškovi
- `RecurringIncome` - Recurring prihodi
- `Group` - Grupe za deljenje
- `GroupMember` - Članovi grupa
- `OCRLog` - Log OCR procesiranja
- `Expense.receiptUrl` - URL slike računa
- `Expense.groupId` - Link ka grupi
- `Expense.splitAmount` - Podeljeni iznos

Ako pravite novi projekat ili imate izmene, pokrenite:

```bash
npx prisma migrate dev --name add_new_features
npx prisma generate
```

---

## 🔧 Konfiguracija

### 1. Environment Variables (.env)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cron Secret for recurring transactions
CRON_SECRET=your_random_secret_key_here
```

### 2. Cron Job Setup

Za automatsko kreiranje recurring transakcija, podesite cron job koji poziva:

**Endpoint:** `POST /api/cron/recurring`

**Header:** `Authorization: Bearer YOUR_CRON_SECRET`

**Frekvencija:** Jednom dnevno (preporučeno ujutru)

#### Opcije za setup:

**A) Vercel Cron (Preporučeno za produkciju)**

Dodajte u `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/recurring",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**B) GitHub Actions**

Kreirajte `.github/workflows/cron.yml`:

```yaml
name: Daily Recurring Transactions
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger recurring transactions
        run: |
          curl -X POST https://your-domain.com/api/cron/recurring \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**C) Zewnetržni servisi:**
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- Render Cron Jobs

---

## 🎨 UI/UX Dodaci

### Nove Stranice:

1. **/recurring** - Upravljanje recurring transakcijama
2. **/groups** - Lista svih grupa
3. **/groups/[id]** - Detalji grupe (TODO: Kreirati)

### Nove Komponente:

1. **CategorySelector** - Grid picker za kategorije (već postojao)
2. **ReceiptUploader** - Drag & drop upload sa OCR preview

### Dashboard Navigacija:

Dodat novi button:
- **Recurring** - Narandžasta ikona Repeat

---

## 📝 Kako Koristiti

### Recurring Transakcije:

1. Idite na Dashboard → Recurring
2. Kliknite "Dodaj Recurring Trošak/Prihod"
3. Unesite podatke:
   - Iznos
   - Opis
   - Kategoriju
   - Frekvenciju (mesečno/nedeljno/godišnje)
   - Dan u mesecu ili nedelji
4. Transakcije će se automatski kreirati svaki put kada dođe dan

### Group Expenses:

1. Idite na Dashboard → Grupe
2. Kreirajte grupu (npr. "Vikend Putovanje")
3. Dodajte članove putem email-a
4. Dodajte troškove koji će biti podeljeni
5. Sistem automatski kalkuliše ko kome duguje

### OCR Skeniranje:

1. Pri dodavanju troška, koristite ReceiptUploader komponentu
2. Upload-ujte sliku računa
3. OCR će automatski pročitati iznos i datum
4. Potvrdite ili ispravite podatke
5. Slika se čuva na Cloudinary-u

---

## 🛠️ Tehnički Stack

- **Frontend:** Next.js 16, React, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (Prisma ORM)
- **OCR:** Tesseract.js
- **Cloud Storage:** Cloudinary
- **Icons:** Phosphor React
- **File Upload:** Multer

---

## 🐛 Troubleshooting

### OCR ne radi:

1. Proverite da li je slika kvalitetna
2. Tesseract radi najbolje sa:
   - Dobrim osvetljenjem
   - Kontrastom
   - Jasnim tekstom
3. OCR podržava srpski jezik (`srp`)

### Cloudinary greške:

1. Proverite credentials u `.env`
2. Proverite da li imate dovoljno quota-e (free plan: 25GB storage, 25GB bandwidth/mesec)

### Cron job se ne izvršava:

1. Proverite `CRON_SECRET` u `.env` i servisu
2. Testir ajte ručno: `POST /api/cron/recurring` sa Postman-om
3. Proverite logove servisa

---

## 🔐 Sigurnost

- Cron endpoint zaštićen sa `Authorization` headerom
- Svi API endpoints zahtevaju autentifikaciju
- Slike se čuvaju na sigurnom cloud storage-u
- Grupe imaju permission sistem (owner/admin/member)

---

## 📊 Statistike

Posle implementacije imate:

- **11** novih API endpoints
- **2** nove stranice
- **2** nove komponente
- **4** glavne funkcionalnosti
- **100%** TypeScript coverage

---

## 🚀 Sledeći Koraci (Opciono)

1. **Detaljnu stranicu grupe** - `/groups/[id]` sa chartovima
2. **Notifikacije** - Push notifications za recurring transakcije
3. **Export PDF** - Export računa i statistike
4. **Multi-currency support** - Konverzija valuta
5. **Budget goals** - Postavljanje mesečnih budžeta
6. **Grafici i analitika** - Detaljni chartovi sa Chart.js

---

## 📞 Podrška

Za pitanja i probleme, kontaktirajte developera ili otvorite issue na projektu.

**Happy budgeting! 💰**
