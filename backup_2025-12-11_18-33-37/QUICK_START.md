# Quick Start Guide - Nove Funkcionalnosti

## 🚀 Brzi Setup (5 minuta)

### 1. Cloudinary Setup (OBAVEZNO za slike)

1. Idite na [cloudinary.com](https://cloudinary.com) i napravite besplatan nalog
2. Na Dashboard-u, kopirajte:
   - Cloud Name
   - API Key
   - API Secret
3. Dodajte u `.env` fajl:

```env
CLOUDINARY_CLOUD_NAME=vaš_cloud_name
CLOUDINARY_API_KEY=vaš_api_key
CLOUDINARY_API_SECRET=vaš_api_secret
```

### 2. Cron Secret (Za recurring transakcije)

Dodajte random string u `.env`:

```env
CRON_SECRET=neka_random_string_ovde_123456
```

### 3. Pokrenite Server

```bash
npm run dev
```

### 4. Testiranje Funkcionalnosti

#### ✅ Recurring Transakcije
1. Otvorite http://localhost:3000/dashboard
2. Kliknite **Recurring** dugme
3. Dodajte test recurring trošak (npr. "Netflix - 1200 RSD mesečno")
4. Za test automatske kreacije:
   ```bash
   curl -X POST http://localhost:3000/api/cron/recurring \
     -H "Authorization: Bearer vaš_cron_secret"
   ```

#### ✅ Group Expenses
1. Otvorite http://localhost:3000/dashboard
2. Kliknite **Grupe** dugme
3. Kreirajte test grupu
4. Dodajte članove (morate imati drugi nalog za test)

#### ✅ OCR Skeniranje
1. Idite na Expenses ili Incomes
2. Dodajte novi trošak/prihod
3. Upload-ujte sliku računa
4. OCR će automatski očitati podatke

---

## 🎯 Sve Novo u Aplikaciji

### Novi API Endpoints (15)
- `/api/recurring-expenses` (GET, POST)
- `/api/recurring-expenses/[id]` (PATCH, DELETE)
- `/api/recurring-incomes` (GET, POST)
- `/api/recurring-incomes/[id]` (PATCH, DELETE)
- `/api/groups` (GET, POST)
- `/api/groups/[id]` (GET, PATCH, DELETE)
- `/api/groups/[id]/members` (POST)
- `/api/groups/[id]/members/[memberId]` (DELETE)
- `/api/groups/[id]/expenses` (GET, POST)
- `/api/ocr` (POST)
- `/api/cron/recurring` (POST, GET)

### Nove Stranice (2)
- `/recurring` - Upravljanje recurring transakcijama
- `/groups` - Lista i upravljanje grupama

### Nove Komponente (2)
- `<ReceiptUploader />` - OCR upload sa preview
- `<CategorySelector />` - Grid picker (već postojao)

### Dashboard Navigacija
- Dodat **Recurring** button (narandžasta Repeat ikona)
- Grid promenjen sa 4 na 5 kolona

---

## 📱 Kako Koristiti Svaku Funkciju

### 1. RECURRING TRANSAKCIJE

**Korak po korak:**
1. Dashboard → Recurring
2. "Dodaj Recurring Trošak/Prihod"
3. Popunite:
   - Iznos: 1500
   - Opis: Netflix pretplata
   - Kategorija: Pretplate
   - Frekvencija: Mesečno
   - Dan u mesecu: 5
4. Sačuvajte
5. Automatski će se kreirati 5. svakog meseca!

**Toggle On/Off:**
- Kliknite na "Aktivno" dugme da pauzira te transakcije
- Kliknite ponovo da aktivirate

---

### 2. GROUP EXPENSES

**Scenario: Vikend putovanje sa prijateljima**

1. Dashboard → Grupe → "Nova Grupa"
2. Ime: "Vikend u Kopaoniku"
3. Dodaj članove:
   - Marko (marko@email.com)
   - Ana (ana@email.com)
   - Jovana (jovana@email.com)
4. Dodaj troškove:
   - Hotel: 15000 RSD (platila Ana)
   - Benzin: 5000 RSD (platio ti)
   - Hrana: 8000 RSD (platio Marko)
5. Sistem automatski kalkuliše:
   - Ukupno: 28000 RSD
   - Po osobi: 7000 RSD
   - Ko kome duguje

---

### 3. OCR SKENIRANJE

**Scenario: Kupovina u supermarketu**

1. Expenses → Dodaj Novi
2. U modalu, klikni na upload zone
3. Odaberi sliku računa (može i drag & drop)
4. OCR očitava:
   - Iznos: 3.456,78 RSD ✅
   - Datum: 26.11.2024 ✅
   - Stavke: Hleb, Mleko, Jaja... ✅
5. Potvrdi ili ispravi ako treba
6. Slika se čuva na Cloudinary-u

**Pro tip:** Najbolji rezultati sa:
- Dobrim osvetljenjem
- Ravnom površinom
- Jasno vidljivim tekstom

---

## 🔥 Pro Tips

### Recurring Transakcije
- Postavite sve fiksne troškove (stanarina, struja, internet)
- Postavite platu kao recurring income
- Nedeljna frekvencija odlična za vikend shopping

### Group Expenses
- Jedna grupa za putovanja
- Jedna grupa za stan (cimerke)
- Jedna grupa za druženja (restorani, kafići)

### OCR
- Slikajte račune odmah u prodavnici
- iPhone: Koristite portrait mode za bolje fokusiranje
- Android: Koristite Google Lens pre upload-a

---

## 🐛 Česti Problemi i Rešenja

### "OCR ne radi dobro"
**Rešenje:** OCR najbolje radi sa:
- Novijim računima (ne izbledeli)
- Dobrim osvetljenjem
- Ravno uslikani računi (ne pod uglom)

### "Cloudinary upload error"
**Rešenje:** 
1. Proverite `.env` credentials
2. Proverite besplatni quota (25GB/mesec)
3. Restartujte server nakon dodavanja env vars

### "Cron job se ne izvršava"
**Rešenje:**
1. Testirajte ručno endpoint
2. Proverite `CRON_SECRET`
3. Na Vercel-u, cron radi automatski

---

## 📈 Statistike Implementacije

```
✅ 4 Velike Funkcionalnosti
✅ 15 API Endpoints
✅ 2 Nove Stranice
✅ 2 Nove Komponente
✅ 3 Nove NPM Pakete
✅ Cloudinary Integracija
✅ OCR sa Tesseract.js
✅ Cron Job Setup
✅ 100% TypeScript
```

---

## 🎉 Gotovo!

Sada imate **kompletnu fintech aplikaciju** sa:
- ✅ Automatskim transakcijama
- ✅ Deljenjem troškova
- ✅ OCR skeniranjem
- ✅ Cloud storage-om

**Uživajte u korišćenju! 💰📊🚀**
