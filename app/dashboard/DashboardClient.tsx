"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  TrendUp,
  TrendDown,
  Wallet,
  ChartLine,
  Users,
  Tag,
  Gear,
  SignOut,
  Receipt,
  CurrencyCircleDollar,
  Plus,
  X,
  UploadSimple,
  Repeat,
  PencilSimple,
  Lightbulb,
  Robot
} from "phosphor-react"
import CountUp from 'react-countup'
import CategorySelector from "@/lib/components/CategorySelector"
import ReceiptUploader from "@/lib/components/ReceiptUploader"
import RecurringModal from "@/lib/components/RecurringModal"
import OnboardingModal from "@/components/OnboardingModal"
import HelpButton from "@/components/HelpButton"
import NotificationBell from "@/components/NotificationBell"
import AIInsightsPopup from "@/components/AIInsights"
import { useRecurringCheck } from "@/lib/hooks/useRecurringCheck"
import { getIcon } from "@/lib/iconMapping"
import { useToast } from "@/hooks/useToast"
import { useTour } from "@/contexts/TourContext"
import ConvertedAmount from "@/components/ConvertedAmount"

type User = {
  id: string
  name: string
  email: string
  username?: string
}

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface IncomeCategory {
  id: string
  name: string
  icon: string
  color: string
}

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()
  const { addToast } = useToast()
  
  // Recurring check hook
  const { 
    pendingItems, 
    loading: recurringLoading, 
    saveItem: saveRecurringItem, 
    postponeItem: postponeRecurringItem, 
    cancelItem: cancelRecurringItem, 
    disableRecurring 
  } = useRecurringCheck()
  const [currentRecurringIndex, setCurrentRecurringIndex] = useState(0)
  
  const currentRecurringItem = pendingItems[currentRecurringIndex] || null
  
  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // AI Insights popup state
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [aiAutoShow, setAiAutoShow] = useState(false)
  const [aiInsightsCount, setAiInsightsCount] = useState(0)
  const [hasNewInsights, setHasNewInsights] = useState(false)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true)
  
  // Product tour
  const { startTour } = useTour()
  
  const [stats, setStats] = useState({ 
    monthlyIncomes: 0, 
    monthlyExpenses: 0, 
    monthlyBalance: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    totalBalance: 0,
    expensesByCurrency: {} as Record<string, number>,
    incomesByCurrency: {} as Record<string, number>,
    monthlyExpensesByCurrency: {} as Record<string, number>,
    monthlyIncomesByCurrency: {} as Record<string, number>
  })
  const [currentMonthName, setCurrentMonthName] = useState("")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false)
  const [showEditIncomeModal, setShowEditIncomeModal] = useState(false)
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [isUpdatingIncome, setIsUpdatingIncome] = useState(false)
  const [editingIncome, setEditingIncome] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])
  const [recentIncomes, setRecentIncomes] = useState<any[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])
  const [incomesByCategory, setIncomesByCategory] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return num.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const playCoinSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silence audio errors
    }
  }

  // Expense form
  const [expAmount, setExpAmount] = useState("")
  const [expDescription, setExpDescription] = useState("")
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0])
  const [expCategoryId, setExpCategoryId] = useState("")
  const [expCurrency, setExpCurrency] = useState("RSD")
  const [expNote, setExpNote] = useState("")
  const [expIsRecurring, setExpIsRecurring] = useState(false)
  const [expRecurringType, setExpRecurringType] = useState("monthly")
  const [expNextRecurringDate, setExpNextRecurringDate] = useState(new Date().toISOString().split('T')[0])

  // Income form
  const [incAmount, setIncAmount] = useState("")
  const [incDescription, setIncDescription] = useState("")
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0])
  const [incCategoryId, setIncCategoryId] = useState("")
  const [incCurrency, setIncCurrency] = useState("RSD")
  const [incNote, setIncNote] = useState("")
  const [incLoanRepayment, setIncLoanRepayment] = useState("")
  const [incIsRecurring, setIncIsRecurring] = useState(false)
  const [incRecurringType, setIncRecurringType] = useState("monthly")
  const [incNextRecurringDate, setIncNextRecurringDate] = useState(new Date().toISOString().split('T')[0])

  // Edit modal state
  const [editMode, setEditMode] = useState<'expense' | 'income' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchRecentTransactions()
  }, [])

  // Show recurring modal when pending items exist
  useEffect(() => {
    if (pendingItems.length > 0 && currentRecurringIndex >= pendingItems.length) {
      setCurrentRecurringIndex(0)
    }
  }, [pendingItems, currentRecurringIndex])

  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchRecentTransactions()
    fetchBudgets()
    
    // Check if onboarding should be shown - ONLY for brand new users
    const checkIfNewUser = async () => {
      try {
        const onboardingCompleted = localStorage.getItem("onboarding_completed")
        if (onboardingCompleted) return // Already seen onboarding
        
        // Check if user has any expenses or incomes (existing user)
        const [expensesRes, incomesRes] = await Promise.all([
          fetch("/api/expenses"),
          fetch("/api/incomes")
        ])
        
        if (expensesRes.ok && incomesRes.ok) {
          const expenses = await expensesRes.json()
          const incomes = await incomesRes.json()
          
          // If user has ANY transactions, they're not new - skip onboarding
          if (expenses.length > 0 || incomes.length > 0) {
            localStorage.setItem("onboarding_completed", "true")
            return
          }
          
          // Truly new user with zero transactions - show onboarding
          setTimeout(() => {
            setShowOnboarding(true)
          }, 500)
        }
      } catch (error) {
        console.error("Failed to check new user status:", error)
      }
    }
    
    checkIfNewUser()
    
    // Fetch AI insights count for badge
    const fetchAIInsightsCount = async () => {
      try {
        const response = await fetch("/api/financial-insights")
        if (response.ok) {
          const data = await response.json()
          const count = data.insights?.length || 0
          setAiInsightsCount(count)
          
          // Check if user has seen insights before
          const lastSeen = localStorage.getItem("ai_insights_last_seen")
          if (!lastSeen || count > 0) {
            setHasNewInsights(true)
          }
        }
      } catch (error) {
        console.error("Failed to fetch AI insights count:", error)
      }
    }
    
    fetchAIInsightsCount()
    
    // Check if AI assistant is enabled
    const aiEnabled = localStorage.getItem("ai_assistant_enabled") !== "false"
    setAiAssistantEnabled(aiEnabled)
    
    // Show AI popup on login (only if not first time - onboarding takes priority)
    // AND only show once per session OR every 5 days
    // AND only if AI assistant is enabled
    const aiPopupShownThisSession = sessionStorage.getItem("ai_popup_shown")
    const lastShownTimestamp = localStorage.getItem("ai_popup_last_shown")
    const now = Date.now()
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
    
    // Show if: enabled AND (not shown this session OR 5+ days since last show)
    const shouldShowPopup = aiEnabled && onboardingCompleted && (
      !aiPopupShownThisSession || 
      !lastShownTimestamp || 
      (now - parseInt(lastShownTimestamp)) >= fiveDaysInMs
    )
    
    if (shouldShowPopup) {
      setTimeout(() => {
        setAiAutoShow(true)
        setShowAIPopup(true)
        sessionStorage.setItem("ai_popup_shown", "true")
        localStorage.setItem("ai_popup_last_shown", now.toString())
      }, 1000)
    }
    
    // Listen for changes to AI assistant setting
    const handleStorageChange = () => {
      const aiEnabled = localStorage.getItem("ai_assistant_enabled") !== "false"
      setAiAssistantEnabled(aiEnabled)
    }
    
    // Listen for settlement updates - real-time refresh
    const handleSettlementUpdate = () => {
      console.log('🔄 Settlement updated, refreshing dashboard stats...')
      fetchStats()
      fetchRecentTransactions()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [])

  const fetchCategories = async () => {
    const [catRes, incCatRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/income-categories')
    ])
    if (catRes.ok) {
      const data = await catRes.json()
      // Filter only active categories
      setCategories(data.filter((cat: any) => cat.isActive !== false))
    }
    if (incCatRes.ok) {
      const data = await incCatRes.json()
      // Filter only active categories
      setIncomeCategories(data.filter((cat: any) => cat.isActive !== false))
    }
  }

  const fetchRecentTransactions = async () => {
    console.log('🔄 fetchRecentTransactions called')
    const [expensesRes, incomesRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/incomes')
    ])
    
    if (expensesRes.ok) {
      const expenses = await expensesRes.json()
      console.log('📊 Fetched expenses (first 3):')
      expenses.slice(0, 3).forEach((exp: any) => {
        console.log(`  ${exp.description}: amount=${exp.amount}, currency=${exp.currency}, amountInRSD=${exp.amountInRSD}`)
      })
      setRecentExpenses(expenses.slice(0, 3))
      
      // Calculate expenses by category
      const categoryTotals: any = {}
      expenses.forEach((exp: any) => {
        const catName = exp.category?.name || 'Ostalo'
        const catColor = exp.category?.color || '#9F70FF'
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { total: 0, color: catColor }
        }
        categoryTotals[catName].total += exp.amount
      })
      
      const categoryArray = Object.entries(categoryTotals)
        .map(([name, data]: [string, any]) => ({ name, total: data.total, color: data.color }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
      
      setExpensesByCategory(categoryArray)
    }
    
    if (incomesRes.ok) {
      const incomes = await incomesRes.json()
      setRecentIncomes(incomes.slice(0, 3))
      
      // Calculate incomes by category
      const categoryTotals: any = {}
      incomes.forEach((inc: any) => {
        const catName = inc.category?.name || 'Ostalo'
        const catColor = inc.category?.color || '#45D38A'
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { total: 0, color: catColor }
        }
        categoryTotals[catName].total += inc.amount
      })
      
      const categoryArray = Object.entries(categoryTotals)
        .map(([name, data]: [string, any]) => ({ name, total: data.total, color: data.color }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
      
      setIncomesByCategory(categoryArray)
    }
  }

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets?period=MONTHLY')
      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : []
        setBudgets(data.slice(0, 3)) // Show top 3 budgets
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const fetchStats = async () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    // Get month name in Serbian
    const monthNames = [
      "Januar", "Februar", "Mart", "April", "Maj", "Jun",
      "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
    ]
    setCurrentMonthName(monthNames[now.getMonth()])

    // Fetch monthly data
    const [monthlyExpensesRes, monthlyIncomesRes, totalExpensesRes, totalIncomesRes] = await Promise.all([
      fetch(`/api/expenses?month=${month}&year=${year}`),
      fetch(`/api/incomes?month=${month}&year=${year}`),
      fetch(`/api/expenses`),
      fetch(`/api/incomes`)
    ])

    if (monthlyExpensesRes.ok && monthlyIncomesRes.ok && totalExpensesRes.ok && totalIncomesRes.ok) {
      const monthlyExpenses = await monthlyExpensesRes.json()
      const monthlyIncomes = await monthlyIncomesRes.json()
      const totalExpenses = await totalExpensesRes.json()
      const totalIncomes = await totalIncomesRes.json()

      console.log('📊 First total expense:', totalExpenses[0])
      console.log('💰 amountInRSD:', totalExpenses[0]?.amountInRSD)

      // Koristi amountInRSD za statistike ako postoji, inače amount
      const monthlyExpensesTotal = monthlyExpenses.reduce((sum: number, e: any) => sum + (e.amountInRSD || e.amount), 0)
      const monthlyIncomesTotal = monthlyIncomes.reduce((sum: number, i: any) => sum + (i.amountInRSD || i.amount), 0)
      const totalExpensesTotal = totalExpenses.reduce((sum: number, e: any) => sum + (e.amountInRSD || e.amount), 0)
      const totalIncomesTotal = totalIncomes.reduce((sum: number, i: any) => sum + (i.amountInRSD || i.amount), 0)

      console.log('🧮 Total expenses calculated:', totalExpensesTotal)
      console.log('🧮 Total incomes calculated:', totalIncomesTotal)

      // Group by currency
      const expensesByCurrency = totalExpenses.reduce((acc: Record<string, number>, e: any) => {
        const currency = e.currency || 'RSD'
        acc[currency] = (acc[currency] || 0) + e.amount
        return acc
      }, {})

      const incomesByCurrency = totalIncomes.reduce((acc: Record<string, number>, i: any) => {
        const currency = i.currency || 'RSD'
        acc[currency] = (acc[currency] || 0) + i.amount
        return acc
      }, {})

      const monthlyExpensesByCurrency = monthlyExpenses.reduce((acc: Record<string, number>, e: any) => {
        const currency = e.currency || 'RSD'
        acc[currency] = (acc[currency] || 0) + e.amount
        return acc
      }, {})

      const monthlyIncomesByCurrency = monthlyIncomes.reduce((acc: Record<string, number>, i: any) => {
        const currency = i.currency || 'RSD'
        acc[currency] = (acc[currency] || 0) + i.amount
        return acc
      }, {})

      setStats({
        monthlyExpenses: monthlyExpensesTotal,
        monthlyIncomes: monthlyIncomesTotal,
        monthlyBalance: monthlyIncomesTotal - monthlyExpensesTotal,
        totalExpenses: totalExpensesTotal,
        totalIncomes: totalIncomesTotal,
        totalBalance: totalIncomesTotal - totalExpensesTotal,
        expensesByCurrency,
        incomesByCurrency,
        monthlyExpensesByCurrency,
        monthlyIncomesByCurrency
      })
    }
  }

  // Recurring modal handlers
  const handleRecurringSave = async (updatedAmount: number, updatedDate: string) => {
    if (!currentRecurringItem) return
    const success = await saveRecurringItem(currentRecurringItem, updatedAmount, updatedDate)
    if (success) {
      setCurrentRecurringIndex(0)
      fetchStats()
    }
  }

  const handleRecurringPostpone = (days: number) => {
    if (!currentRecurringItem) return
    postponeRecurringItem(currentRecurringItem, days)
    setCurrentRecurringIndex(0)
  }

  const handleRecurringCancel = () => {
    if (!currentRecurringItem) return
    cancelRecurringItem(currentRecurringItem)
    setCurrentRecurringIndex(0)
  }

  const handleRecurringDisable = async () => {
    if (!currentRecurringItem) return
    const success = await disableRecurring(currentRecurringItem)
    if (success) {
      setCurrentRecurringIndex(0)
      fetchStats()
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode === 'expense' && editingId) {
      // Update existing expense
      const res = await fetch(`/api/expenses/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(expAmount),
          description: expDescription,
          date: expDate,
          categoryId: expCategoryId,
          currency: expCurrency,
          note: expNote || null,
          isRecurring: expIsRecurring,
          recurringType: expIsRecurring ? expRecurringType : null,
          nextRecurringDate: expIsRecurring ? expNextRecurringDate : null
        })
      })
      if (res.ok) {
        setShowExpenseModal(false)
        setEditMode(null)
        setEditingId(null)
        setExpAmount("")
        setExpDescription("")
        setExpDate(new Date().toISOString().split('T')[0])
        setExpCategoryId("")
        setExpCurrency("RSD")
        setExpNote("")
        setExpIsRecurring(false)
        setExpRecurringType("monthly")
        setExpNextRecurringDate(new Date().toISOString().split('T')[0])
        fetchStats()
        fetchRecentTransactions()
      }
    } else {
      // Create new expense
      console.log('💰 Sending expense with currency:', expCurrency)
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(expAmount),
          description: expDescription,
          date: expDate,
          categoryId: expCategoryId,
          currency: expCurrency,
          note: expNote || null,
          receiptUrl: null,
          isRecurring: expIsRecurring,
          recurringType: expIsRecurring ? expRecurringType : null,
          nextRecurringDate: expIsRecurring ? expNextRecurringDate : null
        })
      })
      if (res.ok) {
        setShowExpenseModal(false)
        addToast("Trošak uspešno dodat", "success")
        setExpAmount("")
        setExpDescription("")
        setExpDate(new Date().toISOString().split('T')[0])
        setExpCategoryId("")
        setExpCurrency("RSD")
        setExpNote("")
        setExpIsRecurring(false)
        setExpRecurringType("monthly")
        setExpNextRecurringDate(new Date().toISOString().split('T')[0])
        fetchStats()
        fetchRecentTransactions()
      }
    }
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editMode === 'income' && editingId) {
      // Update existing income
      const res = await fetch(`/api/incomes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(incAmount),
          description: incDescription,
          date: incDate,
          categoryId: incCategoryId,
          currency: incCurrency,
          loanRepaymentAmount: incLoanRepayment ? parseFloat(incLoanRepayment) : null,
          note: incNote || null,
          isRecurring: incIsRecurring,
          recurringType: incIsRecurring ? incRecurringType : null,
          nextRecurringDate: incIsRecurring ? incNextRecurringDate : null
        })
      })
      if (res.ok) {
        setShowIncomeModal(false)
        setEditMode(null)
        setEditingId(null)
        setIncAmount("")
        setIncDescription("")
        setIncDate(new Date().toISOString().split('T')[0])
        setIncCategoryId("")
        setIncCurrency("RSD")
        setIncLoanRepayment("")
        setIncNote("")
        setIncIsRecurring(false)
        setIncRecurringType("monthly")
        setIncNextRecurringDate(new Date().toISOString().split('T')[0])
        fetchStats()
        fetchRecentTransactions()
      }
    } else {
      // Create new income
      const res = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(incAmount),
          description: incDescription,
          date: incDate,
          categoryId: incCategoryId,
          currency: incCurrency,
          loanRepaymentAmount: incLoanRepayment ? parseFloat(incLoanRepayment) : null,
          note: incNote || null,
          isRecurring: incIsRecurring,
          recurringType: incIsRecurring ? incRecurringType : null,
          nextRecurringDate: incIsRecurring ? incNextRecurringDate : null
        })
      })
      if (res.ok) {
        setShowIncomeModal(false)
        addToast("Prihod uspešno dodat", "success")
        setIncAmount("")
        setIncDescription("")
        setIncDate(new Date().toISOString().split('T')[0])
        setIncCategoryId("")
        setIncCurrency("RSD")
        setIncNote("")
        setIncLoanRepayment("")
        setIncIsRecurring(false)
        setIncRecurringType("monthly")
        setIncNextRecurringDate(new Date().toISOString().split('T')[0])
        fetchStats()
        fetchRecentTransactions()
      }
    }
  }

  const handleEditExpense = (expense: any) => {
    console.log('🔍 Opening edit modal for expense:', expense)
    console.log('Expense ID:', expense.id, 'Currency:', expense.currency)
    setEditingExpense(expense)
    console.log('✅ editingExpense state set to:', expense)
    setExpAmount(expense.amount.toString())
    setExpDescription(expense.description)
    setExpDate(expense.date.split('T')[0])
    setExpCategoryId(expense.categoryId)
    setExpCurrency(expense.currency || "RSD")
    console.log('💱 Set expCurrency to:', expense.currency || "RSD")
    setExpNote(expense.note || "")
    setExpIsRecurring(expense.recurringExpense ? true : false)
    setExpRecurringType(expense.recurringExpense?.frequency || "monthly")
    setExpNextRecurringDate(expense.recurringExpense?.nextExecutionAt?.split('T')[0] || new Date().toISOString().split('T')[0])
    setShowEditExpenseModal(true)
  }

  const handleUpdateExpense = async (e: React.FormEvent) => {
    console.log('🔥 handleUpdateExpense CALLED!')
    e.preventDefault()
    
    if (isUpdatingExpense) {
      console.log('⚠️ Already updating, skipping...')
      return
    }
    
    if (!editingExpense) {
      console.log('❌ No editingExpense, returning')
      return
    }
    
    setIsUpdatingExpense(true)
    
    console.log('Updating expense:', {
      id: editingExpense.id,
      amount: expAmount,
      description: expDescription,
      date: expDate,
      categoryId: expCategoryId,
      currency: expCurrency
    })
    
    const res = await fetch(`/api/expenses/${editingExpense.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(expAmount),
        description: expDescription,
        date: expDate,
        categoryId: expCategoryId,
        currency: expCurrency,
        note: expNote || null,
        isRecurring: expIsRecurring,
        recurringType: expIsRecurring ? expRecurringType : null,
        nextRecurringDate: expIsRecurring ? expNextRecurringDate : null
      })
    })
    
    console.log('Response status:', res.status)
    
    if (res.ok) {
      const text = await res.text()
      const updatedExpense = text ? JSON.parse(text) : {}
      console.log('Update successful, currency:', updatedExpense.currency)
      setShowEditExpenseModal(false)
      setEditingExpense(null)
      setExpAmount("")
      setExpDescription("")
      setExpDate(new Date().toISOString().split('T')[0])
      setExpCategoryId("")
      setExpCurrency("RSD")
      setExpNote("")
      setExpIsRecurring(false)
      setExpRecurringType("monthly")
      setExpNextRecurringDate(new Date().toISOString().split('T')[0])
      addToast("Trošak uspešno ažuriran", "success")
      fetchStats()
      fetchRecentTransactions()
    } else {
      const text = await res.text()
      const errorData = text ? JSON.parse(text) : { error: 'Nepoznata greška' }
      console.error('Error updating expense:', errorData)
      addToast('Greška pri čuvanju troška: ' + (errorData.error || 'Nepoznata greška'), 'error')
    }
    
    setIsUpdatingExpense(false)
  }

  const handleCancelEditExpense = () => {
    setShowEditExpenseModal(false)
    setEditingExpense(null)
    setExpAmount("")
    setExpDescription("")
    setExpDate("")
    setExpCategoryId("")
    setExpCurrency("RSD")
    setExpNote("")
    setExpIsRecurring(false)
    setExpRecurringType("monthly")
    setExpNextRecurringDate(new Date().toISOString().split('T')[0])
  }

  const handleEditIncome = (income: any) => {
    console.log('🔍 Opening edit modal for income:', income)
    console.log('Income ID:', income.id, 'Currency:', income.currency)
    setEditingIncome(income)
    console.log('✅ editingIncome state set to:', income)
    setIncAmount(income.amount.toString())
    setIncDescription(income.description)
    setIncDate(income.date.split('T')[0])
    setIncCategoryId(income.categoryId)
    setIncCurrency(income.currency || "RSD")
    console.log('💱 Set incCurrency to:', income.currency || "RSD")
    setIncNote(income.note || "")
    setIncLoanRepayment(income.loanRepaymentAmount?.toString() || "")
    setIncIsRecurring(income.recurringIncome ? true : false)
    setIncRecurringType(income.recurringIncome?.frequency || "monthly")
    setIncNextRecurringDate(income.recurringIncome?.nextExecutionAt?.split('T')[0] || new Date().toISOString().split('T')[0])
    setShowEditIncomeModal(true)
  }

  const handleUpdateIncome = async (e: React.FormEvent) => {
    console.log('🔥 handleUpdateIncome CALLED!')
    e.preventDefault()
    
    if (isUpdatingIncome) {
      console.log('⚠️ Already updating, skipping...')
      return
    }
    
    if (!editingIncome) {
      console.log('❌ No editingIncome, returning')
      return
    }
    
    setIsUpdatingIncome(true)
    
    console.log('Updating income:', {
      id: editingIncome.id,
      amount: incAmount,
      description: incDescription,
      date: incDate,
      categoryId: incCategoryId,
      currency: incCurrency
    })
    
    const res = await fetch(`/api/incomes/${editingIncome.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(incAmount),
        description: incDescription,
        date: incDate,
        categoryId: incCategoryId,
        currency: incCurrency,
        loanRepaymentAmount: incLoanRepayment ? parseFloat(incLoanRepayment) : null,
        note: incNote || null,
        isRecurring: incIsRecurring,
        recurringType: incIsRecurring ? incRecurringType : null,
        nextRecurringDate: incIsRecurring ? incNextRecurringDate : null
      })
    })
    
    console.log('Response status:', res.status)
    
    if (res.ok) {
      const text = await res.text()
      const updatedIncome = text ? JSON.parse(text) : {}
      console.log('Update successful, currency:', updatedIncome.currency)
      setShowEditIncomeModal(false)
      setEditingIncome(null)
      setIncAmount("")
      setIncDescription("")
      setIncDate(new Date().toISOString().split('T')[0])
      setIncCategoryId("")
      setIncCurrency("RSD")
      setIncNote("")
      setIncLoanRepayment("")
      setIncIsRecurring(false)
      setIncRecurringType("monthly")
      setIncNextRecurringDate(new Date().toISOString().split('T')[0])
      addToast("Prihod uspešno ažuriran", "success")
      fetchStats()
      fetchRecentTransactions()
    } else {
      const text = await res.text()
      const errorData = text ? JSON.parse(text) : { error: 'Nepoznata greška' }
      console.error('Error updating income:', errorData)
      addToast('Greška pri čuvanju prihoda: ' + (errorData.error || 'Nepoznata greška'), 'error')
    }
    
    setIsUpdatingIncome(false)
  }

  const handleCancelEditIncome = () => {
    setShowEditIncomeModal(false)
    setEditingIncome(null)
    setIncAmount("")
    setIncDescription("")
    setIncDate("")
    setIncCategoryId("")
    setIncCurrency("RSD")
    setIncNote("")
    setIncLoanRepayment("")
    setIncIsRecurring(false)
    setIncRecurringType("monthly")
    setIncNextRecurringDate(new Date().toISOString().split('T')[0])
  }

  const handleSignOut = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen px-10 lg:px-14 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8" style={{paddingTop: '24px'}}>
          <div>
            {/* Horizontalni logotip */}
            <div className="flex items-center gap-3 mb-6">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <defs>
                  <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A64DFF" />
                    <stop offset="100%" stopColor="#4DB2FF" />
                  </linearGradient>
                </defs>
                {/* Outline kućica */}
                <path d="M24 6L6 18V42H18V30H30V42H42V18L24 6Z" 
                      stroke="url(#brandGradient)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"/>
                {/* Uzlazna grafikon linija */}
                <path d="M12 32L18 26L24 28L30 22L36 25" 
                      stroke="url(#brandGradient)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"/>
                {/* Grafikon stubići/tačke */}
                <circle cx="12" cy="32" r="2" fill="url(#brandGradient)"/>
                <circle cx="18" cy="26" r="2" fill="url(#brandGradient)"/>
                <circle cx="24" cy="28" r="2" fill="url(#brandGradient)"/>
                <circle cx="30" cy="22" r="2" fill="url(#brandGradient)"/>
                <circle cx="36" cy="25" r="2" fill="url(#brandGradient)"/>
              </svg>
              <h1 className="text-[38px] font-bold" style={{
                color: '#FFFFFF', 
                fontFamily: '"Inter", "SF Pro", "Poppins", sans-serif', 
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}>
                Domaćin
              </h1>
            </div>
            <p style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Dobrodošli, {user.username || user.name}</p>
            <p className="text-sm mt-1" style={{color: 'rgba(255,255,255,0.45)', fontFamily: '"Inter", sans-serif'}}>Vaša kontrolna tabla troškova i prihoda</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => startTour('dashboard')}
              className="px-5 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
              style={{background: 'rgba(159, 112, 255, 0.15)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#B794FF'}}
            >
              <ChartLine size={20} weight="bold" />
              Tura
            </button>
            
            {/* AI Assistant Button - Only show if enabled */}
            {aiAssistantEnabled && (
              <div className="relative">
                <button
                  onClick={() => { 
                    setAiAutoShow(false); 
                    setShowAIPopup(true);
                    setHasNewInsights(false);
                    localStorage.setItem("ai_insights_last_seen", Date.now().toString());
                  }}
                  className="px-5 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    color: '#A855F7',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <Robot size={22} weight="duotone" />
                  AI
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'}}
                  />
                </button>
                {hasNewInsights && aiInsightsCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  >
                    {aiInsightsCount}
                  </span>
                )}
              </div>
            )}
            
            {/* Notification Bell */}
            <NotificationBell />
            
            <button
              onClick={handleSignOut}
              className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
              style={{background: '#242236', border: '1px solid #2E2B44'}}
            >
              <SignOut size={20} weight="bold" />
              Odjavi se
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8" data-tour="stats-card">
          <div className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(228,88,110,0.3)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', height: '120px'}} onClick={() => router.push('/expenses')}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupni troškovi</div>
              <TrendDown size={20} weight="duotone" style={{color: '#FFB3E6'}} />
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                <CountUp 
                  end={stats.totalExpenses} 
                  duration={0.8} 
                  decimals={0} 
                  separator="." 
                  preserveValue
                  onStart={playCoinSound}
                /> <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
              </div>
              {Object.keys(stats.expensesByCurrency).length > 1 && (
                <div className="text-[10px] italic" style={{color: 'rgba(255,255,255,0.4)', marginTop: '4px'}}>
                  sa valutom konvertovanom u RSD
                </div>
              )}
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: 'rgba(255, 179, 230, 0.15)', color: '#FFB3E6', border: '1px solid rgba(255, 179, 230, 0.2)'}}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyExpenses} 
                duration={0.8} 
                decimals={0} 
                separator="." 
                preserveValue
              />
            </div>
          </div>
          
          <div className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(27,217,106,0.3)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', height: '120px'}} onClick={() => router.push('/incomes')}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupni prihodi</div>
              <TrendUp size={20} weight="duotone" style={{color: '#6FFFC4'}} />
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                <CountUp 
                  end={stats.totalIncomes} 
                  duration={0.8} 
                  decimals={0} 
                  separator="." 
                  preserveValue
                  onStart={playCoinSound}
                /> <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
              </div>
              {Object.keys(stats.incomesByCurrency).length > 1 && (
                <div className="text-[10px] italic" style={{color: 'rgba(255,255,255,0.4)', marginTop: '4px'}}>
                  sa valutom konvertovanom u RSD
                </div>
              )}
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: 'rgba(111, 255, 196, 0.15)', color: '#6FFFC4', border: '1px solid rgba(111, 255, 196, 0.2)'}}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyIncomes} 
                duration={0.8} 
                decimals={0} 
                separator="." 
                preserveValue
              />
            </div>
          </div>
          
          <div className="rounded-3xl relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', height: '120px'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Bilans</div>
              <Wallet size={20} weight="duotone" style={{color: stats.totalBalance >= 0 ? '#7FDFFF' : '#FFB3E6'}} />
            </div>
            <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              <CountUp 
                end={stats.totalBalance} 
                duration={0.8} 
                decimals={0} 
                separator="." 
                preserveValue
                onStart={playCoinSound}
              /> <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
              background: stats.monthlyBalance >= 0 ? 'rgba(127, 223, 255, 0.15)' : 'rgba(255, 179, 230, 0.15)', 
              color: stats.monthlyBalance >= 0 ? '#7FDFFF' : '#FFB3E6',
              border: stats.monthlyBalance >= 0 ? '1px solid rgba(127, 223, 255, 0.2)' : '1px solid rgba(255, 179, 230, 0.2)'
            }}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyBalance} 
                duration={0.8} 
                decimals={0} 
                separator="." 
                preserveValue
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[4%] mt-6 md:mt-10 mb-6 md:mb-8">
          <div
            data-tour="recent-expenses"
            className="p-1 rounded-3xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(166,77,255,0.35)]"
            style={{
              background: 'linear-gradient(135deg, rgba(166,77,255,0.3) 0%, rgba(255,104,194,0.3) 100%)'
            }}
            onClick={() => router.push('/expenses')}
          >
            <div className="rounded-3xl backdrop-blur-xl p-6" style={{background: 'rgba(20, 18, 38, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <Receipt size={36} weight="duotone" className="mb-4" style={{color: '#E8D9FF'}} />
                  <h3 className="text-xl font-semibold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Troškovi</h3>
                  <p className="text-sm" style={{color: '#E8D9FF', opacity: 0.7}}>Upravljajte svojim troškovima</p>
                </div>
                
                {expensesByCategory.length > 0 && (
                  <div className="flex items-center justify-center gap-3 p-3 rounded-xl mt-4 lg:mt-2 h-[160px] lg:h-[190px]" style={{background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                    <div className="relative w-[180px] h-[180px] lg:w-[130px] lg:h-[130px]" style={{flexShrink: 0}}>
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-sm">
                        <defs>
                          <linearGradient id="segmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                          </linearGradient>
                        </defs>
                        <g transform="rotate(-90 50 50)">
                          {(() => {
                            const total = expensesByCategory.reduce((sum, cat) => sum + cat.total, 0);
                            let currentAngle = 0;
                            const premiumColors = ['#FFB3E6', '#D19CFF', '#FFC35A', '#FF7AD9'];
                            return expensesByCategory.map((cat, idx) => {
                              const percentage = (cat.total / total) * 100;
                              const angle = (percentage / 100) * 360;
                              const startAngle = currentAngle;
                              currentAngle += angle;
                              
                              const startRad = (startAngle * Math.PI) / 180;
                              const endRad = (currentAngle * Math.PI) / 180;
                              const x1 = 50 + 42 * Math.cos(startRad);
                              const y1 = 50 + 42 * Math.sin(startRad);
                              const x2 = 50 + 42 * Math.cos(endRad);
                              const y2 = 50 + 42 * Math.sin(endRad);
                              const largeArc = angle > 180 ? 1 : 0;
                              const color = premiumColors[idx % premiumColors.length];
                              
                              return (
                                <g key={idx}>
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={color}
                                    className="hover:opacity-90 transition-opacity"
                                    style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}}
                                  />
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="url(#segmentShine)"
                                    opacity="0.2"
                                  />
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.25)"
                                    strokeWidth="1"
                                  />
                                </g>
                              );
                            });
                          })()}
                        </g>
                        <circle cx="50" cy="50" r="20" fill="rgba(20, 18, 36, 0.95)" stroke="rgba(255, 184, 230, 0.3)" strokeWidth="1.5" />
                        <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="14" fontWeight="bold">
                          {expensesByCategory.length}
                        </text>
                        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#E5E5E5" fontSize="8" opacity="0.7">
                          kat.
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-center">
                      {expensesByCategory.slice(0, 4).map((cat, idx) => {
                        const total = expensesByCategory.reduce((sum, c) => sum + c.total, 0);
                        const percentage = ((cat.total / total) * 100).toFixed(1);
                        const premiumColors = ['#FFB3E6', '#D19CFF', '#FFC35A', '#FF7AD9'];
                        const color = premiumColors[idx % premiumColors.length];
                        return (
                          <div key={idx} className="flex items-center gap-2.5 group">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: color}}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold truncate" style={{color: '#E8D9FF'}}>{cat.name}</div>
                            </div>
                            <div className="text-[9px] font-bold" style={{color: color}}>{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {recentExpenses.length > 0 && (
                <div className="flex flex-col gap-3 lg:gap-4 mt-6 min-h-[300px]">
                  <div className="text-[10px] font-bold tracking-wide" style={{color: '#E8D9FF', opacity: 0.7, fontFamily: '"Inter", sans-serif'}}>POSLEDNJI TROŠKOVI</div>
                  {recentExpenses.map((expense, idx) => {
                    console.log(`💰 Rendering expense "${expense.description}":`, { 
                      currency: expense.currency, 
                      amount: expense.amount,
                      amountInRSD: expense.amountInRSD 
                    })
                    const IconComponent = getIcon(expense.category?.icon);
                    return (
                      <div 
                        key={expense.id}
                        data-tour={idx === 0 ? "expense-item" : undefined}
                        className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]"
                        style={{border: '1px solid rgba(255, 255, 255, 0.04)'}}
                      >
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push('/expenses'); }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(255, 179, 230, 0.15)', border: '1px solid rgba(255, 179, 230, 0.2)', boxShadow: '0 0 15px rgba(255, 179, 230, 0.2)'}}>
                            <IconComponent size={18} weight="duotone" style={{color: '#FFB3E6'}} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>{expense.description}</div>
                              <div className="flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium" style={{background: 'rgba(255, 179, 230, 0.08)', border: '1px solid rgba(255, 179, 230, 0.15)', color: '#FFB3E6'}}>
                                {new Date(expense.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toLowerCase()}
                              </div>
                              {(expense as any).recurringExpense && (
                                <div className="flex-shrink-0 px-2 py-0.5 rounded-xl flex items-center gap-1" style={{background: 'rgba(159, 112, 255, 0.12)', border: '1px solid rgba(159, 112, 255, 0.25)'}}>
                                  <Repeat size={12} weight="bold" style={{color: '#9F70FF'}} />
                                  <span className="text-xs font-medium" style={{color: '#9F70FF'}}>
                                    {(expense as any).recurringExpense.frequency === 'monthly' ? 'Mesečno' : 
                                     (expense as any).recurringExpense.frequency === 'weekly' ? 'Nedeljno' : 'Godišnje'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm" style={{color: '#E8D9FF', opacity: 0.6}}>
                              {expense.category?.name}
                              {(expense as any).recurringExpense && (
                                <span className="ml-2">
                                  • Sledeće: {new Date((expense as any).recurringExpense.nextExecutionAt).toLocaleDateString('sr-RS')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold whitespace-nowrap" style={{color: '#FFE3F7', fontFamily: '"Inter", sans-serif'}}>
                            -{formatNumber(expense.amount)} <span style={{fontSize: '0.75em', opacity: 0.6, marginLeft: '2px'}}>{expense.currency || "RSD"}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditExpense(expense); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                            style={{background: 'rgba(255, 179, 230, 0.1)', border: '1px solid rgba(255, 179, 230, 0.2)'}}
                          >
                            <PencilSimple size={16} weight="duotone" style={{color: '#FFB3E6'}} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="p-3 rounded-[16px] mt-6" style={{background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/expenses'); }}
                  className="w-full py-3 rounded-xl font-semibold cursor-pointer border transition-all duration-150 ease-out"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)', 
                    color: '#E8D9FF', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    fontFamily: '"Inter", "Poppins", sans-serif', 
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F5EBFF';
                    e.currentTarget.style.borderColor = 'rgba(232, 217, 255, 0.25)';
                    e.currentTarget.style.boxShadow = 'inset 0 0 4px rgba(232, 217, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#E8D9FF';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Prikaži sve →
                </button>
              </div>
            </div>
          </div>

          <div
            data-tour="recent-incomes"
            className="p-1 rounded-3xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(40,234,138,0.35)]"
            style={{
              background: 'linear-gradient(135deg, rgba(40,234,138,0.3) 0%, rgba(31,184,255,0.3) 100%)'
            }}
            onClick={() => router.push('/incomes')}
          >
            <div className="rounded-3xl backdrop-blur-xl p-6" style={{background: 'rgba(20, 18, 38, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <CurrencyCircleDollar size={36} weight="duotone" className="mb-4" style={{color: '#D3FFF2'}} />
                  <h3 className="text-xl font-semibold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Prihodi</h3>
                  <p className="text-sm" style={{color: '#D3FFF2', opacity: 0.7}}>Pratite svoje prihode</p>
                </div>
                
                {incomesByCategory.length > 0 && (
                  <div className="flex items-center justify-center gap-3 p-3 rounded-xl mt-4 lg:mt-2 h-[160px] lg:h-[190px]" style={{background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                    <div className="relative w-[180px] h-[180px] lg:w-[130px] lg:h-[130px]" style={{flexShrink: 0}}>
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-sm">
                        <defs>
                          <linearGradient id="segmentShineIncome" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                          </linearGradient>
                        </defs>
                        <g transform="rotate(-90 50 50)">
                          {(() => {
                            const total = incomesByCategory.reduce((sum, cat) => sum + cat.total, 0);
                            let currentAngle = 0;
                            const premiumColors = ['#B4FFE4', '#6FFFC4', '#7FDFFF', '#00BFA6'];
                            return incomesByCategory.map((cat, idx) => {
                              const percentage = (cat.total / total) * 100;
                              const angle = (percentage / 100) * 360;
                              const startAngle = currentAngle;
                              currentAngle += angle;
                              
                              const startRad = (startAngle * Math.PI) / 180;
                              const endRad = (currentAngle * Math.PI) / 180;
                              const x1 = 50 + 42 * Math.cos(startRad);
                              const y1 = 50 + 42 * Math.sin(startRad);
                              const x2 = 50 + 42 * Math.cos(endRad);
                              const y2 = 50 + 42 * Math.sin(endRad);
                              const largeArc = angle > 180 ? 1 : 0;
                              const color = premiumColors[idx % premiumColors.length];
                              
                              return (
                                <g key={idx}>
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={color}
                                    className="hover:opacity-90 transition-opacity"
                                    style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}}
                                  />
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="url(#segmentShineIncome)"
                                    opacity="0.2"
                                  />
                                  <path
                                    d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.25)"
                                    strokeWidth="1"
                                  />
                                </g>
                              );
                            });
                          })()}
                        </g>
                        <circle cx="50" cy="50" r="20" fill="rgba(20, 18, 36, 0.95)" stroke="rgba(180, 255, 228, 0.3)" strokeWidth="1.5" />
                        <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="14" fontWeight="bold">
                          {incomesByCategory.length}
                        </text>
                        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#E5E5E5" fontSize="8" opacity="0.7">
                          kat.
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-center">
                      {incomesByCategory.slice(0, 4).map((cat, idx) => {
                        const total = incomesByCategory.reduce((sum, c) => sum + c.total, 0);
                        const percentage = ((cat.total / total) * 100).toFixed(1);
                        const premiumColors = ['#B4FFE4', '#6FFFC4', '#7FDFFF', '#00BFA6'];
                        const color = premiumColors[idx % premiumColors.length];
                        return (
                          <div key={idx} className="flex items-center gap-2.5 group">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: color}}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold truncate" style={{color: '#D3FFF2'}}>{cat.name}</div>
                            </div>
                            <div className="text-[9px] font-bold" style={{color: color}}>{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {recentIncomes.length > 0 && (
                <div className="flex flex-col gap-3 lg:gap-4 mt-6 min-h-[300px]">
                  <div className="text-[10px] font-bold tracking-wide" style={{color: '#D3FFF2', opacity: 0.7, fontFamily: '"Inter", sans-serif'}}>POSLEDNJI PRIHODI</div>
                  {recentIncomes.map((income, idx) => {
                    const IconComponent = getIcon(income.category?.icon);
                    return (
                      <div 
                        key={income.id}
                        className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]"
                        style={{border: '1px solid rgba(255, 255, 255, 0.04)'}}
                      >
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push('/incomes'); }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(111, 255, 196, 0.15)', border: '1px solid rgba(111, 255, 196, 0.2)', boxShadow: '0 0 15px rgba(111, 255, 196, 0.2)'}}>
                            <IconComponent size={18} weight="duotone" style={{color: '#6FFFC4'}} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>{income.description}</div>
                              <div className="flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium" style={{background: 'rgba(111, 255, 196, 0.08)', border: '1px solid rgba(111, 255, 196, 0.15)', color: '#6FFFC4'}}>
                                {new Date(income.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toLowerCase()}
                              </div>
                              {(income as any).recurringIncome && (
                                <div className="flex-shrink-0 px-2 py-0.5 rounded-xl flex items-center gap-1" style={{background: 'rgba(69, 211, 138, 0.12)', border: '1px solid rgba(69, 211, 138, 0.25)'}}>
                                  <Repeat size={12} weight="bold" style={{color: '#45D38A'}} />
                                  <span className="text-xs font-medium" style={{color: '#45D38A'}}>
                                    {(income as any).recurringIncome.frequency === 'monthly' ? 'Mesečno' : 
                                     (income as any).recurringIncome.frequency === 'weekly' ? 'Nedeljno' : 'Godišnje'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm" style={{color: '#D3FFF2', opacity: 0.6}}>
                              {income.category?.name}
                              {(income as any).recurringIncome && (
                                <span className="ml-2">
                                  • Sledeće: {new Date((income as any).recurringIncome.nextExecutionAt).toLocaleDateString('sr-RS')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold whitespace-nowrap" style={{color: '#C6FFE6', fontFamily: '"Inter", sans-serif'}}>
                            +{formatNumber(income.amount)} <span style={{fontSize: '0.75em', opacity: 0.6, marginLeft: '2px'}}>{income.currency || "RSD"}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditIncome(income); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                            style={{background: 'rgba(111, 255, 196, 0.1)', border: '1px solid rgba(111, 255, 196, 0.2)'}}
                          >
                            <PencilSimple size={16} weight="duotone" style={{color: '#6FFFC4'}} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="p-3 rounded-[16px] mt-6" style={{background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/incomes'); }}
                  className="w-full py-3 rounded-xl font-semibold cursor-pointer border transition-all duration-150 ease-out"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)', 
                    color: '#D3FFF2', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    fontFamily: '"Inter", "Poppins", sans-serif', 
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E8FFF9';
                    e.currentTarget.style.borderColor = 'rgba(211, 255, 242, 0.25)';
                    e.currentTarget.style.boxShadow = 'inset 0 0 4px rgba(211, 255, 242, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#D3FFF2';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Prikaži sve →
                </button>
              </div>
            </div>
          </div>
        </div>

          <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" data-tour="quick-access">
            <h2 className="text-xl font-semibold mb-6" style={{fontFamily: '"Inter", sans-serif', color: '#FFFFFF'}}>Brzi pristup</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              <button onClick={() => router.push('/statistics')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <ChartLine size={24} weight="bold" style={{color: '#B794FF'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Statistika</div>
              </button>
              <button onClick={() => router.push('/budgets')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <Wallet size={24} weight="bold" style={{color: '#FFD93D'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Budžeti</div>
              </button>
              <button onClick={() => router.push('/groups')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <Users size={24} weight="bold" style={{color: '#7FDFFF'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Grupe</div>
              </button>
              <button onClick={() => router.push('/settlements')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <CurrencyCircleDollar size={24} weight="bold" style={{color: '#1BD96A'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Poravnanja</div>
              </button>
              <button onClick={() => router.push('/categories')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <Tag size={24} weight="bold" style={{color: '#6FFFC4'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Kategorije</div>
              </button>
              <button onClick={() => router.push('/profile')} className="rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10">
                <Gear size={24} weight="bold" style={{color: '#FFB3E6'}} className="mx-auto mb-4" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Profil</div>
              </button>
          </div>
        </div>        {/* Quick Add Buttons */}
        <div className="fixed flex flex-col gap-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8" style={{bottom: '32px'}} data-tour="add-expense">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#6A4DFF] via-[#A54DFF] to-[#FF4DB8] hover:scale-105 transition-all duration-300 flex items-center justify-center group relative"
            style={{boxShadow: '0 4px 16px rgba(255, 77, 184, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)'}}
          >
            <Receipt size={24} weight="bold" style={{color: '#FFFFFF'}} />
            <span className="absolute right-20 bg-[#242236] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
              Dodaj trošak
            </span>
          </button>

          <button
            onClick={() => setShowIncomeModal(true)}
            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#1BD96A] via-[#13C4A3] to-[#0FB2D6] hover:scale-105 transition-all duration-300 flex items-center justify-center group relative"
            style={{boxShadow: '0 4px 16px rgba(19, 196, 163, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)'}}
          >
            <CurrencyCircleDollar size={24} weight="bold" style={{color: '#FFFFFF'}} />
            <span className="absolute right-20 bg-[#242236] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
              Dodaj prihod
            </span>
          </button>
        </div>        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowExpenseModal(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Dodaj trošak</h2>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Račun / Receipt</label>
                  <ReceiptUploader
                    categories={categories}
                    onUploadComplete={(data) => {
                      if (data.amount) setExpAmount(data.amount.toString());
                      if (data.date) setExpDate(data.date);
                      if (data.description) setExpDescription(data.description);
                      if (data.categoryId) setExpCategoryId(data.categoryId);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv troška *</label>
                  <input type="text" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} placeholder="npr. Kupovina..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                    <select value={expCurrency} onChange={(e) => setExpCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}>
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                  <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  {!expCategoryId && (
                    <p className="text-xs mb-3" style={{color: '#7A7A8C'}}>Izaberi kategoriju troška</p>
                  )}
                  <CategorySelector
                    categories={categories}
                    selectedId={expCategoryId}
                    onSelect={setExpCategoryId}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena</label>
                  <textarea value={expNote} onChange={(e) => setExpNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>

                {/* Recurring Section */}
                <div className="rounded-xl p-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setExpIsRecurring(!expIsRecurring)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                      style={{background: expIsRecurring ? '#9F70FF' : 'rgba(159, 112, 255, 0.2)'}}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                        style={{transform: expIsRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                      />
                    </button>
                    <label className="text-sm font-medium text-white cursor-pointer" onClick={() => setExpIsRecurring(!expIsRecurring)}>
                      Ponavlja se
                    </label>
                  </div>

                  {expIsRecurring && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                        <select
                          value={expRecurringType}
                          onChange={(e) => setExpRecurringType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#9F70FF] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        >
                          <option value="monthly">Mesečno</option>
                          <option value="weekly">Nedeljno</option>
                          <option value="yearly">Godišnje</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Sledeće ponavljanje</label>
                        <input
                          type="date"
                          value={expNextRecurringDate}
                          onChange={(e) => setExpNextRecurringDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#9F70FF] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}>Otkaži</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white" style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)'}}>Dodaj</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowIncomeModal(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Dodaj prihod</h2>
              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv prihoda *</label>
                  <input type="text" value={incDescription} onChange={(e) => setIncDescription(e.target.value)} placeholder="npr. Plata..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input type="number" step="0.01" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                    <select value={incCurrency} onChange={(e) => setIncCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}>
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                  <input type="date" value={incDate} onChange={(e) => setIncDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  {!incCategoryId && (
                    <p className="text-xs mb-3" style={{color: '#7A7A8C'}}>Izaberi kategoriju prihoda</p>
                  )}
                  <CategorySelector
                    categories={incomeCategories}
                    selectedId={incCategoryId}
                    onSelect={setIncCategoryId}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Otplata zajma</label>
                  <input type="number" step="0.01" value={incLoanRepayment} onChange={(e) => setIncLoanRepayment(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena</label>
                  <textarea value={incNote} onChange={(e) => setIncNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>

                {/* Recurring Section */}
                <div className="rounded-xl p-4" style={{background: 'rgba(69, 211, 138, 0.05)', border: '1px solid rgba(69, 211, 138, 0.15)'}}>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setIncIsRecurring(!incIsRecurring)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                      style={{background: incIsRecurring ? '#45D38A' : 'rgba(69, 211, 138, 0.2)'}}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                        style={{transform: incIsRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                      />
                    </button>
                    <label className="text-sm font-medium text-white cursor-pointer" onClick={() => setIncIsRecurring(!incIsRecurring)}>
                      Ponavlja se
                    </label>
                  </div>

                  {incIsRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4">
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                        <select
                          value={incRecurringType}
                          onChange={(e) => setIncRecurringType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        >
                          <option value="monthly">Mesečno</option>
                          <option value="weekly">Nedeljno</option>
                          <option value="yearly">Godišnje</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Sledeće ponavljanje</label>
                        <input
                          type="date"
                          value={incNextRecurringDate}
                          onChange={(e) => setIncNextRecurringDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}>Otkaži</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white" style={{background: 'linear-gradient(135deg, #45D38A, #2ECC71)'}}>Dodaj</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {showEditExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditExpenseModal(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowEditExpenseModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Izmeni trošak</h2>
              <form onSubmit={handleUpdateExpense} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv troška *</label>
                  <input type="text" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} placeholder="npr. Kupovina..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                    <select value={expCurrency} onChange={(e) => setExpCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}>
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                  <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  <CategorySelector
                    categories={categories}
                    selectedId={expCategoryId}
                    onSelect={setExpCategoryId}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena</label>
                  <textarea value={expNote} onChange={(e) => setExpNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>

                {/* Recurring Section */}
                <div className="rounded-xl p-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setExpIsRecurring(!expIsRecurring)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                      style={{background: expIsRecurring ? '#9F70FF' : 'rgba(159, 112, 255, 0.2)'}}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                        style={{transform: expIsRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                      />
                    </button>
                    <label className="text-sm font-medium text-white cursor-pointer" onClick={() => setExpIsRecurring(!expIsRecurring)}>
                      Ponavlja se
                    </label>
                  </div>

                  {expIsRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4">
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                        <select
                          value={expRecurringType}
                          onChange={(e) => setExpRecurringType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#9F70FF] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        >
                          <option value="monthly">Mesečno</option>
                          <option value="weekly">Nedeljno</option>
                          <option value="yearly">Godišnje</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Sledeće ponavljanje</label>
                        <input
                          type="date"
                          value={expNextRecurringDate}
                          onChange={(e) => setExpNextRecurringDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#9F70FF] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={handleCancelEditExpense} className="flex-1 py-3 rounded-xl font-semibold" style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}>Otkaži</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white" style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)'}}>Sačuvaj</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Income Modal */}
        {showEditIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditIncomeModal(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowEditIncomeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Izmeni prihod</h2>
              <form onSubmit={handleUpdateIncome} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv prihoda *</label>
                  <input type="text" value={incDescription} onChange={(e) => setIncDescription(e.target.value)} placeholder="npr. Plata..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input type="number" step="0.01" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                    <select value={incCurrency} onChange={(e) => setIncCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}>
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                  <input type="date" value={incDate} onChange={(e) => setIncDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  <CategorySelector
                    categories={incomeCategories}
                    selectedId={incCategoryId}
                    onSelect={setIncCategoryId}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Otplata zajma</label>
                  <input type="number" step="0.01" value={incLoanRepayment} onChange={(e) => setIncLoanRepayment(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena</label>
                  <textarea value={incNote} onChange={(e) => setIncNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
                </div>

                {/* Recurring Section */}
                <div className="rounded-xl p-4" style={{background: 'rgba(69, 211, 138, 0.05)', border: '1px solid rgba(69, 211, 138, 0.15)'}}>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setIncIsRecurring(!incIsRecurring)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                      style={{background: incIsRecurring ? '#45D38A' : 'rgba(69, 211, 138, 0.2)'}}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                        style={{transform: incIsRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                      />
                    </button>
                    <label className="text-sm font-medium text-white cursor-pointer" onClick={() => setIncIsRecurring(!incIsRecurring)}>
                      Ponavlja se
                    </label>
                  </div>

                  {incIsRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4">
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                        <select
                          value={incRecurringType}
                          onChange={(e) => setIncRecurringType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        >
                          <option value="monthly">Mesečno</option>
                          <option value="weekly">Nedeljno</option>
                          <option value="yearly">Godišnje</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Sledeće ponavljanje</label>
                        <input
                          type="date"
                          value={incNextRecurringDate}
                          onChange={(e) => setIncNextRecurringDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={handleCancelEditIncome} className="flex-1 py-3 rounded-xl font-semibold" style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}>Otkaži</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white" style={{background: 'linear-gradient(135deg, #45D38A, #2ECC71)'}}>Sačuvaj</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recurring Items Modal */}
        {currentRecurringItem && (
          <RecurringModal
            item={currentRecurringItem}
            onSave={handleRecurringSave}
            onPostpone={handleRecurringPostpone}
            onCancel={handleRecurringCancel}
            onDisableRecurring={handleRecurringDisable}
          />
        )}

        {/* Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal
            userName={user.name}
            onComplete={() => setShowOnboarding(false)}
          />
        )}

        {/* AI Insights Popup */}
        <AIInsightsPopup 
          isOpen={showAIPopup} 
          onClose={() => setShowAIPopup(false)}
          autoShowOnLogin={aiAutoShow}
        />

        {/* Help Button */}
        <HelpButton page="dashboard" />
      </div>
    </div>
  )
}
