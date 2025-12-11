/**
 * Product tour steps for interactive onboarding
 * Each step highlights an element and shows a tooltip
 */

export interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  actionLabel?: string
  highlightElement?: boolean
  onNext?: () => void
}

export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="stats-card"]',
    title: 'Dobrodošao u Domacin! 👋',
    content: 'Ovo su tvoje statistike - prihodi, rashodi i stanje. Hajde da prođemo kroz sve mogućnosti!',
    placement: 'bottom',
    actionLabel: 'Započni',
  },
  {
    target: '[data-tour="quick-access"]',
    title: 'Brzi pristup 🚀',
    content: 'Najvažnije funkcije: statistike, budžeti, poravnanja i kategorije.',
    placement: 'top',
  },
  {
    target: '[data-tour="recent-expenses"]',
    title: 'Nedavni troškovi 📝',
    content: 'Ovde vidiš sve nedavne troškove. Klikni da ih izmeniš.',
    placement: 'top',
  },
  {
    target: '[data-tour="recent-incomes"]',
    title: 'Nedavni prihodi 💰',
    content: 'Lista poslednjih prihoda - plata, honorari i ostalo.',
    placement: 'top',
  },
  {
    target: '[data-tour="add-expense"]',
    title: 'Dodaj trošak ili prihod ✍️',
    content: 'Koristi ova dugmad za brzo dodavanje troškova i prihoda.',
    placement: 'left',
  },
]

export const budgetsTourSteps: TourStep[] = [
  {
    target: '[data-tour="add-budget-btn"]',
    title: 'Kreiraj budžete 💰',
    content: 'Klikni ovde da postaviš mesečne ili godišnje limite za određenu kategoriju ili ukupan budžet.',
    placement: 'bottom',
    highlightElement: true,
  },
  {
    target: '[data-tour="budget-progress"]',
    title: 'Prati napredak 📈',
    content: 'Progress bar pokazuje koliko si potrošio. Boja se menja: zelena je OK, žuta upozorenje (80%+), crvena prekoračenje!',
    placement: 'top',
  },
  {
    target: '[data-tour="budget-alert"]',
    title: 'Email upozorenja 📧',
    content: 'Kada dostigneš 80% ili 100% budžeta, dobićeš email notifikaciju sa detaljima.',
    placement: 'right',
  },
]

export const expensesTourSteps: TourStep[] = [
  {
    target: '[data-tour="filter-date"]',
    title: 'Filtriraj po datumu 📅',
    content: 'Izaberi period da vidiš troškove samo iz tog vremenskog okvira.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="filter-category"]',
    title: 'Filtriraj po kategoriji 🏷️',
    content: 'Prikaži samo troškove iz određene kategorije.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="export-buttons"]',
    title: 'Izvezi podatke 📤',
    content: 'Preuzmi troškove kao Excel tabelu ili PDF izveštaj sa graficima!',
    placement: 'left',
    highlightElement: true,
  },
  {
    target: '[data-tour="bulk-select"]',
    title: 'Masovne akcije ✅',
    content: 'Selektuj više troškova odjednom da ih export-uješ ili obrišeš.',
    placement: 'right',
  },
]

export const settlementsTourSteps: TourStep[] = [
  {
    target: '[data-tour="group-card"]',
    title: 'Grupni troškovi 👥',
    content: 'Klikni na grupu da vidiš ko kome duguje. Algoritam automatski izračunava najjednostavnija poravnanja!',
    placement: 'top',
    highlightElement: true,
  },
  {
    target: '[data-tour="settlement-list"]',
    title: 'Lista dugovanja 💸',
    content: 'Ovde vidiš tačno ko treba da plati kome i koliko. Minimalan broj transakcija!',
    placement: 'left',
  },
]

export const profileTourSteps: TourStep[] = [
  {
    target: '[data-tour="backup-section"]',
    title: 'Sigurnosna kopija 💾',
    content: 'Preuzmi kompletan backup svih podataka u JSON formatu. Čuvaj ga na sigurnom mestu!',
    placement: 'top',
    highlightElement: true,
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Tema aplikacije 🌓',
    content: 'Prebaci između svetle i tamne teme kako ti više odgovara.',
    placement: 'left',
  },
]

export const ocrTourSteps: TourStep[] = [
  {
    target: '[data-tour="upload-zone"]',
    title: 'Otpremi račun 📸',
    content: 'Klikni ili prevuci fotografiju računa ovde. Podržavamo sve popularne trgovine!',
    placement: 'top',
    highlightElement: true,
  },
  {
    target: '[data-tour="ocr-preview"]',
    title: 'Pregled skeniranja 👁️',
    content: 'Videćeš original fotografiju i automatski pročitane podatke. Proveri da li je sve tačno!',
    placement: 'left',
  },
  {
    target: '[data-tour="ocr-edit"]',
    title: 'Ispravi podatke ✏️',
    content: 'Ako AI nije sve tačno pročitao, možeš ručno ispraviti pre čuvanja.',
    placement: 'right',
  },
]

/**
 * Get tour steps for specific page
 */
export function getTourSteps(page: string): TourStep[] {
  switch (page) {
    case 'dashboard':
      return dashboardTourSteps
    case 'budgets':
      return budgetsTourSteps
    case 'expenses':
      return expensesTourSteps
    case 'settlements':
      return settlementsTourSteps
    case 'profile':
      return profileTourSteps
    case 'ocr':
      return ocrTourSteps
    default:
      return []
  }
}
