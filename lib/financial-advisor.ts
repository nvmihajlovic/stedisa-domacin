/**
 * Intelligent Financial Advisor
 * Rule-based smart system that analyzes user's financial habits
 * and generates personalized, fun, and actionable insights
 */

export interface FinancialInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    href?: string;
    onClick?: string;
  };
  priority: number; // 1-10, higher = more important
}

export interface FinancialData {
  currentMonthExpenses: number;
  currentMonthIncome: number;
  lastMonthExpenses: number;
  lastMonthIncome: number;
  expensesByCategory: { category: string; amount: number; count: number }[];
  incomesByCategory: { category: string; amount: number; count: number }[];
  recurringExpenses: { description: string; amount: number; frequency: string }[];
  unusualExpenses: { description: string; amount: number; date: string }[];
  savingsRate: number;
  topSpendingDay?: { date: string; amount: number };
}

export class FinancialAdvisor {
  private data: FinancialData;

  constructor(data: FinancialData) {
    this.data = data;
  }

  /**
   * Generate all financial insights
   */
  generateInsights(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];

    // Run all analysis methods
    insights.push(...this.analyzeSpendingTrends());
    insights.push(...this.analyzeCategorySpending());
    insights.push(...this.analyzeIncomeVsExpenses());
    insights.push(...this.analyzeSavings());
    insights.push(...this.analyzeRecurringCosts());
    insights.push(...this.analyzeUnusualExpenses());
    insights.push(...this.generateMotivationalInsights());
    insights.push(...this.generateSmartTips());

    // Sort by priority and return top insights
    return insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Show top 5 insights
  }

  /**
   * Analyze spending trends (month over month)
   */
  private analyzeSpendingTrends(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { currentMonthExpenses, lastMonthExpenses } = this.data;

    if (lastMonthExpenses === 0) return insights;

    const change = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    const absChange = Math.abs(currentMonthExpenses - lastMonthExpenses);

    if (change > 20) {
      insights.push({
        id: 'spending-increase',
        type: 'warning',
        title: 'Troškovi drastično porasli! 📈',
        message: `Ovaj mesec trošiš ${change.toFixed(0)}% više nego prošlog (${absChange.toLocaleString('sr-RS')} RSD više). Vreme je za analizu!`,
        icon: 'TrendUp',
        priority: 9,
        action: {
          label: 'Vidi troškove',
          href: '/expenses',
        },
      });
    } else if (change < -15) {
      insights.push({
        id: 'spending-decrease',
        type: 'success',
        title: 'Odličan napredak! 🎉',
        message: `Smanjio si troškove za ${Math.abs(change).toFixed(0)}% u odnosu na prošli mesec. Ušteda: ${absChange.toLocaleString('sr-RS')} RSD!`,
        icon: 'TrendDown',
        priority: 8,
      });
    }

    return insights;
  }

  /**
   * Analyze spending by category
   */
  private analyzeCategorySpending(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { expensesByCategory, currentMonthExpenses } = this.data;

    if (expensesByCategory.length === 0) return insights;

    // Find top spending category
    const topCategory = expensesByCategory[0];
    const percentage = (topCategory.amount / currentMonthExpenses) * 100;

    if (percentage > 35) {
      const funMessages = [
        `${topCategory.category} ti "pojede" ${percentage.toFixed(0)}% budžeta! 😅`,
        `${percentage.toFixed(0)}% novca ide na ${topCategory.category}. To je... dosta! 🤔`,
        `Kategorija ${topCategory.category} dominira sa ${percentage.toFixed(0)}%. Vreme za balans? ⚖️`,
      ];
      
      insights.push({
        id: 'top-category',
        type: 'info',
        title: 'Glavni potrošač identifikovan!',
        message: funMessages[Math.floor(Math.random() * funMessages.length)],
        icon: 'Warning',
        priority: 7,
      });
    }

    // Check for multiple high-spending categories
    const highCategories = expensesByCategory.filter(
      (cat) => (cat.amount / currentMonthExpenses) * 100 > 20
    );

    if (highCategories.length >= 3) {
      insights.push({
        id: 'multiple-high',
        type: 'tip',
        title: 'Troškovi raspršeni',
        message: `Imaš ${highCategories.length} kategorija koje troše preko 20% budžeta. Fokusiraj se na jednu po jednu!`,
        icon: 'Target',
        priority: 6,
      });
    }

    return insights;
  }

  /**
   * Analyze income vs expenses ratio
   */
  private analyzeIncomeVsExpenses(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { currentMonthIncome, currentMonthExpenses } = this.data;

    if (currentMonthIncome === 0) return insights;

    const ratio = (currentMonthExpenses / currentMonthIncome) * 100;

    if (ratio > 100) {
      const deficit = currentMonthExpenses - currentMonthIncome;
      insights.push({
        id: 'overspending',
        type: 'warning',
        title: 'Alarm! Crveni brojevi! 🚨',
        message: `Trošiš ${ratio.toFixed(0)}% svojih prihoda. Minus je ${deficit.toLocaleString('sr-RS')} RSD. Vreme za akciju!`,
        icon: 'WarningCircle',
        priority: 10,
      });
    } else if (ratio > 90) {
      insights.push({
        id: 'high-spending',
        type: 'warning',
        title: 'Blizu granice!',
        message: `Troškovi su ${ratio.toFixed(0)}% prihoda. Ostalo ti je malo prostora za štednju. Oprezno! 🎯`,
        icon: 'Warning',
        priority: 8,
      });
    } else if (ratio < 60) {
      const savings = currentMonthIncome - currentMonthExpenses;
      insights.push({
        id: 'great-savings',
        type: 'success',
        title: 'Majstor štednje! 💰',
        message: `Samo ${ratio.toFixed(0)}% prihoda ide na troškove. Ušteda: ${savings.toLocaleString('sr-RS')} RSD. Legendarno!`,
        icon: 'Sparkle',
        priority: 9,
      });
    }

    return insights;
  }

  /**
   * Analyze savings rate
   */
  private analyzeSavings(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { savingsRate, currentMonthIncome } = this.data;

    if (savingsRate > 30) {
      insights.push({
        id: 'excellent-savings',
        type: 'success',
        title: 'Finansijski genije! 🧠',
        message: `Štediš ${savingsRate.toFixed(0)}% prihoda! Nastavi ovim tempom i bićeš milioner! 🚀`,
        icon: 'TrendUp',
        priority: 8,
      });
    } else if (savingsRate > 20) {
      insights.push({
        id: 'good-savings',
        type: 'success',
        title: 'Odličan progress! 👏',
        message: `${savingsRate.toFixed(0)}% prihoda ide u štednju. Još malo do perfekcije!`,
        icon: 'CheckCircle',
        priority: 7,
      });
    } else if (savingsRate < 5 && currentMonthIncome > 0) {
      insights.push({
        id: 'low-savings',
        type: 'tip',
        title: 'Štednja? Koja štednja? 🤷',
        message: `Samo ${savingsRate.toFixed(1)}% ide u štednju. Cilj: bar 20%! Možeš to!`,
        icon: 'Coin',
        priority: 7,
      });
    }

    return insights;
  }

  /**
   * Analyze recurring costs
   */
  private analyzeRecurringCosts(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { recurringExpenses, currentMonthIncome } = this.data;

    if (recurringExpenses.length === 0) return insights;

    const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = currentMonthIncome > 0 ? (totalRecurring / currentMonthIncome) * 100 : 0;

    if (recurringExpenses.length >= 5) {
      insights.push({
        id: 'many-subscriptions',
        type: 'info',
        title: 'Pretplata overload! 📱',
        message: `${recurringExpenses.length} ponavljajućih troškova mesečno (${totalRecurring.toLocaleString('sr-RS')} RSD). Da li sve zaista koristiš? 🤔`,
        icon: 'Repeat',
        priority: 7,
      });
    }

    if (percentage > 30) {
      insights.push({
        id: 'high-recurring',
        type: 'warning',
        title: 'Fiksni troškovi dominiraju!',
        message: `${percentage.toFixed(0)}% prihoda ide na ponavljajuće troškove. Vreme za optimizaciju!`,
        icon: 'Repeat',
        priority: 8,
      });
    }

    return insights;
  }

  /**
   * Analyze unusual/outlier expenses
   */
  private analyzeUnusualExpenses(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { unusualExpenses } = this.data;

    if (unusualExpenses.length > 0) {
      const topUnusual = unusualExpenses[0];
      insights.push({
        id: 'unusual-expense',
        type: 'info',
        title: 'Šta se desilo ovde? 👀',
        message: `Neobičan trošak: "${topUnusual.description}" (${topUnusual.amount.toLocaleString('sr-RS')} RSD). Sve ok?`,
        icon: 'Question',
        priority: 6,
      });
    }

    return insights;
  }

  /**
   * Generate motivational insights
   */
  private generateMotivationalInsights(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { expensesByCategory } = this.data;

    // Random motivational messages
    const motivationalMessages = [
      {
        title: 'Svaki dinar je bitan! 💪',
        message: 'Male uštede svakodnevno = velike promene godišnje. Keep going!',
        icon: 'Sparkle',
      },
      {
        title: 'Finansijska sloboda se gradi svakodnevno 🌟',
        message: 'Svaka pametna odluka te približava cilju. Ti to možeš!',
        icon: 'Trophy',
      },
      {
        title: 'Pratiš troškove = Kontrolišeš budućnost! 🎯',
        message: 'Već si na pravom putu. Samo nastavi tako!',
        icon: 'Target',
      },
    ];

    if (expensesByCategory.length > 10) {
      const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      insights.push({
        id: 'motivation',
        type: 'tip',
        ...randomMsg,
        priority: 5,
      });
    }

    return insights;
  }

  /**
   * Generate smart actionable tips
   */
  private generateSmartTips(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const { expensesByCategory, currentMonthExpenses } = this.data;

    // Find category with most transactions but low average
    const categoryWithManySmallExpenses = expensesByCategory.find(
      (cat) => cat.count > 15 && cat.amount / cat.count < 500
    );

    if (categoryWithManySmallExpenses) {
      insights.push({
        id: 'many-small',
        type: 'tip',
        title: 'Mali troškovi se nakupljaju! 🔍',
        message: `${categoryWithManySmallExpenses.count} transakcija u kategoriji "${categoryWithManySmallExpenses.category}". Možda ima prostora za optimizaciju?`,
        icon: 'MagnifyingGlass',
        priority: 6,
      });
    }

    // Suggest budget if spending is high
    if (currentMonthExpenses > 100000) {
      insights.push({
        id: 'suggest-budget',
        type: 'tip',
        title: 'Probaj sa budžetom! 📊',
        message: 'Postavljanje limita po kategorijama može značajno pomoći u štednji. Zainteresovan?',
        icon: 'ChartBar',
        priority: 6,
        action: {
          label: 'Postavi budžet',
          href: '/dashboard',
        },
      });
    }

    return insights;
  }
}
