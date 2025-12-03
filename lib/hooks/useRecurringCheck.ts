import { useEffect, useState } from 'react';

interface RecurringItem {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  currency: string;
  type: 'expense' | 'income';
  recurringType: string;
  nextRecurringDate: string;
  isRecurring: boolean;
}

const POSTPONE_KEY_PREFIX = 'recurring-postpone-';

export const useRecurringCheck = () => {
  const [pendingItems, setPendingItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);

  const checkRecurringItems = async () => {
    try {
      setLoading(true);

      // Fetch all expenses and incomes with recurring flag
      const [expensesRes, incomesRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/incomes')
      ]);

      if (!expensesRes.ok || !incomesRes.ok) {
        console.error('Failed to fetch recurring items');
        return;
      }

      const expensesText = await expensesRes.text();
      const incomesText = await incomesRes.text();
      
      const expenses = expensesText ? JSON.parse(expensesText) : [];
      const incomes = incomesText ? JSON.parse(incomesText) : [];

      const today = new Date().toISOString().split('T')[0];
      const pending: RecurringItem[] = [];

      // Check recurring expenses
      expenses.forEach((expense: any) => {
        if (expense.recurringExpense && expense.recurringExpense.nextExecutionAt) {
          const nextDate = expense.recurringExpense.nextExecutionAt.split('T')[0];
          const postponeKey = `${POSTPONE_KEY_PREFIX}expense-${expense.id}`;
          const postponedUntil = localStorage.getItem(postponeKey);

          // Check if postponed and if postpone date has passed
          if (postponedUntil) {
            const postponeDate = new Date(postponedUntil).toISOString().split('T')[0];
            if (postponeDate > today) {
              return; // Still postponed
            } else {
              localStorage.removeItem(postponeKey); // Postpone expired
            }
          }

          // Check if next recurring date has arrived or passed
          if (nextDate <= today) {
            pending.push({
              id: expense.id,
              amount: expense.amount,
              description: expense.description,
              date: expense.date,
              categoryId: expense.category.id,
              category: expense.category,
              currency: expense.currency || 'RSD',
              type: 'expense' as const,
              recurringType: expense.recurringExpense.frequency,
              nextRecurringDate: expense.recurringExpense.nextExecutionAt,
              isRecurring: true
            });
          }
        }
      });

      // Check recurring incomes
      incomes.forEach((income: any) => {
        if (income.recurringIncome && income.recurringIncome.nextExecutionAt) {
          const nextDate = income.recurringIncome.nextExecutionAt.split('T')[0];
          const postponeKey = `${POSTPONE_KEY_PREFIX}income-${income.id}`;
          const postponedUntil = localStorage.getItem(postponeKey);

          if (postponedUntil) {
            const postponeDate = new Date(postponedUntil).toISOString().split('T')[0];
            if (postponeDate > today) {
              return;
            } else {
              localStorage.removeItem(postponeKey);
            }
          }

          if (nextDate <= today) {
            pending.push({
              id: income.id,
              amount: income.amount,
              description: income.description,
              date: income.date,
              categoryId: income.category.id,
              category: income.category,
              currency: income.currency || 'RSD',
              type: 'income' as const,
              recurringType: income.recurringIncome.frequency,
              nextRecurringDate: income.recurringIncome.nextExecutionAt,
              isRecurring: true
            });
          }
        }
      });

      setPendingItems(pending);
    } catch (error) {
      console.error('Error checking recurring items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRecurringItems();
  }, []);

  const postponeItem = (item: RecurringItem, days: number) => {
    const postponeDate = new Date();
    postponeDate.setDate(postponeDate.getDate() + days);
    const postponeKey = `${POSTPONE_KEY_PREFIX}${item.type}-${item.id}`;
    localStorage.setItem(postponeKey, postponeDate.toISOString());

    // Remove from pending items
    setPendingItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
  };

  const saveItem = async (item: RecurringItem, updatedAmount: number, updatedDate: string) => {
    try {
      // Create new expense/income from recurring template
      const endpoint = item.type === 'expense' ? '/api/expenses' : '/api/incomes';
      
      const body: any = {
        amount: updatedAmount,
        description: item.description,
        date: updatedDate,
        categoryId: item.categoryId,
        currency: item.currency,
        note: `Recurring ${item.type} (${item.recurringType})`,
        isRecurring: false // The actual record is not recurring, template is
      };

      if (item.type === 'income') {
        body.loanRepaymentAmount = (item as any).loanRepaymentAmount || null;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`Failed to save ${item.type}`);
      }

      // Update nextRecurringDate in the template
      const nextDate = calculateNextDate(item.nextRecurringDate, item.recurringType);
      const updateEndpoint = `${endpoint}/${item.id}`;
      
      await fetch(updateEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          nextRecurringDate: nextDate
        })
      });

      // Remove postpone key if exists
      const postponeKey = `${POSTPONE_KEY_PREFIX}${item.type}-${item.id}`;
      localStorage.removeItem(postponeKey);

      // Remove from pending items
      setPendingItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));

      return true;
    } catch (error) {
      console.error('Error saving recurring item:', error);
      return false;
    }
  };

  const cancelItem = (item: RecurringItem) => {
    // Postpone for 1 day (will show again tomorrow)
    const postponeDate = new Date();
    postponeDate.setDate(postponeDate.getDate() + 1);
    const postponeKey = `${POSTPONE_KEY_PREFIX}${item.type}-${item.id}`;
    localStorage.setItem(postponeKey, postponeDate.toISOString());
    
    // Remove from pending items
    setPendingItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
  };

  const disableRecurring = async (item: RecurringItem) => {
    try {
      // Update expense/income to remove recurring
      const endpoint = item.type === 'expense' ? `/api/expenses/${item.id}` : `/api/incomes/${item.id}`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: item.amount,
          description: item.description,
          date: item.date,
          categoryId: item.categoryId,
          currency: item.currency,
          isRecurring: false,
          recurringType: null,
          nextRecurringDate: null
        })
      });

      if (!res.ok) {
        throw new Error('Failed to disable recurring');
      }

      // Remove from pending items
      setPendingItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
      
      return true;
    } catch (error) {
      console.error('Error disabling recurring:', error);
      return false;
    }
  };

  return {
    pendingItems,
    loading,
    postponeItem,
    saveItem,
    cancelItem,
    disableRecurring,
    refresh: checkRecurringItems
  };
};

// Helper function to calculate next recurring date
function calculateNextDate(currentDate: string, recurringType: string): string {
  const date = new Date(currentDate);

  switch (recurringType) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }

  return date.toISOString().split('T')[0];
}
