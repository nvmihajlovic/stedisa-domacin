# PDF OCR Funkcionalnost

## 📄 Pregled

Sistem sada podržava upload i obradu **PDF računa** uz postojeću podršku za slike.

## ✨ Nove mogućnosti

### Podržani formati

**Slike:**
- JPEG / JPG
- PNG
- WEBP
- BMP
- GIF
- TIFF / TIF

**Dokumenti:**
- **PDF** (novo!)

### Kako radi PDF obrada?

1. **Tekst PDF** - Ako PDF sadrži tekst (npr. digitalni račun), sistem automatski ekstraktuje tekst direktno iz PDF-a
   - ⚡ Brzo i precizno
   - 🎯 Najbolje za elektronske račune
   
2. **Skenirana slika u PDF-u** - Ako je PDF zapravo skenirana slika:
   - ⚠️ Sistem će prijaviti da trenutno nije podržano
   - 💡 Preporuka: Koristite direktno sliku (JPG/PNG) za OCR
   - ✍️ Ili unesite podatke ručno

## 🎯 Gde se koristi?

ReceiptUploader komponenta je dostupna na:
- **Dashboard** - Brzo dodavanje troška
- **Troškovi stranica** - Dodavanje detaljnog troška
- **Prihodi stranica** - Dodavanje prihoda (opciono)

## 💻 Tehnička implementacija

### Backend (API)
- **Endpoint:** `/api/ocr`
- **Biblioteka:** `pdf-parse` za ekstrakciju teksta iz PDF-a
- **Fallback:** Ako PDF nema tekst, vraća poruku korisniku

### Frontend (Komponenta)
- **Komponenta:** `ReceiptUploader.tsx`
- **Accept:** `image/*,application/pdf`
- **Preview:** PDF prikazuje ikonu umesto slike

### Instalacija paketa

```bash
npm install pdf-parse
```

## 📊 OCR Preciznost

Sistem automatski prepoznaje:
- **Iznos** - Prepoznaje brojeve sa valutom (RSD, дин)
- **Datum** - DD.MM.YYYY ili YYYY-MM-DD format
- **Opis** - Prepoznaje poznate kategorije:
  - Električna energija (EPS)
  - Voda (BVK)
  - Gas (Srbijagas)
  - Telefon (Telekom, Yettel, A1, VIP)
  - Internet (SBB)
  - I još...

## 🔮 Budući razvoj

Planirane nadogradnje:
- [ ] OCR za skenirane PDF-ove (konverzija PDF → slika → OCR)
- [ ] Multi-page PDF podrška
- [ ] Prepoznavanje tabela u PDF-u
- [ ] AI-powered parsing (GPT-4 Vision API)
- [ ] Batch upload (više fajlova odjednom)

## 🐛 Poznati problemi

1. **Skenirani PDF-ovi** trenutno nisu podržani
   - **Rešenje:** Koristite sliku direktno ili ručni unos
   
2. **Multi-page PDF** - Obrađuje se samo prva stranica
   - **Rešenje:** Izdvojite prvu stranicu ili koristite single-page PDF

## 📝 Primer korišćenja

```tsx
import ReceiptUploader from "@/lib/components/ReceiptUploader"

<ReceiptUploader
  onUploadComplete={(data) => {
    // data.amount - ekstraktovani iznos
    // data.date - ekstraktovani datum
    // data.description - prepoznata kategorija
    // data.items - lista stavki
    console.log("OCR rezultat:", data)
  }}
/>
```

## 🎨 UI Feedback

- **Drag & Drop** - Povuci PDF ili sliku
- **Preview** - PDF prikazuje ikonu, slike prikazuju preview
- **Status bar** - "Obrađujem račun sa OCR-om..."
- **Modal** - Potvrda ekstraktovanih podataka pre popunjavanja forme
- **Error handling** - Jasne poruke greške za nepodržane formate

## 📚 Reference

- [pdf-parse dokumentacija](https://www.npmjs.com/package/pdf-parse)
- [tesseract.js OCR](https://tesseract.projectnaptha.com/)
- [NOVE_FUNKCIONALNOSTI.md](./NOVE_FUNKCIONALNOSTI.md) - Kompletan pregled svih feature-a

---

**Datum implementacije:** 29. Novembar 2025  
**Status:** ✅ Aktivno (Basic PDF text extraction)  
**Verzija:** 1.0.0
