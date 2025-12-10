# 🔐 Strategija za Backup Podataka - Domacin

## ❌ PROBLEM KOJI SMO UPRAVO REŠILI
**Bug:** Kada korisnik obriše grupu, svi troškovi i prihodi te grupe su se brisali CASCADE-om.
**Fix:** Promenili smo `onDelete: Cascade` → `onDelete: SetNull` za Expense i Income.
**Rezultat:** Sada kada se grupa obriše, troškovi/prihodi postaju lični (groupId = null) umesto da se brišu.

---

## 💾 OPCIJE ZA BACKUP SISTEMA

### **OPCIJA 1: SQLite Automatski Backup (BESPLATNO)** ⭐ PREPORUČENO
**Kako radi:**
- Svaki dan u 3:00 ujutru kreira se backup SQLite baze
- Backup se čuva lokalno u `./backups/` folderu
- Zadržava se poslednjih 7 dnevnih backupa
- Export u JSON format za dodatnu sigurnost

**Troškovi:** $0 (sve lokalno)

**Implementacija:**
```javascript
// Cron job (Next.js API route)
// Radi automatski na serveru
// Backup se kreira bez user interakcije
```

**Prednosti:**
✅ Potpuno besplatno
✅ Automatsko
✅ Zadržava istoriju (7 dana)
✅ Lako restore

**Mane:**
⚠️ Backup je na istom serveru (ako server padne, backup je nedostupan)
⚠️ Ručno preuzimanje za offline storage

---

### **OPCIJA 2: AWS S3 Cloud Backup (JEFTINO)** ☁️
**Kako radi:**
- Automatski upload backupa na AWS S3
- Geografski distribuiran backup (bezbedno)
- Restore sa bilo kog uređaja
- Versioning - čuva sve verzije

**Troškovi AWS S3:**
- **Storage:** $0.023 po GB mesečno
  - 10MB baza = **$0.00023/mesec** (~0 RSD)
  - 100MB baza = **$0.0023/mesec** (~0.27 RSD)
  - 1GB baza = **$0.023/mesec** (~2.70 RSD)

- **PUT requests:** $0.005 per 1000 zahteva
  - 1 backup dnevno = 30 zahteva/mesec = **$0.00015** (~0.02 RSD)

- **GET requests (restore):** $0.0004 per 1000 zahteva
  - Skoro besplatno osim ako ne restoreuješ stalno

**UKUPNO za prosečnu bazu (50MB):**
**~$0.0012/mesec = ~0.14 RSD/mesec = 1.7 RSD/godinu** 💰

**Prednosti:**
✅ Cloud storage (siguran čak i ako server padne)
✅ Geografski backup (duplikat na više lokacija)
✅ Automatski
✅ Restore sa bilo kog uređaja
✅ JEFTIN (skoro besplatan)

**Mane:**
⚠️ Potreban AWS nalog
⚠️ Minimalna konfiguracija

---

### **OPCIJA 3: Vercel Blob Storage (JEDNOSTAVNO)** 🚀
**Kako radi:**
- Vercel-ov cloud storage (integrisano sa Next.js)
- Automatski upload
- Dashboard za pregled backupa
- Jednostavna integracija

**Troškovi Vercel Blob:**
- **Free tier:** 500MB storage BESPLATNO
- **Pro tier ($20/mesec):** 100GB storage

**Za našu aplikaciju:**
- 10MB baza × 30 dana = 300MB storage
- **BESPLATNO** (unutar free tier-a!)

**Prednosti:**
✅ BESPLATNO za male aplikacije
✅ Najlakša integracija (1 install, 5 linija koda)
✅ Cloud storage
✅ Dashboard za upravljanje

**Mane:**
⚠️ Limit od 500MB (ali dovoljno za godinu dana backupa)

---

### **OPCIJA 4: Google Cloud Storage (ALTERNATIVA)**
**Troškovi:**
- Slično AWS S3
- $0.020 po GB mesečno
- **~$0.001/mesec za 50MB** (~0.12 RSD)

---

## 🎯 PREPORUKA

### Za PRODUKCIJU:
**Kombinacija Opcija 1 + Opcija 2:**
1. **Lokalni backup** (besplatno) - brz restore
2. **AWS S3 backup** (0.14 RSD/mesec) - sigurnost

### Za TESTIRANJE:
**Opcija 1** - SQLite lokalni backup (potpuno besplatno)

---

## 🛡️ DODATNE SIGURNOSNE MERE (ŠTO SMO URADILI)

### 1. **onDelete: SetNull umesto Cascade**
```prisma
// STARO (OPASNO):
group Group? @relation(..., onDelete: Cascade)  // ❌ Briše sve!

// NOVO (BEZBEDNO):
group Group? @relation(..., onDelete: SetNull)  // ✅ Samo razdvaja
```

**Šta to znači:**
- Brisanje grupe → troškovi/prihodi postaju lični
- NIŠTA se ne briše!

### 2. **Soft Delete za kritične resurse (OPCIONO)**
Umesto da brišemo grupu, možemo je označiti kao `isDeleted: true`:
```prisma
model Group {
  isDeleted Boolean @default(false)
  deletedAt DateTime?
}
```

**Prednosti:**
- Backup kroz "trash" sistem
- Restore za 30 dana
- Istorija brisanja

---

## 📊 POREĐENJE TROŠKOVA

| Opcija | Mesečno | Godišnje | Pros |
|--------|---------|----------|------|
| **Lokalni backup** | $0 | $0 | Besplatno, brzo |
| **AWS S3** | $0.001 | $0.012 (~1.5 RSD) | Cloud, bezbedno |
| **Vercel Blob** | $0 | $0 | Besplatno, jednostavno |
| **Google Cloud** | $0.001 | $0.012 (~1.5 RSD) | Cloud, bezbedno |

---

## ✅ ŠTA ĆU IMPLEMENTIRATI

1. ✅ **onDelete: SetNull** - ZAVRŠENO
2. 🔄 **Lokalni automatski backup** - Mogu odmah
3. 🔄 **AWS S3 cloud backup** - Mogu dodati (potreban AWS key)
4. 🔄 **User-triggered export** - "Preuzmi backup" dugme

---

## 🚀 SLEDEĆI KORACI

**Odaberi opciju:**
1. Samo lokalni backup (besplatno)
2. Lokalni + AWS S3 (1.5 RSD/godinu)
3. Lokalni + Vercel Blob (besplatno)
4. Sve tri opcije (maksimalna sigurnost)

**Pitanja:**
- Koliko često backup? (dnevno/nedeljno?)
- Koliko verzija zadržati? (7/30/365 dana?)
- Da li korisnici mogu ručno pokrenuti backup?
