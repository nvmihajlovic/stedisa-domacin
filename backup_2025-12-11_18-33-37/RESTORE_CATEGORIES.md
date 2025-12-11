# Restore Default Categories

Ova skripta obnavlja default kategorije za tvoj nalog.

## 🚀 Kako koristiti:

### Metod 1: Preko skripte (preporučeno)

```bash
npm run restore-categories nvmihajlovic@gmail.com
```

### Metod 2: Direktno pozivanje

```bash
node scripts/restore-categories.js nvmihajlovic@gmail.com
```

### Metod 3: Preko API-ja (kada si ulogovan)

```bash
curl -X POST http://localhost:3000/api/categories/restore \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

## 📋 Šta radi:

- ✅ Proverava koje kategorije imaš
- ✅ Dodaje default kategorije koje nedostaju
- ✅ **NE briše** postojeće kategorije
- ✅ Vraća statistiku koliko je dodato
- ✅ Automatski se poziva pri loginu (od sada)

## 🎯 Kada koristiti:

- Nakon `npx prisma migrate reset`
- Ako slučajno obrišeš sve kategorije
- Ako želiš da vratiš default kategorije

## 📦 Default kategorije:

### Troškovi (27):
hrana i piće, gorivo, hemija, kozmetika, odeća, obuća, komunalije, energija, pokućstvo, restorani, zabava, putovanje, stanarina, pokloni, kredit, lična nega, rekreacija, održavanje doma, održavanje vozila, registracija vozila, školarina, porezi, osiguranje, bankarski troškovi, alimentacija, pretplate, ostalo

### Prihodi (5):
lični dohodak, prihod od rente, honorar, napojnica, ostalo

## 🔐 Automatska zaštita:

Od sada, kategorije se **automatski dodaju**:
1. Pri registraciji novog korisnika
2. Pri svakom loginu (ako ne postoje)
3. Možeš ih ručno obnoviti ovom skriptom

**Nikada više nećeš ostati bez kategorija!** 🎉
