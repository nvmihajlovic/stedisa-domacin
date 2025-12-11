# 📋 Optimizovane Kategorije - Dokumentacija

## 🎯 Pregled

Kompletan redizajn sistema kategorija sa optimizovanim setom, naprednim funkcionalnostima i zadržanim vizuelnim identitetom.

## ✨ Nove Kategorije

### 💸 TROŠKOVI (19 kategorija)

| Naziv | Ikonica | Boja | Opis |
|-------|---------|------|------|
| Hrana i piće | ForkKnife | #FF6B9D | Namirnice, osnovne potrepštine |
| Restoran i kafići | Coffee | #FFB84D | Vanjska ishrana, kafići |
| Stanovanje i komunalije | House | #4DB5FF | Kirija, struja, voda, gas |
| Popravke i održavanje doma | Wrench | #A78BFA | Popravke, održavanje |
| Vozilo i transport | Car | #FF5757 | Gorivo, parking, javni prevoz |
| Zdravlje i nega | FirstAid | #45D38A | Lekovi, apoteka, lekari |
| Rekreacija i sport | Barbell | #FF8A4D | Teretana, oprema, članarine |
| Zabava i izlasci | GameController | #C339B5 | Bioskop, klubovi, zabava |
| Deca i porodica | Users | #4ECFFF | Dečije potrebe, porodični troškovi |
| Kućni ljubimci | PawPrint | #FFB347 | Hrana, veterinar, oprema |
| Odeća i obuća | TShirt | #FF6B9D | Garderoba, obuća |
| Pretplate i članarine | CreditCard | #8A63D2 | Netflix, Spotify, internet |
| Putovanja | Airplane | #5DADE2 | Letovi, hoteli, putni troškovi |
| Nameštaj i oprema | Armchair | #95A5A6 | Kućni nameštaj, dekoracija |
| Tehnika i uređaji | Laptop | #3498DB | Elektronika, računari, telefoni |
| Pokloni i donacije | Gift | #E74C3C | Pokloni, humanitarne donacije |
| Finansije i administracija | Bank | #16A085 | Bankarske usluge, takse |
| Alimentacija | Scales | #9B59B6 | Pravni troškovi, alimentacija |
| Ostalo | Question | #95A5A6 | Neklasifikovani troškovi |

### 💰 PRIHODI (8 kategorija)

| Naziv | Ikonica | Boja | Opis |
|-------|---------|------|------|
| Plata | Money | #1FBFA4 | Redovna plata |
| Honorar | Briefcase | #4DB5FF | Freelance, konsultacije |
| Bonus | Gift | #FFB84D | Bonusi, nagrade |
| Dividenda | TrendUp | #45D38A | Investicije, dionice |
| Renta | House | #A78BFA | Iznajmljivanje, pasivni prihod |
| Prodaja | ShoppingCart | #FF8A4D | Prodaja stvari, proizvoda |
| Pokloni | Gift | #FF6B9D | Novčani pokloni |
| Ostalo | CurrencyCircleDollar | #95A5A6 | Neklasifikovani prihodi |

## 🚀 Nove Funkcionalnosti

### 1. 🔍 **Live Search (Pretraga u realnom vremenu)**

- **Lokacija**: Search bar na vrhu stranice
- **Funkcionalnost**: 
  - Filtrira kategorije dok kucate
  - Case-insensitive (ne razlikuje velika/mala slova)
  - Trenutni update rezultata
  - Prikazuje broj pronađenih kategorija
- **UX**: 
  - MagnifyingGlass ikona
  - Hover efekti (border: purple glow)
  - Focus state sa povećanim background-om

### 2. 📊 **Filter po Tipu**

- **Opcije**: 
  - **Sve** - prikazuje i troškove i prihode
  - **Troškovi** - samo kategorije troškova
  - **Prihodi** - samo kategorije prihoda
- **Dizajn**: 
  - Segmented control sa 3 dugmeta
  - Color-coded (purple, pink, green)
  - Active state sa border i background
- **Logika**: 
  - Filtrira prikaz sekcija
  - Search radi samo na vidljivim kategorijama

### 3. ↕️ **Sortiranje A–Z / Z–A**

- **Funkcionalnost**:
  - Toggle dugme izmenjuje redosled
  - **A–Z**: Alfabetski rastuće (српска латиница)
  - **Z–A**: Alfabetski opadajuće
- **Ikone**:
  - `SortAscending` za A–Z
  - `SortDescending` za Z–A
- **Boja**: Cyan (#4DB5FF)
- **Logika**: 
  - Koristi `localeCompare('sr')` za srpsku latinicu
  - Sortira odvojeno expense i income kategorije

### 4. 📈 **Results Counter**

- Dinamički prikaz broja kategorija
- Format: "**X** troškovi • **Y** prihodi"
- Prikazuje filter info ako je search aktivan
- Boje usklađene sa tipom kategorije

## 🎨 Dizajn Sistema

### Color Palette

**Troškovi (Expenses):**
- Primary: `#FF6B9D` (pink)
- Gradient: `rgba(255, 107, 157, 0.15)` → `rgba(159, 112, 255, 0.1)`
- Hover Shadow: `rgba(255, 107, 157, 0.4)`

**Prihodi (Incomes):**
- Primary: `#45D38A` (green)
- Gradient: `rgba(69, 211, 138, 0.15)` → `rgba(77, 181, 255, 0.1)`
- Hover Shadow: `rgba(69, 211, 138, 0.4)`

**UI Controls:**
- Purple: `#A78BFA` (category icon, filter all)
- Cyan: `#4DB5FF` (sort, edit, toggle)
- Background: `rgba(30, 27, 42, 0.6)` sa blur
- Cards: `rgba(20, 18, 38, 0.85)` sa `backdrop-blur-xl`

### Typography

- **Headings**: `"Inter", "Poppins", sans-serif`
- **Body**: `"Inter", sans-serif`
- **Weights**: 
  - Category names: `font-semibold` (600)
  - Headers: `font-bold` (700)
  - Controls: `font-medium` (500)

### Grid Layout

```tsx
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
gap-6
```

- **Mobile**: 1 kolona
- **Tablet**: 2 kolone
- **Desktop**: 3 kolone
- **Large Desktop**: 4 kolone

### Card Structure

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │  <- Outer gradient border (p-1)
│  │  [Icon] [Badge]    [Actions]│   │
│  │                              │   │
│  │  Category Name               │   │
│  │  Icon Name                   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Actions (toolbar):**
- 🖊️ Edit (PencilSimple) - cyan
- 🗑️ Delete (Trash) - pink/green
- 👁️ Toggle Active (Eye/EyeSlash) - cyan

## 💻 Tehnička Implementacija

### State Management

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
const [filterType, setFilterType] = useState<FilterType>("all");
```

### Filtering Logic

```tsx
const filteredAndSortedCategories = useMemo(() => {
  let expenses = expenseCategories || [];
  let incomes = incomeCategories || [];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    expenses = expenses.filter(cat => 
      cat.name.toLowerCase().includes(query)
    );
    incomes = incomes.filter(cat => 
      cat.name.toLowerCase().includes(query)
    );
  }

  // Sorting
  const sortFn = (a, b) => 
    sortOrder === "asc" 
      ? a.name.localeCompare(b.name, 'sr')
      : b.name.localeCompare(a.name, 'sr');

  return {
    expenses: [...expenses].sort(sortFn),
    incomes: [...incomes].sort(sortFn)
  };
}, [expenseCategories, incomeCategories, searchQuery, sortOrder]);
```

### Conditional Rendering

```tsx
const shouldShowExpenses = filterType === "all" || filterType === "expenses";
const shouldShowIncomes = filterType === "all" || filterType === "incomes";
```

## 📦 Nove Ikonice

Dodato u `iconMapping.tsx`:

```tsx
import {
  Coffee,      // Restoran i kafići
  FirstAid,    // Zdravlje i nega
  PawPrint,    // Kućni ljubimci
  Briefcase,   // Honorar
  // ... existing icons
} from "phosphor-react";
```

## 🔄 Migracija Podataka

### Script: `seedOptimizedCategories.ts`

**Lokacija**: `scripts/seedOptimizedCategories.ts`

**Komande**:

```bash
# Kreiraj nove kategorije (samo za nove korisnike)
npx tsx scripts/seedOptimizedCategories.ts

# Ažuriraj postojeće + dodaj nove
npx tsx scripts/seedOptimizedCategories.ts --update
```

**Funkcionalnost**:
- ✅ Kreira kategorije za sve korisnike
- ✅ Provera da li kategorije već postoje
- ✅ Update mode: ažurira ikone i boje, dodaje nove
- ✅ Logovanje progresa
- ✅ Safe: ne briše postojeće podatke

### Backup

Stara verzija sačuvana kao: `app/categories/page.OLD.tsx`

## 🎯 API Endpoints

Bez izmena - koriste se postojeći:
- `GET /api/categories` - dohvata troškove
- `GET /api/income-categories` - dohvata prihode
- `POST /api/categories` - kreira trošak kategoriju
- `POST /api/income-categories` - kreira prihod kategoriju
- `PUT /api/categories/[id]` - ažurira kategoriju
- `DELETE /api/categories/[id]` - briše kategoriju

## 🧪 Testing Guide

### Testiranje Pretrage

1. Otvori `/categories`
2. Kucaj u search bar: "hrana"
3. **Expected**: Prikazuje samo "Hrana i piće" i "Hrana za ljubimce" (ako postoji)
4. Obriši search
5. **Expected**: Sve kategorije se vraćaju

### Testiranje Sortiranja

1. Klikni na dugme sa trenutnim "A–Z"
2. **Expected**: Kategorije se preokretaju, dugme pokazuje "Z–A"
3. **Verifikuj**: Prva kategorija počinje sa slovom koje je kasno u alfabetu

### Testiranje Filtera

1. Klikni "Troškovi"
2. **Expected**: Sekcija prihoda nestaje
3. Klikni "Prihodi"
4. **Expected**: Sekcija troškova nestaje, prikazuju se samo prihodi
5. Klikni "Sve"
6. **Expected**: Obe sekcije vidljive

### Kombinovano Testiranje

1. Klikni "Troškovi"
2. Kucaj "auto" u search
3. Klikni "Z–A"
4. **Expected**: Filtrirani troškovi sa "auto" u imenu, sortirani opadajuće

## 🐛 Known Issues & Solutions

### Issue 1: Search nema rezultate
**Rešenje**: Proveri da search query matchuje tačan naziv kategorije (case-insensitive)

### Issue 2: Sortiranje ne radi kako treba
**Rešenje**: Proveri da je `localeCompare` pozvan sa 'sr' parametrom

### Issue 3: Filter se ne primenjuje
**Rešenje**: Proveri `shouldShowExpenses` i `shouldShowIncomes` boolean vrednosti

## 📱 Responsive Behavior

### Mobile (< 640px)
- Search bar full width
- Filter buttons stack vertically
- Sort button full width
- 1 kategorija po redu

### Tablet (640px - 1024px)
- Controls u 1-2 reda
- 2 kategorije po redu

### Desktop (> 1024px)
- Svi kontrole u jednom redu
- 3-4 kategorije po redu
- Optimalno spacing

## 🎨 Animacije

**Framer Motion efekti**:
- Card entrance: `initial={{ opacity: 0, y: 20 }}`
- Card hover: `whileHover={{ scale: 1.02, y: -4 }}`
- FAB button: `whileHover={{ scale: 1.1, rotate: 90 }}`
- Stagger: `delay: index * 0.05`

**CSS Transitions**:
- Hover efekti: `transition-all duration-200`
- Background changes: smooth fade
- Border colors: animated glow

## 🚀 Performance Optimizations

1. **useMemo** za filtering/sorting - sprečava rerenders
2. **Conditional rendering** - prikazuje samo potrebne sekcije
3. **Lazy loading** sa Framer Motion stagger
4. **Optimized search** - samo lowercase compare

## 📝 Maintenance

### Dodavanje Nove Kategorije

1. Dodaj u `lib/optimizedCategories.ts`
2. Dodaj ikonicu u `lib/iconMapping.tsx` (ako ne postoji)
3. Pokreni seed script sa `--update`
4. Deploy

### Promena Boje/Ikone

1. Ažuriraj u `lib/optimizedCategories.ts`
2. Pokreni: `npx tsx scripts/seedOptimizedCategories.ts --update`
3. Kategorije se ažuriraju automatski

## ✅ Checklist

- [x] Nove optimizovane kategorije (19 troškovi + 8 prihodi)
- [x] Phosphor ikonice za sve kategorije
- [x] Live search sa real-time filteringom
- [x] A-Z / Z-A sortiranje
- [x] Filter po tipu (Sve/Troškovi/Prihodi)
- [x] Results counter
- [x] Zadržan kompletan vizuelni dizajn
- [x] Responsive grid layout
- [x] Framer Motion animacije
- [x] Seed script za migraciju
- [x] Dokumentacija

---

**Verzija**: 2.0  
**Datum**: 2024  
**Autor**: Domaćin Team
