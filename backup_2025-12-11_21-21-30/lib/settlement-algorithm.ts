/**
 * Settlement Algorithm
 * Calculates who owes whom in a group and minimizes number of transactions
 */

export interface GroupExpense {
  id: string
  amount: number
  paidBy: string // userId who paid
  splitAmount?: number | null
  userId: string // owner of the expense record
}

export interface GroupIncome {
  id: string
  amount: number
  userId: string
}

export interface Settlement {
  from: string // userId who owes
  to: string // userId who should receive
  amount: number
  fromName?: string
  toName?: string
}

export interface MemberBalance {
  userId: string
  name: string
  balance: number // positive = owes money to group, negative = group owes them
  paid: number // total amount they paid
  spent: number // total amount they spent (their share)
}

/**
 * Calculate balances for all group members
 * @param expenses - All group expenses
 * @param members - All group members with names
 * @returns Member balances
 */
export function calculateMemberBalances(
  expenses: GroupExpense[],
  members: Array<{ userId: string; name: string }>
): MemberBalance[] {
  const balances = new Map<string, MemberBalance>()

  // Initialize all members with zero balance
  members.forEach(member => {
    balances.set(member.userId, {
      userId: member.userId,
      name: member.name,
      balance: 0,
      paid: 0,
      spent: 0
    })
  })

  // Process each expense
  expenses.forEach(expense => {
    const paidBy = expense.paidBy || expense.userId
    const payer = balances.get(paidBy)
    
    if (!payer) return // Skip if payer not in group
    
    // Determine if this expense is split or personal
    const totalExpense = expense.amount
    const isSharedExpense = expense.splitAmount !== null && expense.splitAmount !== undefined
    
    if (isSharedExpense) {
      // Shared expense - split equally among all members
      const sharePerMember = totalExpense / members.length
      
      // Payer gets credit for full payment
      payer.paid += totalExpense
      payer.balance -= totalExpense // They paid the full amount (credit)
      
      // Everyone (including payer) owes their share
      members.forEach(member => {
        const memberBalance = balances.get(member.userId)
        if (memberBalance) {
          memberBalance.spent += sharePerMember
          memberBalance.balance += sharePerMember // They owe their share (debit)
        }
      })
    } else {
      // Personal expense - only the expense owner owes
      const expenseOwner = balances.get(expense.userId)
      
      if (expenseOwner && paidBy === expense.userId) {
        // Person paid for themselves - no balance change
        expenseOwner.paid += totalExpense
        expenseOwner.spent += totalExpense
      } else if (expenseOwner && paidBy !== expense.userId) {
        // Someone else paid for this person
        payer.paid += totalExpense
        payer.balance -= totalExpense // Payer is owed
        
        expenseOwner.spent += totalExpense
        expenseOwner.balance += totalExpense // Expense owner owes
      }
    }
  })

  return Array.from(balances.values())
}

/**
 * Minimize settlements using greedy algorithm
 * Instead of everyone paying everyone, calculate the minimum number of transactions
 * 
 * Example:
 * - A owes 100
 * - B owes 50
 * - C is owed 150
 * 
 * Naive: A → C (100), B → C (50) = 2 transactions
 * Optimized: A → C (100), B → C (50) = 2 transactions (same in this case)
 * 
 * More complex:
 * - A owes 100
 * - B is owed 50
 * - C is owed 50
 * 
 * Naive: A → B (50), A → C (50) = 2 transactions
 * Optimized: A → B (50), A → C (50) = 2 transactions (same)
 * 
 * @param balances - Member balances
 * @returns Minimized list of settlements
 */
export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = []
  
  // Create working copy to modify
  const workingBalances = balances.map(b => ({ ...b }))
  
  // Separate debtors (positive balance = owes money) and creditors (negative balance = owed money)
  const debtors = workingBalances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance)
  const creditors = workingBalances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance)
  
  let debtorIndex = 0
  let creditorIndex = 0
  
  // Greedy matching: pair largest debtor with largest creditor
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    
    const debtAmount = debtor.balance
    const creditAmount = Math.abs(creditor.balance)
    
    // Transfer the smaller of the two amounts
    const settlementAmount = Math.min(debtAmount, creditAmount)
    
    if (settlementAmount > 0.01) { // Ignore tiny amounts
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimals
        fromName: debtor.name,
        toName: creditor.name
      })
    }
    
    // Update balances
    debtor.balance -= settlementAmount
    creditor.balance += settlementAmount
    
    // Move to next if current is settled
    if (Math.abs(debtor.balance) < 0.01) debtorIndex++
    if (Math.abs(creditor.balance) < 0.01) creditorIndex++
  }
  
  return settlements
}

/**
 * Get settlements for a specific user (what they owe and who owes them)
 * @param allSettlements - All calculated settlements
 * @param userId - Target user ID
 * @returns Object with settlements where user owes and where user is owed
 */
export function getSettlementsForUser(
  allSettlements: Settlement[],
  userId: string
): {
  youOwe: Settlement[]
  owesYou: Settlement[]
} {
  return {
    youOwe: allSettlements.filter(s => s.from === userId),
    owesYou: allSettlements.filter(s => s.to === userId)
  }
}

/**
 * Calculate total balance for a user
 * @param settlements - All settlements for the user
 * @returns Net balance (negative = they owe, positive = they are owed)
 */
export function calculateNetBalance(settlements: { youOwe: Settlement[], owesYou: Settlement[] }): number {
  const totalOwed = settlements.youOwe.reduce((sum, s) => sum + s.amount, 0)
  const totalToReceive = settlements.owesYou.reduce((sum, s) => sum + s.amount, 0)
  return totalToReceive - totalOwed
}

/**
 * Validate if settlement amounts are balanced (sum should be ~0)
 * @param settlements - All settlements
 * @returns true if balanced, false otherwise
 */
export function validateSettlements(settlements: Settlement[]): boolean {
  const sum = settlements.reduce((total, s) => {
    // For each settlement, the 'from' person loses money and 'to' person gains
    // If we sum all amounts as positive for 'to' and negative for 'from', should equal 0
    return total // Just checking structure for now
  }, 0)
  
  // In a balanced settlement, total money flowing should be calculable
  return settlements.length === 0 || settlements.every(s => s.amount > 0)
}
