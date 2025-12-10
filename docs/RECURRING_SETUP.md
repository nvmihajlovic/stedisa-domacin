# Automatsko Kreiranje Recurring Troškova i Prihoda

## 📋 Pregled

Sistem automatski kreira troškove i prihode koji su označeni kao "ponavljajući" na osnovu definisanog intervala:
- **Mesečno** - svakog meseca na određeni dan
- **Kvartalno** - svaka 3 meseca
- **Polugodišnje** - svakih 6 meseci
- **Godišnje** - jednom godišnje

## 🔧 Kako postaviti automatsko kreiranje (Windows)

### Korak 1: Postavi Secret Key

1. Otvori `.env.local` fajl
2. Dodaj liniju:
   ```
   CRON_SECRET_KEY=tvoj-siguran-tajni-kljuc-ovde
   ```
3. Sačuvaj fajl i restartuj aplikaciju

### Korak 2: Ažuriraj PowerShell Script

1. Otvori `scripts\recurring-cron.ps1`
2. Zameni liniju:
   ```powershell
   $SECRET_KEY = "your-secret-key-here"
   ```
   sa:
   ```powershell
   $SECRET_KEY = "tvoj-siguran-tajni-kljuc-ovde"
   ```
   (koristi isti key kao u `.env.local`)

3. Ažuriraj `$API_URL` ako aplikacija nije na `localhost:3000`

### Korak 3: Postavi Windows Task Scheduler

1. **Otvori Task Scheduler**:
   - Pritisni `Win + R`
   - Ukucaj `taskschd.msc`
   - Pritisni Enter

2. **Kreiraj novi Task**:
   - Klikni na `Create Basic Task...`
   - **Name**: `Domacin Recurring Transactions`
   - **Description**: `Automatski kreira ponavljajuće troškove i prihode`
   - Klikni `Next`

3. **Postavi Trigger** (kada se izvršava):
   - Izaberi: `Daily` (Svakodnevno)
   - Klikni `Next`
   - **Start**: Postavi na sutra u 00:01
   - **Recur every**: `1` days
   - Klikni `Next`

4. **Postavi Action** (šta se izvršava):
   - Izaberi: `Start a program`
   - Klikni `Next`
   - **Program/script**: `powershell.exe`
   - **Add arguments**:
     ```
     -ExecutionPolicy Bypass -File "C:\Users\WEB STUDIO LINK\OneDrive\Desktop\stedisa\domacin-final\scripts\recurring-cron.ps1"
     ```
   - Klikni `Next`

5. **Završi setup**:
   - Proveri summary
   - **Checkbox**: Otvori properties nakon kreiranja
   - Klikni `Finish`

6. **Napredna podešavanja** (u Properties):
   - Tab `General`:
     - ☑️ **Run whether user is logged on or not**
     - ☑️ **Run with highest privileges**
   - Tab `Conditions`:
     - ☐ **Start the task only if the computer is on AC power** (ukloni checkmark)
   - Tab `Settings`:
     - ☑️ **Allow task to be run on demand**
     - ☑️ **Run task as soon as possible after a scheduled start is missed**
   - Klikni `OK`

7. **Unesi Windows password** kada se zatraži

### Korak 4: Testiraj

1. **Ručno pokreni task**:
   - U Task Scheduler-u, pronađi `Domacin Recurring Transactions`
   - Desni klik → `Run`

2. **Proveri log**:
   - Otvori `scripts\recurring-cron.log`
   - Trebalo bi da vidiš:
     ```
     [2025-12-10 00:01:00] 🔄 Starting recurring transactions processing...
     [2025-12-10 00:01:02] ✅ Processing completed successfully
     [2025-12-10 00:01:02]    Expenses created: 2
     [2025-12-10 00:01:02]    Incomes created: 1
     ```

3. **Proveri u aplikaciji**:
   - Idi na stranicu Troškovi
   - Trebalo bi da vidiš nove automatski kreirane troškove

## 🎯 Kako dodati recurring trošak

1. **Idi na Troškovi** stranicu
2. Klikni **+ Dodaj trošak**
3. Popuni osnovne podatke (iznos, opis, kategorija)
4. **Uključi switch** "Ponavlja se"
5. Izaberi **vrstu ponavljanja**:
   - Mesečno
   - Kvartalno (svakih 3 meseca)
   - Polugodišnje (svakih 6 meseci)
   - Godišnje
6. Izaberi **dan u mesecu** (1-28)
7. Postavi **prvo ponavljanje** datum
8. Klikni **Dodaj trošak**

## 📊 Primeri

### Primer 1: Stanarina (mesečno)
- **Iznos**: 50,000 RSD
- **Opis**: Stanarina
- **Kategorija**: Stanovanje i komunalije
- **Ponavlja se**: ✅
- **Vrsta**: Mesečno
- **Dan u mesecu**: 1. dan
- **Prvo ponavljanje**: 2025-01-01

→ Sistem će automatski kreirati trošak **1. dana svakog meseca**

### Primer 2: Osiguranje (polugodišnje)
- **Iznos**: 30,000 RSD
- **Opis**: Auto osiguranje
- **Kategorija**: Transport
- **Ponavlja se**: ✅
- **Vrsta**: Polugodišnje (svakih 6 meseci)
- **Dan u mesecu**: 15. dan
- **Prvo ponavljanje**: 2025-01-15

→ Sistem će kreirati trošak **15. januara i 15. jula svake godine**

### Primer 3: Netflix (mesečno)
- **Iznos**: 1,200 RSD
- **Opis**: Netflix pretplata
- **Kategorija**: Zabava
- **Ponavlja se**: ✅
- **Vrsta**: Mesečno
- **Dan u mesecu**: 5. dan
- **Prvo ponavljanje**: 2025-01-05

→ Sistem će automatski kreirati trošak **5. dana svakog meseca**

## 🔍 Provera i Održavanje

### Proveri status u Task Scheduler
1. Otvori Task Scheduler
2. Pronađi `Domacin Recurring Transactions`
3. Proveri **Last Run Result** (trebalo bi `0x0` = success)
4. Proveri **Last Run Time**

### Proveri log fajl
```powershell
Get-Content "C:\Users\WEB STUDIO LINK\OneDrive\Desktop\stedisa\domacin-final\scripts\recurring-cron.log" -Tail 50
```

### Ručno pokreni processing
```powershell
cd "C:\Users\WEB STUDIO LINK\OneDrive\Desktop\stedisa\domacin-final\scripts"
.\recurring-cron.ps1
```

### API poziv direktno (za testiranje)
```powershell
$headers = @{
    "Authorization" = "Bearer tvoj-secret-key"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/recurring/process" -Method POST -Headers $headers
```

## ⚠️ Važne Napomene

1. **Aplikacija mora biti pokrenuta** da bi cron radio (ili deploy na server)
2. **Secret key** mora biti isti u `.env.local` i PowerShell scriptu
3. **Dan u mesecu** je ograničen na 1-28 (sigurno za sve mesece)
4. **Automatsko kreiranje** se dešava u **00:01** svake noći
5. Ako računar nije upaljen, task će se pokrenuti čim se upali (ako je "run as soon as possible" uključeno)

## 🚀 Deployment na Produkciju

Kada aplikaciju deploy-uješ na server (npr. Vercel, Railway, AWS):

1. **Koristi serverless cron**:
   - Vercel: Koristi Vercel Cron Jobs
   - Railway: Koristi Railway Cron Jobs
   - AWS: Koristi EventBridge

2. **Ili koristi external cron service**:
   - [cron-job.org](https://cron-job.org) - besplatno
   - [EasyCron](https://www.easycron.com) - besplatno
   - Konfiguriši da poziva `https://tvoja-domena.com/api/recurring/process`
   - Dodaj Authorization header sa secret key-em

## 📝 Troubleshooting

**Problem**: Task se ne izvršava
- Proveri da li je Task Scheduler servis pokrenut
- Proveri da li je task enabled
- Proveri da li je password ispravan

**Problem**: Log pokazuje greške
- Proveri da li je aplikacija pokrenuta
- Proveri da li je secret key ispravan
- Proveri URL (localhost:3000 ili drugi port)

**Problem**: Troškovi se ne kreiraju
- Proveri da li postoje aktivni recurring troškovi sa `nextExecutionAt` u prošlosti
- Proveri bazu podataka:
  ```sql
  SELECT * FROM RecurringExpense WHERE isActive = 1 AND nextExecutionAt <= datetime('now');
  ```

**Problem**: Dupli troškovi
- Nemoj pokretati script ručno ako je već pokrenut automatski
- Proveri log da vidiš da li se task izvršava više puta dnevno
