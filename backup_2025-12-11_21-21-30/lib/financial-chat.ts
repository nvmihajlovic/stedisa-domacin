/**
 * Financial Chat Assistant
 * Intelligent Q&A system that analyzes user data and provides personalized advice
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserFinancialContext {
  currentMonthExpenses: number;
  currentMonthIncome: number;
  lastMonthExpenses: number;
  lastMonthIncome: number;
  savingsRate: number;
  topCategory: { name: string; amount: number; percentage: number } | null;
  budgetsCount: number;
  overBudgetCount: number;
  savingsGoalsCount: number;
  savingsProgress: number;
  pendingSettlements: number;
  groupsCount: number;
}

export class FinancialChatAssistant {
  private context: UserFinancialContext;

  constructor(context: UserFinancialContext) {
    this.context = context;
  }

  /**
   * Process user question and generate response
   */
  processQuestion(question: string, questionId?: string): string {
    // If questionId is provided (from predefined questions), match directly
    if (questionId) {
      switch (questionId) {
        case "monthly-spending":
          return this.answerMonthlySpending();
        case "top-category":
          return this.answerTopSpending();
        case "savings-potential":
          return this.answerSavingsPotential();
        case "budget-status":
          return this.answerBudgetStatus();
        case "monthly-trends":
          return this.answerTrends();
        case "savings-progress":
          return this.answerSavingsProgress();
        case "weekly-spending":
          return this.answerWeeklySpending();
        case "biggest-expenses":
          return this.answerBiggestExpenses();
        case "income-vs-expenses":
          return this.answerIncomeVsExpenses();
        case "recurring-expenses":
          return this.answerRecurringExpenses();
      }
    }

    // Fallback to pattern matching for free-form questions
    const lowerQuestion = question.toLowerCase().trim();

    // Remove punctuation for better matching
    const cleanQuestion = lowerQuestion.replace(/[?!.,]/g, '');

    // Match question patterns - using flexible substring matching
    // Monthly spending
    if (cleanQuestion.includes('koliko') && cleanQuestion.includes('trosim') && cleanQuestion.includes('mesec')) {
      return this.answerMonthlySpending();
    }

    if (cleanQuestion.includes('koliko') && (cleanQuestion.includes('zaradio') || cleanQuestion.includes('zarada') || cleanQuestion.includes('prihod'))) {
      return this.answerMonthlyIncome();
    }

    // Top spending category
    if (cleanQuestion.includes('gde') && (cleanQuestion.includes('najvise') || cleanQuestion.includes('trosim'))) {
      return this.answerTopSpending();
    }

    // Savings potential
    if (cleanQuestion.includes('koliko mogu') || (cleanQuestion.includes('ustedim') || cleanQuestion.includes('stednja'))) {
      return this.answerSavingsPotential();
    }

    if (cleanQuestion.includes('kako') && (cleanQuestion.includes('smanjim') || cleanQuestion.includes('troskove'))) {
      return this.answerReduceCosts();
    }

    // Budget status
    if (cleanQuestion.includes('status') && cleanQuestion.includes('budzeta')) {
      return this.answerBudgetStatus();
    }

    // Savings progress
    if (cleanQuestion.includes('napredak') && (cleanQuestion.includes('ciljeva') || cleanQuestion.includes('stednje'))) {
      return this.answerSavingsProgress();
    }

    if (cleanQuestion.includes('dug') || cleanQuestion.includes('dugujem') || cleanQuestion.includes('poravnanje')) {
      return this.answerSettlements();
    }

    if (cleanQuestion.includes('grupa') || cleanQuestion.includes('grupe')) {
      return this.answerGroups();
    }

    // Monthly trends
    if (cleanQuestion.includes('trend') || (cleanQuestion.includes('kakav') && cleanQuestion.includes('troskova'))) {
      return this.answerTrends();
    }

    if (cleanQuestion.includes('savet') || cleanQuestion.includes('preporuka') || cleanQuestion.includes('predlog')) {
      return this.giveGeneralAdvice();
    }

    if (cleanQuestion.includes('prosek') || cleanQuestion.includes('average') || cleanQuestion.includes('dnevno')) {
      return this.answerDailyAverage();
    }

    // Weekly spending
    if (cleanQuestion.includes('nedelje') || cleanQuestion.includes('nedeljno') || cleanQuestion.includes('ove nedelje')) {
      return this.answerWeeklySpending();
    }

    // Biggest expenses
    if ((cleanQuestion.includes('najveci') || cleanQuestion.includes('najvec') || cleanQuestion.includes('najskuplj')) && 
        cleanQuestion.includes('tros')) {
      return this.answerBiggestExpenses();
    }

    // Income vs expenses comparison
    if ((cleanQuestion.includes('zaraduj') || cleanQuestion.includes('zarad') || cleanQuestion.includes('prihod')) && 
        (cleanQuestion.includes('trosim') || cleanQuestion.includes('rashod') || cleanQuestion.includes('vs'))) {
      return this.answerIncomeVsExpenses();
    }

    // Recurring expenses
    if (cleanQuestion.includes('ponavlj') || cleanQuestion.includes('recurring') ||
        cleanQuestion.includes('mesecn') && cleanQuestion.includes('tros')) {
      return this.answerRecurringExpenses();
    }

    // Default response with suggestions
    return this.getDefaultResponse();
  }

  /**
   * Check if question matches pattern
   */
  private matchesPattern(question: string, keywords: string[]): boolean {
    return keywords.every(keyword => question.includes(keyword));
  }

  /**
   * Answer: How much am I spending this month?
   */
  private answerMonthlySpending(): string {
    const { currentMonthExpenses, currentMonthIncome } = this.context;
    const percentage = currentMonthIncome > 0 
      ? (currentMonthExpenses / currentMonthIncome * 100).toFixed(0)
      : "0";
    const percentageNum = parseFloat(percentage);

    return `💸 **Ovaj mesec si potrošio ${currentMonthExpenses.toLocaleString('sr-RS')} RSD.**

${currentMonthIncome > 0 
  ? `To je ${percentage}% tvojih prihoda ovog meseca (${currentMonthIncome.toLocaleString('sr-RS')} RSD).`
  : 'Još nisi uneo prihode za ovaj mesec.'
}

${percentageNum > 90 
  ? '⚠️ Trošiš skoro sve prihode! Pokušaj da smanjis troškove.' 
  : percentageNum > 70 
    ? '⚖️ Umeren nivo troškova, ali ima prostora za uštedu.' 
    : '✅ Odlično! Imaš dobar prostor za štednju.'
}`;
  }

  /**
   * Answer: How much did I earn?
   */
  private answerMonthlyIncome(): string {
    const { currentMonthIncome, currentMonthExpenses } = this.context;
    const netSavings = currentMonthIncome - currentMonthExpenses;

    return `💰 **Ovaj mesec imaš ${currentMonthIncome.toLocaleString('sr-RS')} RSD prihoda.**

${currentMonthExpenses > 0 
  ? `Troškovi: ${currentMonthExpenses.toLocaleString('sr-RS')} RSD\n${netSavings >= 0 
    ? `✅ Neto štednja: **+${netSavings.toLocaleString('sr-RS')} RSD**` 
    : `⚠️ Deficit: **${Math.abs(netSavings).toLocaleString('sr-RS')} RSD**`}`
  : 'Još nisi uneo troškove za ovaj mesec.'
}`;
  }

  /**
   * Answer: Where do I spend the most?
   */
  private answerTopSpending(): string {
    const { topCategory } = this.context;

    if (!topCategory) {
      return '📊 Još nemaš dovoljno podataka o troškovima da bih mogao da analiziram kategorije. Dodaj nekoliko troškova pa me ponovo pitaj!';
    }

    return `🎯 **Najviše trošiš na: "${topCategory.name}"**

💵 Iznos: ${topCategory.amount.toLocaleString('sr-RS')} RSD
📈 To je ${topCategory.percentage.toFixed(0)}% ukupnih troškova!

${topCategory.percentage > 40 
  ? '⚠️ Ova kategorija dominira! Možda je vreme da razmotriš gde možeš da uštedeš.' 
  : topCategory.percentage > 25 
    ? '💡 Umereno visok procenat. Proveri da li sve stavke u ovoj kategoriji su zaista potrebne.' 
    : '✅ Dobra balansa u raspodeldi troškova!'
}`;
  }

  /**
   * Answer: How much can I save?
   */
  private answerSavingsPotential(): string {
    const { currentMonthIncome, currentMonthExpenses, savingsRate } = this.context;
    const currentSavings = currentMonthIncome - currentMonthExpenses;
    const recommendedSavings = currentMonthIncome * 0.20; // 20% recommendation
    const potential = recommendedSavings - currentSavings;

    return `💎 **Analiza potencijala za štednju:**

📊 Trenutna štednja: ${savingsRate.toFixed(1)}% (${currentSavings.toLocaleString('sr-RS')} RSD)
🎯 Preporučeno: 20% (${recommendedSavings.toLocaleString('sr-RS')} RSD)

${savingsRate >= 20 
  ? '🌟 Odlično! Već štediš iznad preporučenog nivoa! Nastavi tako!' 
  : potential > 0 
    ? `💪 Možeš dodatno da uštediš ${potential.toLocaleString('sr-RS')} RSD mesečno ako smanjis troškove.\n\n**Godišnje bi to bilo:** ${(potential * 12).toLocaleString('sr-RS')} RSD! 🚀`
    : '⚠️ Trenutno trošiš više nego što zarađuješ. Hitno rebalansiraj budžet!'
}`;
  }

  /**
   * Answer: How to reduce costs?
   */
  private answerReduceCosts(): string {
    const { topCategory, budgetsCount } = this.context;

    let advice = '💡 **Saveti za smanjenje troškova:**\n\n';

    if (topCategory && topCategory.percentage > 30) {
      advice += `1️⃣ **Fokusiraj se na "${topCategory.name}"** - tvoja najveća kategorija (${topCategory.percentage.toFixed(0)}%):\n`;
      advice += `   • Prođi kroz sve troškove u ovoj kategoriji\n`;
      advice += `   • Eliminiši nepotrebne stavke\n`;
      advice += `   • Potraži jeftinije alternative\n\n`;
    }

    if (budgetsCount === 0) {
      advice += `2️⃣ **Postavi budžete** za top 3 kategorije:\n`;
      advice += `   • Pomoći će ti da kontrolišeš potrošnju\n`;
      advice += `   • Dobaićeš upozorenja kad se približiš limitu\n\n`;
    }

    advice += `3️⃣ **Pravilo 50/30/20:**\n`;
    advice += `   • 50% na osnovne potrebe (hrana, stan, računi)\n`;
    advice += `   • 30% na želje (zabava, restorani)\n`;
    advice += `   • 20% u štednju\n\n`;

    advice += `4️⃣ **Prati male troškove** - oni se brzo nakupe!\n`;
    advice += `   • Kafica + sendvič dnevno = 12,000 RSD mesečno\n`;
    advice += `   • Pretplate koje ne koristiš = bacanje novca\n`;

    return advice;
  }

  /**
   * Answer: Budget status
   */
  private answerBudgetStatus(): string {
    const { budgetsCount, overBudgetCount } = this.context;

    if (budgetsCount === 0) {
      return `📊 **Još nemaš postavljene budžete!**

Budžeti su odličan alat za kontrolu troškova. Evo kako da počneš:

1. Idi na stranicu **Budžeti**
2. Klikni **+ Novi budžet**
3. Odaberi kategoriju
4. Postavi mesečni limit

💡 Preporučujem da počneš sa top 3 kategorije gde najviše trošiš!`;
    }

    if (overBudgetCount === 0) {
      return `✅ **Odlično upravljaš budžetima!**

Imaš ${budgetsCount} ${budgetsCount === 1 ? 'budžet' : 'budžeta'} i nijedan nije prekoračen! 🎉

To pokazuje disciplinu i dobro planiranje. Nastavi tako! 💪`;
    }

    return `⚠️ **Imaš ${overBudgetCount} prekoračen${overBudgetCount === 1 ? '' : 'ih'} budžet${overBudgetCount === 1 ? '' : 'a'}!**

Od ukupno ${budgetsCount} budžeta, ${overBudgetCount} je prekoračeno.

**Šta da radiš:**
1. Idi na stranicu **Budžeti** i vidi koje kategorije
2. Analiziraj nepotrebne troškove u tim kategorijama
3. Rebalansiraj budžet za sledeći mesec
4. Postavi podsetnik da pratiš dnevno`;
  }

  /**
   * Answer: Savings goals progress
   */
  private answerSavingsProgress(): string {
    const { savingsGoalsCount, savingsProgress } = this.context;

    if (savingsGoalsCount === 0) {
      return `🎯 **Još nemaš ciljeve štednje!**

Ciljevi štednje pomažu da:
• Ostaneš motivisan 💪
• Pratiš napredak 📈
• Automatski štediš 🤖

**Primer ciljeva:**
• Odmor (50,000 RSD)
• Emergency fond (200,000 RSD)
• Novi laptop (150,000 RSD)

Idi na **Štednja** i kreiraj prvi cilj!`;
    }

    return `📊 **Imaš ${savingsGoalsCount} aktivn${savingsGoalsCount === 1 ? 'og cilja' : 'ih ciljeva'} štednje**

Prosečan napredak: ${savingsProgress.toFixed(0)}%

${savingsProgress >= 80 
  ? '🏆 Fantastično! Blizu si ostvarenja ciljeva!' 
  : savingsProgress >= 50 
    ? '💪 Dobar napredak! Nastavi tako i stići ćeš cilj!' 
    : savingsProgress >= 20 
      ? '📈 Na pravom si putu! Još malo discipline!' 
      : '🚀 Tek si počeo, ali svaki dinar je bitan!'
}

💡 **Savet:** Automatska mesečna štednja povećava šanse za uspeh za 70%!`;
  }

  /**
   * Answer: Settlements/Debts
   */
  private answerSettlements(): string {
    const { pendingSettlements } = this.context;

    if (pendingSettlements === 0) {
      return `✅ **Nemaš nerešenih poravnanja!**

Sve je čisto, nema dugova! 😎

To znači da:
• Niko ti ne duguje novac
• Ti ne duguješ nikome
• Svi računi su poravnati

Nastavi ovako! 👏`;
    }

    return `💸 **Imaš ${pendingSettlements} nerešen${pendingSettlements === 1 ? 'o poravnanje' : 'ih poravnanja'}**

Idi na stranicu **Poravnanja** da vidiš:
• Ko ti duguje novac 💰
• Kome ti duguješ 💸
• Ukupan balans

💡 **Savet:** Što pre poravnaš dugove, bolje za odnose sa ljudima (i tvoj budžet)!`;
  }

  /**
   * Answer: Groups
   */
  private answerGroups(): string {
    const { groupsCount } = this.context;

    if (groupsCount === 0) {
      return `👥 **Još nisi član nijedne grupe**

Grupe su odlične za:
• Praćenje zajedničkih troškova (stanovanje, putovanja)
• Deljenje računa sa cimerima/partnerom
• Automatsko poravnanje dugova

**Kako da počneš:**
1. Idi na **Grupe**
2. Klikni **+ Nova grupa**
3. Pozovi članove
4. Počni da deliš troškove!`;
    }

    return `👥 **Član si ${groupsCount} grup${groupsCount === 1 ? 'e' : 'a'}**

Grupe ti pomažu da:
✅ Pratiš zajedničke troškove
✅ Automatski deliš račune
✅ Izbegneš zabune oko para

Proveri **Grupe** stranicu za detalje o zajedničkim troškovima!`;
  }

  /**
   * Answer: Trends and comparisons
   */
  private answerTrends(): string {
    const { currentMonthExpenses, lastMonthExpenses } = this.context;

    if (lastMonthExpenses === 0) {
      return `📊 **Još nema podataka za poređenje**

Ovo je tvoj prvi mesec korišćenja. Sledeći mesec ću moći da uporedim tvoje troškove i pokažem trend!`;
    }

    const change = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    const absChange = Math.abs(currentMonthExpenses - lastMonthExpenses);

    if (change > 10) {
      return `📈 **Troškovi su porasli!**

Ovaj mesec: ${currentMonthExpenses.toLocaleString('sr-RS')} RSD
Prošli mesec: ${lastMonthExpenses.toLocaleString('sr-RS')} RSD

Povećanje: +${change.toFixed(0)}% (+${absChange.toLocaleString('sr-RS')} RSD)

⚠️ Vreme je da analiziraš šta se promenilo. Idi na **Statistika** za detalje!`;
    } else if (change < -10) {
      return `📉 **Troškovi su opali!**

Ovaj mesec: ${currentMonthExpenses.toLocaleString('sr-RS')} RSD
Prošli mesec: ${lastMonthExpenses.toLocaleString('sr-RS')} RSD

Smanjenje: ${change.toFixed(0)}% (-${absChange.toLocaleString('sr-RS')} RSD)

🎉 Odličan napredak! Nastavi ovako!`;
    }

    return `⚖️ **Stabilan nivo troškova**

Ovaj mesec: ${currentMonthExpenses.toLocaleString('sr-RS')} RSD
Prošli mesec: ${lastMonthExpenses.toLocaleString('sr-RS')} RSD

Razlika: ${change > 0 ? '+' : ''}${change.toFixed(1)}%

✅ Konzistentna potrošnja je dobar znak!`;
  }

  /**
   * Give general financial advice
   */
  private giveGeneralAdvice(): string {
    const tips = [
      `💡 **Pravilo 24 sata:** Čekaj 24h pre nego što kupiš nešto skupo. Često ćeš promeniti mišljenje!`,
      
      `💰 **Automatizuj štednju:** Podesi automatski transfer na štedni račun svakog 1. u mesecu. "Što oči ne vide, srce ne boli!"`,
      
      `📊 **Prati svaki dinar:** Mali troškovi (kafica, parking, grickalice) se nakupe do 20% budžeta!`,
      
      `🎯 **50/30/20 pravilo:** 50% osnovne potrebe, 30% želje, 20% štednja. Jednostavno i efikasno!`,
      
      `🛑 **Eliminiši "vampire expenses":** Pretplate koje ne koristiš, članarine koje si zaboravio, impulzivne kupovine.`,
      
      `💳 **Koristi keš za svakodnevne troškove:** Mnogo je lakše kontrolisati potrošnju kad vidiš fizički novac da nestaje.`,
      
      `📅 **"No-spend" dani:** Odaberi 2-3 dana nedeljno kad ne trošiš NIŠTA. Izazov koji štedi novac!`,
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Answer: Daily average spending
   */
  private answerDailyAverage(): string {
    const { currentMonthExpenses } = this.context;
    const today = new Date();
    const dayOfMonth = today.getDate();
    const dailyAverage = currentMonthExpenses / dayOfMonth;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const projectedTotal = dailyAverage * daysInMonth;

    return `📅 **Dnevni prosek troškova:**

💵 **${dailyAverage.toLocaleString('sr-RS')} RSD/dan**

Dosad ovog meseca (${dayOfMonth} dana):
• Ukupno: ${currentMonthExpenses.toLocaleString('sr-RS')} RSD

Projekcija do kraja meseca:
• Očekivano: ${projectedTotal.toLocaleString('sr-RS')} RSD

${dailyAverage > 3000 
  ? '⚠️ Dnevni prosek je visok! Pokušaj da smanjis nepotrebne troškove.' 
  : dailyAverage > 1500 
    ? '⚖️ Umeren dnevni prosek. Ima prostora za optimizaciju.' 
    : '✅ Odličan dnevni prosek! Nastvavi sa pametnom potrošnjom!'
}`;
  }

  /**
   * Answer: Weekly spending
   */
  private answerWeeklySpending(): string {
    const { currentMonthExpenses } = this.context;
    // Procena nedeljnog troška (mesečni / 4.3)
    const weeklyEstimate = currentMonthExpenses / 4.3;

    return `📅 **Nedeljni troškovi (procena)**

Na osnovu ovog meseca:
💸 **${weeklyEstimate.toFixed(0)} RSD** nedeljno

To znači:
• Dnevno: ~${(weeklyEstimate / 7).toFixed(0)} RSD
• Mesečno: ~${currentMonthExpenses.toFixed(0)} RSD

${weeklyEstimate > 15000 
  ? '⚠️ Dosta trošiš nedeljno. Razmisli gde možeš smanjiti!'
  : weeklyEstimate > 7000
    ? '👍 Solidan tempo. Prati da li ima nepotrebnih troškova!'
    : '✅ Odlična kontrola troškova! Nastavi tako!'
}`;
  }

  /**
   * Answer: Biggest expenses
   */
  private answerBiggestExpenses(): string {
    // Ova funkcija bi trebala da vrati najveće pojedinačne troškove
    // Za sada vraćamo opšti odgovor jer nemamo pristup pojedinačnim stavkama
    const { currentMonthExpenses, expensesByCategory } = this.context;

    if (expensesByCategory.length === 0) {
      return `📊 **Još nemaš evidentiranih troškova**

Dodaj svoje troškove da vidim šta najviše trošiš! 💸`;
    }

    const topCategory = expensesByCategory[0];
    const topPercentage = (topCategory.amount / currentMonthExpenses * 100).toFixed(0);

    return `🔍 **Analiza najvećih troškova**

Najviše trošiš na:
**${topCategory.category}**: ${topCategory.amount.toFixed(0)} RSD (${topPercentage}%)

${topPercentage > 50
  ? '⚠️ Ova kategorija dominira! Možda možeš smanjiti?'
  : topPercentage > 30
    ? '📊 Značajan udeo. Prati da li je sve neophodno!'
    : '✅ Dobra distribucija troškova!'
}

**Savet:** Pogledaj pojedinačne troškove u ovoj kategoriji i vidi gde možeš uštedeti! 💡`;
  }

  /**
   * Answer: Income vs Expenses comparison
   */
  private answerIncomeVsExpenses(): string {
    const { currentMonthIncome, currentMonthExpenses } = this.context;
    const difference = currentMonthIncome - currentMonthExpenses;
    const savingsRate = currentMonthIncome > 0 
      ? (difference / currentMonthIncome * 100).toFixed(0)
      : '0';

    return `💰 **Prihodi vs. Rashodi**

**Prihodi:** ${currentMonthIncome.toFixed(0)} RSD
**Rashodi:** ${currentMonthExpenses.toFixed(0)} RSD
**Razlika:** ${difference.toFixed(0)} RSD

${difference > 0
  ? `✅ **Štediš ${savingsRate}% prihoda!**

${Number(savingsRate) >= 20
  ? '🏆 Odlično! Iznad si preporučenih 20%!'
  : Number(savingsRate) >= 10
    ? '👍 Dobro! Nastavi ovim tempom!'
    : '📈 Možeš i bolje! Cilj je 20%!'
}`
  : difference === 0
    ? '⚠️ **Potrošio si tačno koliko si zaradio!**\n\nNema prostora za štednju. Pokušaj smanjiti troškove!'
    : `🚨 **U minusu si ${Math.abs(difference).toFixed(0)} RSD!**

**Hitno:**
1. Stani sa neobaveznim troškovima
2. Analiziraj gde trošiš previše
3. Postavi budžete za sledeći mesec`
}`;
  }

  /**
   * Answer: Recurring expenses
   */
  private answerRecurringExpenses(): string {
    const { currentMonthExpenses, expensesByCategory } = this.context;
    
    // Procena ponavljajućih troškova (Računi, Pretplate itd.)
    const recurringCategories = ['Računi', 'Pretplate', 'Stanarina', 'Osiguranje'];
    const recurringTotal = expensesByCategory
      .filter(cat => recurringCategories.some(rc => cat.category.toLowerCase().includes(rc.toLowerCase())))
      .reduce((sum, cat) => sum + cat.amount, 0);

    const recurringPercentage = currentMonthExpenses > 0 
      ? (recurringTotal / currentMonthExpenses * 100).toFixed(0)
      : '0';

    if (recurringTotal === 0) {
      return `🔄 **Ponavljajući troškovi**

Trenutno nemam evidentirane ponavljajuće troškove.

**Saveti:**
• Dodaj kategorije: Računi, Pretplate, Stanarina
• Označi ih kao "ponavljajuće" za bolju analizu
• Tako ćeš lakše planirati budžet!`;
    }

    return `🔄 **Ponavljajući troškovi**

Mesečno na fiksne troškove ideš:
💸 **${recurringTotal.toFixed(0)} RSD** (${recurringPercentage}% troškova)

${Number(recurringPercentage) > 50
  ? '⚠️ Fiksni troškovi su preko 50%! Razmisli o:\n• Smanjenju pretplata\n• Jeftinijim opcijama\n• Deljenju troškova'
  : Number(recurringPercentage) > 30
    ? '📊 Solidno. Prati da li sve pretplate koristiš!'
    : '✅ Dobro upravljaš fiksnim troškovima!'
}

**Najčešće ponavljajuće kategorije:**
• Računi (struja, voda, gas)
• Pretplate (Netflix, Spotify, Gym)
• Stanarina
• Osiguranje`;
  }

  /**
   * Default response with suggestions
   */
  private getDefaultResponse(): string {
    return `🤔 Nisam baš siguran šta me pitaš, ali mogu da ti pomognem sa:

**💰 Finansije:**
• "Koliko trošim ovaj mesec?"
• "Koliko sam zaradio?"
• "Koliko mogu da uštedim?"

**📊 Analiza:**
• "Gde najviše trošim?"
• "Kakav je trend u odnosu na prošli mesec?"
• "Koji je prosek dnevno?"

**🎯 Ciljevi i planovi:**
• "Kako da smanjim troškove?"
• "Kakvo je stanje budžeta?"
• "Kako napreduje štednja?"

**👥 Grupe i dugovi:**
• "Imam li nerešenih poravnanja?"
• "U kojim grupama sam?"

**💡 Saveti:**
• "Daj mi neki savet"
• "Kakvu preporuku imaš?"

Postavi mi neko od ovih pitanja! 😊`;
  }
}
