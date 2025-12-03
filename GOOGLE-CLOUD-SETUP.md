# Google Cloud Vision OCR Setup Guide

Kompletna uputstva za setup Google Cloud Vision API za OCR skeniranje računa.

---

## 📋 Preduslovi

- Google Cloud nalog (besplatan tier dostupan)
- Kredit/debit kartica (za verifikaciju, neće se naplatiti ništa)
- 5-10 minuta vremena

---

## 🚀 Korak 1: Kreiranje Google Cloud Projekta

1. **Idi na Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Kreiraj novi projekat:**
   - Klikni na dropdown pored "Google Cloud" (gore levo)
   - Klikni "NEW PROJECT"
   - Ime projekta: `domacin-ocr` (ili bilo koje ime)
   - Klikni "CREATE"

3. **Selektuj projekat:**
   - Pričekaj dok se projekat kreira (10-30 sekundi)
   - Izaberi novi projekat iz dropdown menija

---

## 🔑 Korak 2: Omogući Vision API

1. **Idi na APIs & Services:**
   - U levom meniju, klikni "APIs & Services" → "Enabled APIs & services"

2. **Enable Vision API:**
   - Klikni "+ ENABLE APIS AND SERVICES" (gore)
   - Pretraži: `Vision API`
   - Klikni na "Cloud Vision API"
   - Klikni "ENABLE"

3. **Pričekaj aktivaciju:**
   - API će biti aktivan za 1-2 minute

---

## 🔐 Korak 3: Kreiranje Service Account

1. **Idi na Credentials:**
   - Levi meni → "APIs & Services" → "Credentials"

2. **Kreiraj Service Account:**
   - Klikni "+ CREATE CREDENTIALS" → "Service account"
   - Service account name: `domacin-ocr-service`
   - Service account ID: (auto-generisan)
   - Klikni "CREATE AND CONTINUE"

3. **Dodaj ulogu (Role):**
   - Select a role → "Cloud Vision" → "Cloud Vision API User"
   - Klikni "CONTINUE"
   - Klikni "DONE" (preskoči user access)

---

## 📁 Korak 4: Download JSON Key

1. **Otvori Service Account:**
   - U "Credentials" stranici, idi na "Service Accounts" sekciju
   - Klikni na `domacin-ocr-service@...` email

2. **Kreiraj Key:**
   - Idi na tab "KEYS" (gore)
   - Klikni "ADD KEY" → "Create new key"
   - Format: **JSON**
   - Klikni "CREATE"

3. **Download fajl:**
   - JSON fajl će automatski biti preuzet
   - **ČUVAJ OVU FAJL BEZBEDNO** - sadrži pristupne kredencijale!
   - Ne upload-uj na GitHub ili javni folder

---

## ⚙️ Korak 5: Konfiguracija Environment Variables

### **Opcija A: Lokalni Development (preporučeno za testiranje)**

1. Premesti JSON key u bezbedan folder (ne u projekat):
   ```
   C:\Users\TvojeIme\.gcloud\domacin-ocr-service-key.json
   ```

2. Dodaj u `.env.local` fajl:
   ```env
   # Google Cloud Vision OCR
   GOOGLE_APPLICATION_CREDENTIALS=C:\Users\TvojeIme\.gcloud\domacin-ocr-service-key.json
   ```

3. Restart dev servera:
   ```bash
   npm run dev
   ```

### **Opcija B: Vercel Production (za deployment)**

1. Otvori JSON key fajl u text editoru

2. Kopiraj **ceo sadržaj** fajla

3. Idi na Vercel Dashboard → Project Settings → Environment Variables

4. Dodaj sledeće varijable:

   **GOOGLE_CLOUD_PROJECT_ID:**
   ```
   domacin-ocr (tvoj project ID iz JSON-a)
   ```

   **GOOGLE_CLOUD_CLIENT_EMAIL:**
   ```
   domacin-ocr-service@domacin-ocr.iam.gserviceaccount.com
   (iz JSON-a, polje "client_email")
   ```

   **GOOGLE_CLOUD_PRIVATE_KEY:**
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
   -----END PRIVATE KEY-----
   
   (iz JSON-a, polje "private_key" - kopiraj SA \n karakterima!)
   ```

5. Redeploy aplikaciju na Vercelu

---

## 🧪 Korak 6: Testiranje

### **Test 1: API Status Check**

```bash
# Pokreni dev server
npm run dev

# Otvori u browseru ili curl:
# GET http://localhost:3000/api/ocr
```

**Očekivani odgovor:**
```json
{
  "success": true,
  "status": "configured",
  "message": "Google Vision OCR is ready"
}
```

### **Test 2: OCR Skeniranje**

1. Idi na stranicu sa expense formom
2. Klikni "Skeniraj račun" dugme
3. Upload sliku računa (JPG, PNG)
4. Proveri da li se iznos, datum, vendor ekstraktuju

---

## 💰 Cena & Limiti

### **Free Tier (100% besplatno):**
- **1,000 OCR skeniranja mesečno = $0**
- Nakon toga: $1.50 per 1,000 skeniranja

### **Primeri:**

| Korisnika | Računa/mesec | Skeniranja | Cena       |
|-----------|--------------|------------|------------|
| 100       | 5            | 500        | **$0**     |
| 500       | 5            | 2,500      | **$2.25**  |
| 1,000     | 10           | 10,000     | **$13.50** |

**Napomena:** Za 100-500 korisnika, većinom ćeš biti u FREE tieru!

---

## 🔒 Security Best Practices

### ✅ **DO:**
- Čuvaj JSON key izvan projekta (npr. `C:\Users\TvojeIme\.gcloud\`)
- Dodaj `.gcloud/` u `.gitignore`
- Koristi environment variables, NIKADA ne hardcode-uj kredencijale
- Na Vercelu koristi inline credentials (preko env vars)

### ❌ **DON'T:**
- Ne commit-uj JSON key u Git
- Ne upload-uj na GitHub (čak ni u private repo)
- Ne ostavljaj key u public folderu
- Ne šeri key sa drugim ljudima

---

## 🐛 Troubleshooting

### **Greška: "Google Cloud credentials not configured"**
- **Razlog:** Environment variable nije setovana ili je neispravna
- **Rešenje:**
  1. Proveri da li postoji `.env.local` fajl
  2. Proveri da li je putanja do JSON key ispravna
  3. Restart dev servera (`Ctrl+C` pa `npm run dev`)

### **Greška: "Invalid image format"**
- **Razlog:** Slika nije u base64 formatu ili je neispravna
- **Rešenje:**
  1. Proveri da li je slika ispravna (otvori je u image vieweru)
  2. Proveri da li je fajl manji od 10MB
  3. Koristi JPG, PNG, ili WebP format

### **Greška: "Quota exceeded"**
- **Razlog:** Prešao si 1,000 besplatnih skeniranja ovog meseca
- **Rešenje:**
  1. Pričekaj novi mesec (limiti se resetuju)
  2. Ili plati za dodatna skeniranja ($1.50/1000)

### **Greška: "Permission denied"**
- **Razlog:** Service account nema Vision API ulogu
- **Rešenje:**
  1. Idi na IAM & Admin → IAM
  2. Pronađi service account
  3. Edit → Add role → "Cloud Vision API User"

---

## 📚 Dodatni Resources

- **Google Vision Docs:** https://cloud.google.com/vision/docs
- **Pricing Calculator:** https://cloud.google.com/products/calculator
- **API Reference:** https://cloud.google.com/vision/docs/reference/rest

---

## ✅ Checklist

Pre nego što nastaviš sa implementacijom:

- [ ] Google Cloud projekat kreiran
- [ ] Vision API omogućen
- [ ] Service account kreiran
- [ ] JSON key download-ovan i sačuvan na bezbednom mestu
- [ ] Environment variable setovana (`GOOGLE_APPLICATION_CREDENTIALS`)
- [ ] Test API poziv uspešan (`/api/ocr` vraća "configured")
- [ ] OCR Upload komponenta testirana sa realnim računom

---

**🎉 Gotovo! Sada možeš koristiti Google Vision OCR u aplikaciji!**
