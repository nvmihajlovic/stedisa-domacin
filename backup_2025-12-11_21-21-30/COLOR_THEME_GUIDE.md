# 🎨 Color Theme Guide

## Pregled

Aplikacija koristi konzistentnu color paletu definisanu u `lib/theme-colors.ts`. Sve komponente treba da koriste ove boje za uniforman izgled.

## Import

```typescript
import { theme } from "@/lib/theme-colors"
```

## Upotreba

### Troškovi (Expenses) - Pink/Purple gradient

```tsx
// Background gradient
style={{background: theme.expense.gradient}}

// Solid gradient za dugmad
style={{background: theme.expense.gradientSolid}}

// Border
style={{border: `1px solid ${theme.expense.border}`}}

// Box shadow
style={{boxShadow: theme.expense.glow}}

// Text color
style={{color: theme.expense.primary}}
```

### Prihodi (Incomes) - Green/Teal gradient

```tsx
// Background gradient
style={{background: theme.income.gradient}}

// Solid gradient za dugmad
style={{background: theme.income.gradientSolid}}

// Border
style={{border: `1px solid ${theme.income.border}`}}

// Box shadow
style={{boxShadow: theme.income.glow}}

// Text color
style={{color: theme.income.primary}}
```

### Neutralne boje (Backgrounds, Text)

```tsx
// Card background
style={{background: theme.neutral.bg}}

// Light background
style={{background: theme.neutral.bgLight}}

// Border
style={{border: `1px solid ${theme.neutral.border}`}}

// Text
style={{color: theme.neutral.text}}

// Muted text
style={{color: theme.neutral.textMuted}}
```

### Accent boje (Actions, Buttons)

```tsx
// Purple/Blue gradient za action buttons
style={{background: theme.accent.gradient}}

// Primary accent color
style={{color: theme.accent.primary}}
```

### Status boje

```tsx
// Success (green)
style={{background: theme.status.success.gradient}}

// Warning (orange)
style={{background: theme.status.warning.gradient}}

// Danger (red)
style={{background: theme.status.danger.gradient}}

// Info (blue)
style={{background: theme.status.info.gradient}}
```

## Helper funkcije

```typescript
import { getExpenseColor, getIncomeColor, getExpenseShadow, getIncomeShadow } from "@/lib/theme-colors"

// Dinamička opacitet
const bgGradient = getExpenseColor(0.5) // 50% opacity
const shadow = getExpenseShadow(0.3)    // 30% opacity
```

## Primeri

### Card sa expense bojama

```tsx
<div 
  className="rounded-xl p-4"
  style={{
    background: theme.expense.gradient,
    border: `1px solid ${theme.expense.border}`,
    boxShadow: theme.expense.glow
  }}
>
  <span style={{color: theme.expense.primary}}>Iznos: 1000 RSD</span>
</div>
```

### Button sa income bojama

```tsx
<button
  className="px-4 py-2 rounded-lg"
  style={{
    background: theme.income.gradientSolid,
    color: '#FFFFFF'
  }}
>
  Dodaj prihod
</button>
```

### FAB button

```tsx
<button
  className="w-16 h-16 rounded-full"
  style={{
    background: theme.expense.gradientBright,
    boxShadow: `0 0 16px ${theme.expense.shadow}`
  }}
>
  <PlusIcon />
</button>
```

## Pravila

1. **NIKAD** nemoj hardcodovati boje direktno u komponentama
2. Uvek koristi `theme` objekat iz `lib/theme-colors.ts`
3. Za dinamičku opacitet, koristi helper funkcije
4. Expenses = Pink/Purple, Incomes = Green/Teal
5. Neutralne boje za backgrounds i text
6. Accent boje za actions i buttons

## Migracija postojećeg koda

### Pre:
```tsx
style={{background: 'linear-gradient(135deg, rgba(255,179,230,0.3), rgba(255,107,157,0.3))'}}
```

### Posle:
```tsx
style={{background: theme.expense.gradient}}
```

---

**Održavaj konzistentnost!** Ako trebaš novu boju, dodaj je u `theme-colors.ts`, ne hardcoduj je.
