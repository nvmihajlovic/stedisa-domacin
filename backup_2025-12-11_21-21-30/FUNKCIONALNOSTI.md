# DOMACIN - Funkcionalnosti aplikacije

## 🔐 Autentifikacija i korisnici
- Registracija sa email verifikacijom
- Login / Logout
- Zaboravljena lozinka (reset email)
- Promena lozinke
- Promena email adrese
- Profil korisnika (ime, profilna slika)

## 💰 Troškovi (Expenses)
- Dodavanje troškova (ručno ili OCR skeniranje)
- Kategorije troškova (prilagodljive)
- OCR - skeniranje računa (fotografija/PDF) sa automatskim prepoznavanjem iznosa
- Multi-valuta podrška (automatska konverzija u RSD)
- Filtriranje po datumu, kategoriji, iznosu
- Bulk brisanje troškova
- Export u Excel/CSV
- Notifikacije o novim troškovima u grupama

## 📈 Prihodi (Incomes)
- Dodavanje prihoda
- Kategorije prihoda (prilagodljive)
- Filtriranje po datumu, kategoriji, iznosu
- Bulk brisanje prihoda
- Export u CSV

## 📊 Dashboard
- Ukupni prihodi/troškovi/bilans za trenutni mesec
- Grafički prikaz troškova po kategorijama (pie chart)
- Grafikon troškova vs prihoda po mesecima (line chart)
- Grafikon troškova po danima (bar chart)
- Top 5 kategorija po potrošnji
- Poslednje 5 transakcija
- Brza statistika (broj transakcija, prosečan trošak)

## 📅 Recurring transakcije
- Ponavljajući troškovi/prihodi (dnevno, nedeljno, mesečno, godišnje)
- Automatsko kreiranje transakcija po rasporedu
- Cron job za periodično procesiranje
- Pauziranje/aktiviranje recurring transakcija
- Pregled narednih plaćanja

## 💼 Budžet (Budgets)
- Kreiranje budžeta po kategoriji ili ukupnog
- Period budžeta (mesečni, kvartalni, godišnji, custom)
- Praćenje potrošnje u realnom vremenu
- Breakdown budžeta (detalji troškova)
- Notifikacije kada se pređe 80% ili 100% budžeta
- Cron job za automatsku proveru budžeta

## 👥 Grupe (Group budgeting)
- Kreiranje grupa (npr. porodica, cimeri)
- Pozivanje članova putem email linka
-Admin i član uloge
- Deljenje troškova u grupi
- Grupni budžeti
- Settlements - poravnanja dugova između članova
  - Automatski algoritam za optimizaciju plaćanja
  - Kreiranje settlement zahteva
  - Odobravanje/odbijanje settlements-a
- Statistika grupe (ukupni troškovi, potrošnja po članu)
- Notifikacije za grupne aktivnosti

## 🔔 Notifikacije
- In-app notifikacije
- Budget alert (80%, 100% budžeta)
- Grupne notifikacije (novi član, novi trošak, settlement)
- Mark as read/unread
- Bulk brisanje notifikacija

## 📑 Kategorije
- Prilagodljive kategorije troškova i prihoda
- Ikone za kategorije
- Provera da li se kategorija koristi pre brisanja
- Restore sistemskih kategorija

## 📊 Statistika
- Mesečna statistika
- Grafici po kategorijama
- Top kategorije
- Trendovi po mesecima
- Export u PDF

## 🔄 Export/Backup
- CSV export troškova i prihoda
- Excel export sa formatiranjem
- PDF export finansijskih izveštaja
- Full JSON backup svih korisničkih podataka

## 🌍 Multi-valuta
- Automatska konverzija valuta u RSD
- Real-time kursna lista
- Podrška za EUR, USD, GBP, CHF, itd.

## 🎨 Personalizacija
- Dark/Light mode
- Prilagodljive boje UI-a
- Accent colors
- Spremanje user preferences

## 👨‍💼 Admin panel
- Pregled svih korisnika
- Blokiranje/Odblokiranje korisnika
- Statistika sistema (ukupno korisnika, transakcija)
- Moderacija

## 🔍 Napredne funkcije
- Vendor learning - AI prepoznavanje prodavaca iz OCR-a
- Financial insights - predviđanja i saveti
- Automatsko kategorizovanje troškova
- Smart filtering i pretraga

## 🔒 Sigurnost
- JWT autentifikacija
- Password hashing (bcrypt)
- Email verifikacija
- Reset token validacija
- Role-based access (admin/user)

## 📱 UX Features
- Responsive design (mobile-first)
- Loading states
- Error handling
- Toast notifikacije
- Smooth animacije (Framer Motion)
- Infinite scroll
- Optimistični UI updates

## 🔧 Tehnički detalji
- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma ORM
- SQLite (dev) / PostgreSQL (production)
- Google Cloud Vision API (OCR)
- Tesseract.js (fallback OCR)
- Recharts (grafici)
- Tailwind CSS
- Framer Motion (animacije)
