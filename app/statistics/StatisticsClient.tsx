"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendUp, TrendDown, Wallet, ChartLine, ChartPie, ChartBar, CaretLeft, CaretRight } from "phosphor-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getIcon } from "@/lib/iconMapping"
import HelpButton from "@/components/HelpButton"

interface MonthlyStats {
  totalExpenses: number
  totalIncomes: number
  balance: number
}

interface MonthlyData {
  month: string
  incomes: number
  expenses: number
  balance: number
}

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
  [key: string]: string | number
}

interface TopExpense {
  id: number
  description: string
  amount: number
  category: string
  icon: string
  date: string
}

type User = {
  id: string
  name: string
  email: string
}

export default function StatisticsClient({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<MonthlyStats>({ totalExpenses: 0, totalIncomes: 0, balance: 0 })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([])
  const [incomeCategories, setIncomeCategories] = useState<CategoryData[]>([])
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([])
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([])
  const [averages, setAverages] = useState({ expenses: 0, incomes: 0 })
  
  // Additional statistics
  const [hourlyExpenses, setHourlyExpenses] = useState<any[]>([])
  const [last30Days, setLast30Days] = useState<any[]>([])
  const [consistentCategories, setConsistentCategories] = useState<any[]>([])
  const [categoryGrowth, setCategoryGrowth] = useState<any[]>([])
  const [monthsInProfit, setMonthsInProfit] = useState(0)
  const [weekdayExpenses, setWeekdayExpenses] = useState<any[]>([])
  
  // YoY comparison data
  const [yoyData, setYoyData] = useState({
    currentYearTotal: 0,
    previousYearTotal: 0,
    percentageChange: 0,
    monthlyTrend: [] as number[]
  })
  
  // MoM comparison data
  const [momData, setMomData] = useState({
    currentMonthExpenses: 0,
    previousMonthExpenses: 0,
    expensesChange: 0,
    currentMonthIncomes: 0,
    previousMonthIncomes: 0,
    incomesChange: 0,
    currentMonthBalance: 0,
    previousMonthBalance: 0,
    balanceChange: 0,
    monthlyTrend: [] as {expenses: number, incomes: number, balance: number}[]
  })
  
  // Custom period data
  const [customPeriodData, setCustomPeriodData] = useState({
    expenses: 0,
    incomes: 0,
    balance: 0,
    expensesChange: 0,
    incomesChange: 0,
    balanceChange: 0,
    hasComparison: false
  })
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Category insights
  const [biggestCategoryChange, setBiggestCategoryChange] = useState({
    categoryName: '',
    percentageChange: 0,
    type: 'YoY' as 'YoY' | 'MoM'
  })

  const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        console.log('📊 Starting statistics load...')
        await fetchStatistics()
        console.log('✓ fetchStatistics done')
        await fetchYoYComparison()
        console.log('✓ fetchYoYComparison done')
        await fetchMoMComparison()
        console.log('✓ fetchMoMComparison done')
        await fetchBiggestCategoryChange()
        console.log('✓ fetchBiggestCategoryChange done')
      } catch (error) {
        console.error('❌ Error loading statistics:', error)
      } finally {
        console.log('✓ Loading complete, setting loading to false')
        setLoading(false)
      }
    }
    loadData()
  }, [currentMonth, currentYear])

  const fetchStatistics = async () => {
    try {
      console.log('📊 Fetching expenses and incomes...')
      // Fetch current month stats
      const expensesRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear}`)
      const incomesRes = await fetch(`/api/incomes?month=${currentMonth}&year=${currentYear}`)
      
      console.log('API responses:', { expensesOk: expensesRes.ok, incomesOk: incomesRes.ok })
      
      if (!expensesRes.ok || !incomesRes.ok) {
        // If unauthorized, redirect to login
        if (expensesRes.status === 401 || incomesRes.status === 401) {
          console.log('❌ Unauthorized, redirecting to login')
          router.push('/login')
          return
        }
        console.error('❌ Failed to fetch data', { 
          expensesStatus: expensesRes.status, 
          incomesStatus: incomesRes.status 
        })
        return
      }
      
      const expensesData = await expensesRes.json()
      const incomesData = await incomesRes.json()
      
      console.log('✓ Data fetched:', { 
        expenses: expensesData.length, 
        incomes: incomesData.length 
      })

      const totalExpenses = expensesData.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const totalIncomes = incomesData.reduce((sum: number, inc: any) => sum + inc.amount, 0)
      
      setStats({
        totalExpenses,
        totalIncomes,
        balance: totalIncomes - totalExpenses
      })

      // Fetch ALL expenses and incomes once (much faster than 12 separate calls)
      const allExpensesRes = await fetch('/api/expenses')
      const allIncomesRes = await fetch('/api/incomes')
      
      const allExpenses = allExpensesRes.ok ? await allExpensesRes.json() : []
      const allIncomes = allIncomesRes.ok ? await allIncomesRes.json() : []
      
      // Group by month for last 12 months
      const monthsData: MonthlyData[] = []
      let totalExpSum = 0
      let totalIncSum = 0
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1)
        const m = date.getMonth() + 1
        const y = date.getFullYear()
        
        // Filter client-side
        const exp = allExpenses.filter((e: any) => {
          const expDate = new Date(e.date)
          return expDate.getMonth() + 1 === m && expDate.getFullYear() === y
        })
        
        const inc = allIncomes.filter((i: any) => {
          const incDate = new Date(i.date)
          return incDate.getMonth() + 1 === m && incDate.getFullYear() === y
        })
        
        const expTotal = exp.reduce((sum: number, e: any) => sum + e.amount, 0)
        const incTotal = inc.reduce((sum: number, i: any) => sum + i.amount, 0)
        
        totalExpSum += expTotal
        totalIncSum += incTotal
        
        monthsData.push({
          month: monthNames[m - 1].substring(0, 3),
          expenses: expTotal,
          incomes: incTotal,
          balance: incTotal - expTotal
        })
      }
      
      setMonthlyData(monthsData)
      setAverages({ expenses: totalExpSum / 12, incomes: totalIncSum / 12 })

      // Expense categories with monochromatic pink palette
      const pinkPalette = ['#FFB3E1', '#FF8FD7', '#FF6BCB', '#FF4FBF']
      const expCat = expensesData.reduce((acc: any, exp: any) => {
        const categoryName = exp.category?.name || 'Ostalo'
        const categoryIcon = exp.category?.icon || 'Question'
        const existing = acc.find((c: any) => c.name === categoryName)
        if (existing) {
          existing.value += exp.amount
        } else {
          const colorIndex = acc.length % pinkPalette.length
          acc.push({ name: categoryName, value: exp.amount, color: pinkPalette[colorIndex], icon: categoryIcon })
        }
        return acc
      }, [])
      setExpenseCategories(expCat)

      // Income categories with monochromatic teal/green palette
      const tealPalette = ['#A0FFE0', '#79F5CC', '#55E9BB', '#2FDDA9']
      const incCat = incomesData.reduce((acc: any, inc: any) => {
        const categoryName = inc.category?.name || 'Ostalo'
        const categoryIcon = inc.category?.icon || 'Question'
        const existing = acc.find((c: any) => c.name === categoryName)
        if (existing) {
          existing.value += inc.amount
        } else {
          const colorIndex = acc.length % tealPalette.length
          acc.push({ name: categoryName, value: inc.amount, color: tealPalette[colorIndex], icon: categoryIcon })
        }
        return acc
      }, [])
      setIncomeCategories(incCat)

      // Daily expenses for bar chart
      const dailyMap = expensesData.reduce((acc: any, exp: any) => {
        const day = new Date(exp.date).getDate()
        if (!acc[day]) acc[day] = 0
        acc[day] += exp.amount
        return acc
      }, {})
      
      const dailyArray = Object.keys(dailyMap).map(day => ({
        day: `${day}.`,
        amount: dailyMap[day]
      })).sort((a, b) => parseInt(a.day) - parseInt(b.day))
      
      setDailyExpenses(dailyArray)

      // Top 5 expenses
      const top = expensesData
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 5)
        .map((exp: any) => ({
          id: exp.id,
          description: exp.description,
          amount: exp.amount,
          currency: exp.currency || 'RSD',
          category: exp.category?.name || 'Ostalo',
          icon: exp.category?.icon || 'Question',
          date: new Date(exp.date).toLocaleDateString('sr-RS')
        }))
      
      setTopExpenses(top)

      // Additional Statistics
      await fetchAdditionalStatistics(expensesData, incomesData)

    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const fetchAdditionalStatistics = async (expensesData: any[], incomesData: any[]) => {
    // 1. Hourly expenses
    const hourlyMap = expensesData.reduce((acc: any, exp: any) => {
      const hour = new Date(exp.createdAt || exp.date).getHours()
      if (!acc[hour]) acc[hour] = 0
      acc[hour] += exp.amount
      return acc
    }, {})
    const hourlyArray = Array.from({length: 24}, (_, i) => ({
      hour: `${i}h`,
      amount: hourlyMap[i] || 0
    }))
    setHourlyExpenses(hourlyArray)

    // 2. Last 30 days flow
    const last30DaysData = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayExpenses = expensesData.filter(e => e.date.startsWith(dateStr)).reduce((sum, e) => sum + e.amount, 0)
      const dayIncomes = incomesData.filter(e => e.date.startsWith(dateStr)).reduce((sum, e) => sum + e.amount, 0)
      
      last30DaysData.push({
        date: `${date.getDate()}.${date.getMonth() + 1}`,
        expenses: dayExpenses,
        incomes: dayIncomes
      })
    }
    setLast30Days(last30DaysData)

    // 3. Consistent categories (appearing in multiple months)
    const categoryMonths: any = {}
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const m = date.getMonth() + 1
      const y = date.getFullYear()
      
      const expRes = await fetch(`/api/expenses?month=${m}&year=${y}`)
      const exp = expRes.ok ? await expRes.json() : []
      
      exp.forEach((e: any) => {
        const catName = e.category?.name || 'Ostalo'
        if (!categoryMonths[catName]) categoryMonths[catName] = new Set()
        categoryMonths[catName].add(`${y}-${m}`)
      })
    }
    
    const consistent = Object.entries(categoryMonths)
      .map(([name, months]: any) => ({ name, months: months.size }))
      .filter(c => c.months >= 3)
      .sort((a, b) => b.months - a.months)
      .slice(0, 5)
    setConsistentCategories(consistent)

    // 4. Category growth
    const growth: any = {}
    const categoryLast6: any = {}
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const m = date.getMonth() + 1
      const y = date.getFullYear()
      
      const expRes = await fetch(`/api/expenses?month=${m}&year=${y}`)
      const exp = expRes.ok ? await expRes.json() : []
      
      exp.forEach((e: any) => {
        const catName = e.category?.name || 'Ostalo'
        if (!categoryLast6[catName]) categoryLast6[catName] = []
        categoryLast6[catName].push(e.amount)
      })
    }
    
    Object.keys(categoryLast6).forEach(cat => {
      const amounts = categoryLast6[cat]
      if (amounts.length >= 2) {
        const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2)).reduce((a: number, b: number) => a + b, 0)
        const secondHalf = amounts.slice(Math.floor(amounts.length / 2)).reduce((a: number, b: number) => a + b, 0)
        const growthPercent = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0
        growth[cat] = growthPercent
      }
    })
    
    const growthArray = Object.entries(growth)
      .map(([name, percent]: any) => ({ name, growth: Math.round(percent) }))
      .sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth))
      .slice(0, 6)
    setCategoryGrowth(growthArray)

    // 5. Months in profit
    let profitCount = 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const m = date.getMonth() + 1
      const y = date.getFullYear()
      
      const expRes = await fetch(`/api/expenses?month=${m}&year=${y}`)
      const incRes = await fetch(`/api/incomes?month=${m}&year=${y}`)
      
      const exp = expRes.ok ? await expRes.json() : []
      const inc = incRes.ok ? await incRes.json() : []
      
      const expTotal = exp.reduce((sum: number, e: any) => sum + e.amount, 0)
      const incTotal = inc.reduce((sum: number, i: any) => sum + i.amount, 0)
      
      if (incTotal > expTotal) profitCount++
    }
    setMonthsInProfit(profitCount)

    // 6. Weekday heatmap
    const weekdayMap: any = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    expensesData.forEach(exp => {
      const day = new Date(exp.date).getDay()
      weekdayMap[day] += exp.amount
    })
    
    const weekdayArray = Object.keys(weekdayMap).map(day => ({
      day: dayNames[parseInt(day)],
      amount: weekdayMap[day]
    }))
    setWeekdayExpenses(weekdayArray)
  }

  const fetchYoYComparison = async () => {
    try {
      // Fetch current year data (same month, current year)
      const currentYearRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear}`)
      const currentYearData = currentYearRes.ok ? await currentYearRes.json() : []
      const currentYearTotal = currentYearData.reduce((sum: number, exp: any) => sum + exp.amount, 0)

      // Fetch previous year data (same month, previous year)
      const previousYearRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear - 1}`)
      const previousYearData = previousYearRes.ok ? await previousYearRes.json() : []
      const previousYearTotal = previousYearData.reduce((sum: number, exp: any) => sum + exp.amount, 0)

      // Calculate percentage change
      const percentageChange = previousYearTotal === 0 
        ? 0 
        : ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100

      // Fetch monthly trend for sparkline (last 12 months)
      const monthlyTrend: number[] = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1)
        const m = date.getMonth() + 1
        const y = date.getFullYear()
        
        const expRes = await fetch(`/api/expenses?month=${m}&year=${y}`)
        const exp = expRes.ok ? await expRes.json() : []
        const total = exp.reduce((sum: number, e: any) => sum + e.amount, 0)
        monthlyTrend.push(total)
      }

      setYoyData({
        currentYearTotal,
        previousYearTotal,
        percentageChange,
        monthlyTrend
      })
    } catch (error) {
      console.error('Error fetching YoY data:', error)
    }
  }

  const fetchMoMComparison = async () => {
    try {
      // Fetch current month data
      const currentExpRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear}`)
      const currentIncRes = await fetch(`/api/incomes?month=${currentMonth}&year=${currentYear}`)
      const currentExpData = currentExpRes.ok ? await currentExpRes.json() : []
      const currentIncData = currentIncRes.ok ? await currentIncRes.json() : []
      
      const currentMonthExpenses = currentExpData.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const currentMonthIncomes = currentIncData.reduce((sum: number, inc: any) => sum + inc.amount, 0)
      const currentMonthBalance = currentMonthIncomes - currentMonthExpenses

      // Calculate previous month
      let prevMonth = currentMonth - 1
      let prevYear = currentYear
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear = currentYear - 1
      }

      // Fetch previous month data
      const prevExpRes = await fetch(`/api/expenses?month=${prevMonth}&year=${prevYear}`)
      const prevIncRes = await fetch(`/api/incomes?month=${prevMonth}&year=${prevYear}`)
      const prevExpData = prevExpRes.ok ? await prevExpRes.json() : []
      const prevIncData = prevIncRes.ok ? await prevIncRes.json() : []
      
      const previousMonthExpenses = prevExpData.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const previousMonthIncomes = prevIncData.reduce((sum: number, inc: any) => sum + inc.amount, 0)
      const previousMonthBalance = previousMonthIncomes - previousMonthExpenses

      // Calculate percentage changes
      const expensesChange = previousMonthExpenses === 0 
        ? 0 
        : ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      
      const incomesChange = previousMonthIncomes === 0 
        ? 0 
        : ((currentMonthIncomes - previousMonthIncomes) / previousMonthIncomes) * 100
      
      const balanceChange = previousMonthBalance === 0 
        ? 0 
        : ((currentMonthBalance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100

      // Fetch monthly trend for sparkline (last 6 months)
      const monthlyTrend: {expenses: number, incomes: number, balance: number}[] = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1)
        const m = date.getMonth() + 1
        const y = date.getFullYear()
        
        const expRes = await fetch(`/api/expenses?month=${m}&year=${y}`)
        const incRes = await fetch(`/api/incomes?month=${m}&year=${y}`)
        const exp = expRes.ok ? await expRes.json() : []
        const inc = incRes.ok ? await incRes.json() : []
        
        const expTotal = exp.reduce((sum: number, e: any) => sum + e.amount, 0)
        const incTotal = inc.reduce((sum: number, i: any) => sum + i.amount, 0)
        
        monthlyTrend.push({
          expenses: expTotal,
          incomes: incTotal,
          balance: incTotal - expTotal
        })
      }

      setMomData({
        currentMonthExpenses,
        previousMonthExpenses,
        expensesChange,
        currentMonthIncomes,
        previousMonthIncomes,
        incomesChange,
        currentMonthBalance,
        previousMonthBalance,
        balanceChange,
        monthlyTrend
      })
    } catch (error) {
      console.error('Error fetching MoM data:', error)
    }
  }

  const fetchCustomPeriodData = async () => {
    if (!startDate || !endDate) {
      return
    }

    try {
      // Fetch all expenses and incomes (we'll filter by date range)
      const allExpensesRes = await fetch('/api/expenses')
      const allIncomesRes = await fetch('/api/incomes')
      const allExpenses = allExpensesRes.ok ? await allExpensesRes.json() : []
      const allIncomes = allIncomesRes.ok ? await allIncomesRes.json() : []

      // Filter by date range
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const filteredExpenses = allExpenses.filter((exp: any) => {
        const expDate = new Date(exp.date)
        return expDate >= start && expDate <= end
      })
      
      const filteredIncomes = allIncomes.filter((inc: any) => {
        const incDate = new Date(inc.date)
        return incDate >= start && incDate <= end
      })

      const expenses = filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const incomes = filteredIncomes.reduce((sum: number, inc: any) => sum + inc.amount, 0)
      const balance = incomes - expenses

      // Calculate comparison with previous period of same length
      const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const prevStart = new Date(start)
      prevStart.setDate(prevStart.getDate() - periodLength)
      const prevEnd = new Date(start)
      prevEnd.setDate(prevEnd.getDate() - 1)

      const prevExpenses = allExpenses.filter((exp: any) => {
        const expDate = new Date(exp.date)
        return expDate >= prevStart && expDate <= prevEnd
      })
      
      const prevIncomes = allIncomes.filter((inc: any) => {
        const incDate = new Date(inc.date)
        return incDate >= prevStart && incDate <= prevEnd
      })

      const prevExpensesTotal = prevExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const prevIncomesTotal = prevIncomes.reduce((sum: number, inc: any) => sum + inc.amount, 0)
      const prevBalance = prevIncomesTotal - prevExpensesTotal

      // Calculate percentage changes
      const expensesChange = prevExpensesTotal === 0 
        ? 0 
        : ((expenses - prevExpensesTotal) / prevExpensesTotal) * 100
      
      const incomesChange = prevIncomesTotal === 0 
        ? 0 
        : ((incomes - prevIncomesTotal) / prevIncomesTotal) * 100
      
      const balanceChange = prevBalance === 0 
        ? 0 
        : ((balance - prevBalance) / Math.abs(prevBalance)) * 100

      setCustomPeriodData({
        expenses,
        incomes,
        balance,
        expensesChange,
        incomesChange,
        balanceChange,
        hasComparison: true
      })
    } catch (error) {
      console.error('Error fetching custom period data:', error)
    }
  }

  const fetchBiggestCategoryChange = async () => {
    try {
      // Fetch current month expenses by category
      const currentExpRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear}`)
      const currentExpData = currentExpRes.ok ? await currentExpRes.json() : []
      
      // Calculate previous month
      let prevMonth = currentMonth - 1
      let prevYear = currentYear
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear = currentYear - 1
      }
      
      // Fetch previous month expenses by category
      const prevExpRes = await fetch(`/api/expenses?month=${prevMonth}&year=${prevYear}`)
      const prevExpData = prevExpRes.ok ? await prevExpRes.json() : []
      
      // Group by category for current month
      const currentCategories: any = {}
      currentExpData.forEach((exp: any) => {
        const catName = exp.category?.name || 'Ostalo'
        currentCategories[catName] = (currentCategories[catName] || 0) + exp.amount
      })
      
      // Group by category for previous month (MoM)
      const prevCategoriesMoM: any = {}
      prevExpData.forEach((exp: any) => {
        const catName = exp.category?.name || 'Ostalo'
        prevCategoriesMoM[catName] = (prevCategoriesMoM[catName] || 0) + exp.amount
      })
      
      // Fetch previous year data (YoY)
      const prevYearExpRes = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear - 1}`)
      const prevYearExpData = prevYearExpRes.ok ? await prevYearExpRes.json() : []
      
      // Group by category for previous year (YoY)
      const prevCategoriesYoY: any = {}
      prevYearExpData.forEach((exp: any) => {
        const catName = exp.category?.name || 'Ostalo'
        prevCategoriesYoY[catName] = (prevCategoriesYoY[catName] || 0) + exp.amount
      })
      
      // Calculate MoM changes
      let biggestMoMChange = { category: '', change: 0 }
      Object.keys(currentCategories).forEach(catName => {
        const current = currentCategories[catName]
        const prev = prevCategoriesMoM[catName] || 0
        if (prev > 0) {
          const change = ((current - prev) / prev) * 100
          if (Math.abs(change) > Math.abs(biggestMoMChange.change)) {
            biggestMoMChange = { category: catName, change }
          }
        }
      })
      
      // Calculate YoY changes
      let biggestYoYChange = { category: '', change: 0 }
      Object.keys(currentCategories).forEach(catName => {
        const current = currentCategories[catName]
        const prev = prevCategoriesYoY[catName] || 0
        if (prev > 0) {
          const change = ((current - prev) / prev) * 100
          if (Math.abs(change) > Math.abs(biggestYoYChange.change)) {
            biggestYoYChange = { category: catName, change }
          }
        }
      })
      
      // Choose the bigger change between MoM and YoY
      if (Math.abs(biggestMoMChange.change) > Math.abs(biggestYoYChange.change)) {
        setBiggestCategoryChange({
          categoryName: biggestMoMChange.category,
          percentageChange: biggestMoMChange.change,
          type: 'MoM'
        })
      } else {
        setBiggestCategoryChange({
          categoryName: biggestYoYChange.category,
          percentageChange: biggestYoYChange.change,
          type: 'YoY'
        })
      }
    } catch (error) {
      console.error('Error fetching biggest category change:', error)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      fetchCustomPeriodData()
    }
  }, [startDate, endDate])

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl" style={{color: '#A5A4B6'}}>Učitavanje...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-10 lg:px-14 mt-10 mb-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-fintech-gradient bg-clip-text text-transparent">
            Statistika
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-2xl font-semibold backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            style={{background: 'rgba(255, 255, 255, 0.05)', color: '#B8B7C5'}}
          >
            <ArrowLeft size={20} weight="bold" />
            Nazad
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <button onClick={goToPreviousMonth} className="p-3 rounded-full hover:bg-white/10 transition-all">
            <CaretLeft size={24} weight="bold" style={{color: '#B8B7C5'}} />
          </button>
          <h2 className="text-2xl font-semibold" style={{color: '#E8E7F5'}}>
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>
          <button onClick={goToNextMonth} className="p-3 rounded-full hover:bg-white/10 transition-all">
            <CaretRight size={24} weight="bold" style={{color: '#B8B7C5'}} />
          </button>
        </div>

        {/* Monthly Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {/* Expenses Card */}
          <div className="rounded-2xl p-6 backdrop-blur-md border hover:scale-[1.02] transition-all duration-300" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <TrendDown size={20} weight="bold" style={{color: '#FFB3E6'}} className="mb-4" />
            <div className="text-sm font-semibold mb-1" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>
              Troškovi ovaj mesec
            </div>
            <div className="text-2xl font-bold" style={{color: '#FFB3E6', fontFamily: '"Inter", sans-serif'}}>
              {stats.totalExpenses.toLocaleString('sr-RS')} <span style={{fontSize: '0.75em', opacity: 0.7}}>RSD</span>
            </div>
          </div>

          {/* Incomes Card */}
          <div className="rounded-2xl p-6 backdrop-blur-md border hover:scale-[1.02] transition-all duration-300" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <TrendUp size={20} weight="bold" style={{color: '#6FFFC4'}} className="mb-4" />
            <div className="text-sm font-semibold mb-1" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>
              Prihodi ovaj mesec
            </div>
            <div className="text-2xl font-bold" style={{color: '#6FFFC4', fontFamily: '"Inter", sans-serif'}}>
              {stats.totalIncomes.toLocaleString('sr-RS')} <span style={{fontSize: '0.75em', opacity: 0.7}}>RSD</span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="rounded-2xl p-6 backdrop-blur-md border hover:scale-[1.02] transition-all duration-300" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <Wallet size={20} weight="bold" style={{color: '#7FDFFF'}} className="mb-4" />
            <div className="text-sm font-semibold mb-1" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>
              Bilans ovaj mesec
            </div>
            <div className="text-2xl font-bold" style={{color: '#7FDFFF', fontFamily: '"Inter", sans-serif'}}>
              {stats.balance.toLocaleString('sr-RS')} <span style={{fontSize: '0.75em', opacity: 0.7}}>RSD</span>
            </div>
          </div>
        </div>

        {/* Uporedna analiza */}
        <div className="rounded-2xl backdrop-blur-md p-6 mb-8 flex flex-col gap-6 border" 
             style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
          <h3 className="text-[15px] font-medium text-white" style={{fontFamily: '"Inter", sans-serif'}}>
            Uporedna analiza
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Godina na godinu (YoY) */}
            <div className="rounded-2xl backdrop-blur-sm p-5 flex flex-col gap-3 border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <h4 className="text-sm font-medium mb-2 text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                Godina na godinu (YoY)
              </h4>
              
              {/* Current Year */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>
                  {monthNames[currentMonth - 1]} {currentYear}
                </span>
                <span className="text-sm font-semibold text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                  {yoyData.currentYearTotal.toLocaleString('sr-RS')} RSD
                </span>
              </div>

              {/* Previous Year */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>
                  {monthNames[currentMonth - 1]} {currentYear - 1}
                </span>
                <span className="text-sm font-semibold text-white/50" style={{fontFamily: '"Inter", sans-serif'}}>
                  {yoyData.previousYearTotal.toLocaleString('sr-RS')} RSD
                </span>
              </div>

              {/* Percentage Change with Arrow */}
              <div className="flex items-center gap-2 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                {yoyData.percentageChange > 0 ? (
                  <>
                    <TrendUp size={16} weight="bold" style={{color: '#FFB3E6'}} />
                    <span className="text-xs font-medium" style={{color: '#FFB3E6'}}>
                      +{Math.abs(yoyData.percentageChange).toFixed(1)}%
                    </span>
                  </>
                ) : yoyData.percentageChange < 0 ? (
                  <>
                    <TrendDown size={16} weight="bold" style={{color: '#6FFFC4'}} />
                    <span className="text-xs font-medium" style={{color: '#6FFFC4'}}>
                      {yoyData.percentageChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>
                    0%
                  </span>
                )}
                <span className="text-xs ml-auto text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>
                  {yoyData.percentageChange > 0 ? 'porast' : yoyData.percentageChange < 0 ? 'pad' : 'bez promene'}
                </span>
              </div>

              {/* Sparkline - Mini Trend Chart */}
              <div className="mt-2 w-full" style={{height: '40px'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yoyData.monthlyTrend.map((value, index) => ({ value }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#FFB3E6" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mesec na mesec (MoM) */}
            <div className="rounded-2xl backdrop-blur-sm p-5 flex flex-col gap-3 border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <h4 className="text-sm font-medium mb-2 text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                Mesec na mesec (MoM)
              </h4>
              
              {/* Expenses Comparison */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Troškovi</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{color: momData.expensesChange > 0 ? '#FFB3E6' : momData.expensesChange < 0 ? '#6FFFC4' : '#8B8A9A'}}>
                      {momData.expensesChange > 0 ? '+' : ''}{momData.expensesChange.toFixed(1)}%
                    </span>
                    {momData.expensesChange > 0 ? (
                      <TrendUp size={14} weight="bold" style={{color: '#FFB3E6'}} />
                    ) : momData.expensesChange < 0 ? (
                      <TrendDown size={14} weight="bold" style={{color: '#6FFFC4'}} />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70" style={{fontFamily: '"Inter", sans-serif'}}>{momData.currentMonthExpenses.toLocaleString('sr-RS')}</span>
                  <span className="text-white/50" style={{fontFamily: '"Inter", sans-serif'}}>vs {momData.previousMonthExpenses.toLocaleString('sr-RS')}</span>
                </div>
              </div>

              {/* Incomes Comparison */}
              <div className="flex flex-col gap-1 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Prihodi</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{color: momData.incomesChange > 0 ? '#6FFFC4' : momData.incomesChange < 0 ? '#FFB3E6' : '#8B8A9A'}}>
                      {momData.incomesChange > 0 ? '+' : ''}{momData.incomesChange.toFixed(1)}%
                    </span>
                    {momData.incomesChange > 0 ? (
                      <TrendUp size={14} weight="bold" style={{color: '#6FFFC4'}} />
                    ) : momData.incomesChange < 0 ? (
                      <TrendDown size={14} weight="bold" style={{color: '#FFB3E6'}} />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70" style={{fontFamily: '"Inter", sans-serif'}}>{momData.currentMonthIncomes.toLocaleString('sr-RS')}</span>
                  <span className="text-white/50" style={{fontFamily: '"Inter", sans-serif'}}>vs {momData.previousMonthIncomes.toLocaleString('sr-RS')}</span>
                </div>
              </div>

              {/* Balance Comparison */}
              <div className="flex flex-col gap-1 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Bilans</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{color: momData.balanceChange > 0 ? '#6FFFC4' : momData.balanceChange < 0 ? '#FFB3E6' : '#8B8A9A'}}>
                      {momData.balanceChange > 0 ? '+' : ''}{momData.balanceChange.toFixed(1)}%
                    </span>
                    {momData.balanceChange > 0 ? (
                      <TrendUp size={14} weight="bold" style={{color: '#6FFFC4'}} />
                    ) : momData.balanceChange < 0 ? (
                      <TrendDown size={14} weight="bold" style={{color: '#FFB3E6'}} />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70" style={{fontFamily: '"Inter", sans-serif'}}>{momData.currentMonthBalance.toLocaleString('sr-RS')}</span>
                  <span className="text-white/50" style={{fontFamily: '"Inter", sans-serif'}}>vs {momData.previousMonthBalance.toLocaleString('sr-RS')}</span>
                </div>
              </div>

              {/* Sparkline - Mini Trend Chart */}
              <div className="mt-2 w-full" style={{height: '40px'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={momData.monthlyTrend}>
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#FFB3E6" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="incomes" 
                      stroke="#6FFFC4" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Custom period (Od–Do) */}
            <div className="rounded-2xl backdrop-blur-sm p-5 flex flex-col gap-3 border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <h4 className="text-sm font-medium mb-2 text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                Custom period (Od–Do)
              </h4>
              
              {/* Date Pickers */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Od:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg px-3 py-2 text-xs border text-white"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Do:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg px-3 py-2 text-xs border text-white"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  />
                </div>
              </div>

              {/* Results - Show only if dates are selected */}
              {startDate && endDate && customPeriodData.hasComparison && (
                <>
                  {/* Expenses */}
                  <div className="flex flex-col gap-1 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Troškovi</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{color: customPeriodData.expensesChange > 0 ? '#FFB3E6' : customPeriodData.expensesChange < 0 ? '#6FFFC4' : '#8B8A9A'}}>
                          {customPeriodData.expensesChange > 0 ? '+' : ''}{customPeriodData.expensesChange.toFixed(1)}%
                        </span>
                        {customPeriodData.expensesChange > 0 ? (
                          <TrendUp size={14} weight="bold" style={{color: '#FFB3E6'}} />
                        ) : customPeriodData.expensesChange < 0 ? (
                          <TrendDown size={14} weight="bold" style={{color: '#6FFFC4'}} />
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                      {customPeriodData.expenses.toLocaleString('sr-RS')} RSD
                    </div>
                  </div>

                  {/* Incomes */}
                  <div className="flex flex-col gap-1 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Prihodi</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{color: customPeriodData.incomesChange > 0 ? '#6FFFC4' : customPeriodData.incomesChange < 0 ? '#FFB3E6' : '#8B8A9A'}}>
                          {customPeriodData.incomesChange > 0 ? '+' : ''}{customPeriodData.incomesChange.toFixed(1)}%
                        </span>
                        {customPeriodData.incomesChange > 0 ? (
                          <TrendUp size={14} weight="bold" style={{color: '#6FFFC4'}} />
                        ) : customPeriodData.incomesChange < 0 ? (
                          <TrendDown size={14} weight="bold" style={{color: '#FFB3E6'}} />
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                      {customPeriodData.incomes.toLocaleString('sr-RS')} RSD
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex flex-col gap-1 pt-2 border-t" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60" style={{fontFamily: '"Inter", sans-serif'}}>Bilans</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{color: customPeriodData.balanceChange > 0 ? '#6FFFC4' : customPeriodData.balanceChange < 0 ? '#FFB3E6' : '#8B8A9A'}}>
                          {customPeriodData.balanceChange > 0 ? '+' : ''}{customPeriodData.balanceChange.toFixed(1)}%
                        </span>
                        {customPeriodData.balanceChange > 0 ? (
                          <TrendUp size={14} weight="bold" style={{color: '#6FFFC4'}} />
                        ) : customPeriodData.balanceChange < 0 ? (
                          <TrendDown size={14} weight="bold" style={{color: '#FFB3E6'}} />
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs font-semibold" style={{color: customPeriodData.balance >= 0 ? '#6FFFC4' : '#FFB3E6'}}>
                      {customPeriodData.balance.toLocaleString('sr-RS')} RSD
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Insights Bar - Biggest Category Change */}
          {biggestCategoryChange.categoryName && (
            <div className="rounded-2xl backdrop-blur-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6 border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <span className="text-sm text-white/70" style={{fontFamily: '"Inter", sans-serif'}}>
                Najveća razlika je u kategoriji:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white" style={{fontFamily: '"Inter", sans-serif'}}>
                  {biggestCategoryChange.categoryName}
                </span>
                <span className="text-sm font-bold" style={{
                  color: biggestCategoryChange.percentageChange > 0 ? '#FFB3E6' : '#6FFFC4',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  ({biggestCategoryChange.percentageChange > 0 ? '+' : ''}{biggestCategoryChange.percentageChange.toFixed(1)}%)
                </span>
                {biggestCategoryChange.percentageChange > 0 ? (
                  <TrendUp size={16} weight="bold" style={{color: '#FFB3E6'}} />
                ) : (
                  <TrendDown size={16} weight="bold" style={{color: '#6FFFC4'}} />
                )}
                <span className="text-xs px-2 py-1 rounded" style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  {biggestCategoryChange.type}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Line Chart - 12 Month Trend */}
        <div className="rounded-2xl backdrop-blur-md p-6 mb-8 min-h-[360px] border" 
             style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
          <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
            Bilans kroz vreme (12 meseci)
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(50,50,50,0.3)" />
                <XAxis dataKey="month" stroke="#A5A4B6" style={{fontSize: '12px'}} />
                <YAxis stroke="#A5A4B6" style={{fontSize: '12px'}} />
                <Tooltip 
                  contentStyle={{background: '#1A1825', border: 'none', borderRadius: '10px', color: '#FFFFFF'}}
                  formatter={(value: any) => [
                    <span key="value">
                      {Number(value).toLocaleString('sr-RS')} <span style={{fontSize: '0.75em', opacity: 0.7}}>RSD</span>
                    </span>
                  ]}
                />
                <Legend 
                  wrapperStyle={{fontSize: '13px', fontFamily: '"Inter", sans-serif'}}
                  iconType="line"
                />
                <Line type="monotone" dataKey="expenses" stroke="#FFB3E6" strokeWidth={2} name="Troškovi" />
                <Line type="monotone" dataKey="incomes" stroke="#6FFFC4" strokeWidth={2} name="Prihodi" />
                <Line type="monotone" dataKey="balance" stroke="#7FDFFF" strokeWidth={2} name="Bilans" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
          )}
        </div>

        {/* Pie Charts - Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Categories */}
          <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Troškovi po kategorijama</h3>
            {expenseCategories.length > 0 ? (
              <div className="flex items-center gap-6">
                <div style={{width: '240px', height: '240px', flexShrink: 0, position: 'relative'}}>
                  <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 1}}></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} stroke="rgba(18,18,27,0.15)" strokeWidth={1}>
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{background: '#1E1B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF'}} 
                        labelStyle={{color: '#FFFFFF'}}
                        itemStyle={{color: '#FFFFFF'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {expenseCategories.map((cat, idx) => {
                    const Icon = getIcon(cat.icon)
                    const total = expenseCategories.reduce((sum, c) => sum + c.value, 0)
                    const percentage = ((cat.value / total) * 100).toFixed(1)
                    return (
                      <div key={idx} className="flex items-center gap-[1.1rem]">
                        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{background: cat.color}}></div>
                        <div className="p-1.5 rounded-lg flex-shrink-0" style={{background: 'rgba(255,179,230,0.1)'}}>
                          <Icon size={16} weight="bold" style={{color: '#FFB3E6'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.9375rem] font-semibold truncate" style={{color: '#E8E7F5'}}>{cat.name}</div>
                        </div>
                        <div className="text-xs font-bold" style={{color: cat.color}}>{percentage}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
            )}
          </div>

          {/* Income Categories */}
          <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Prihodi po kategorijama</h3>
            {incomeCategories.length > 0 ? (
              <div className="flex items-center gap-6">
                <div style={{width: '240px', height: '240px', flexShrink: 0, position: 'relative'}}>
                  <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 1}}></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={incomeCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} stroke="rgba(18,18,27,0.15)" strokeWidth={1}>
                        {incomeCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{background: '#1E1B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF'}} 
                        labelStyle={{color: '#FFFFFF'}}
                        itemStyle={{color: '#FFFFFF'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {incomeCategories.map((cat, idx) => {
                    const Icon = getIcon(cat.icon)
                    const total = incomeCategories.reduce((sum, c) => sum + c.value, 0)
                    const percentage = ((cat.value / total) * 100).toFixed(1)
                    return (
                      <div key={idx} className="flex items-center gap-[1.1rem]">
                        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{background: cat.color}}></div>
                        <div className="p-1.5 rounded-lg flex-shrink-0" style={{background: 'rgba(111,255,196,0.1)'}}>
                          <Icon size={16} weight="bold" style={{color: '#6FFFC4'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.9375rem] font-semibold truncate" style={{color: '#E8E7F5'}}>{cat.name}</div>
                        </div>
                        <div className="text-xs font-bold" style={{color: cat.color}}>{percentage}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
            )}
          </div>
        </div>

        {/* Bottom Section: Daily Bar Chart + Top 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Expenses Bar Chart */}
          <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <div className="flex items-center gap-3 mb-6">
              <ChartBar size={24} weight="bold" style={{color: '#B794FF'}} />
              <h3 className="text-[15px] font-medium" style={{color: '#FFFFFF'}}>Troškovi po danima</h3>
            </div>
            {dailyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={375}>
                <BarChart data={dailyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(50,50,50,0.3)" />
                  <XAxis dataKey="day" stroke="#A5A4B6" />
                  <YAxis stroke="#A5A4B6" />
                  <Tooltip contentStyle={{background: '#1A1825', border: 'none', borderRadius: '10px', color: '#FFFFFF'}} />
                  <Bar dataKey="amount" fill="#FFB3E6" name="Iznos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
            )}
          </div>

          {/* Top 5 Expenses */}
          <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
               style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
            <div className="flex items-center gap-3 mb-6">
              <TrendDown size={24} weight="bold" style={{color: '#FFB3E6'}} />
              <h3 className="text-[15px] font-medium" style={{color: '#FFFFFF'}}>Top 5 najvećih troškova</h3>
            </div>
            {topExpenses.length > 0 ? (
              <div className="space-y-4">
                {topExpenses.map((exp, idx) => {
                  const Icon = getIcon(exp.icon)
                  return (
                    <div key={exp.id} className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(255,179,230,0.08)'}}>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg flex-shrink-0" 
                           style={{background: 'rgba(255,179,230,0.2)', color: '#FFB3E6'}}>
                        {idx + 1}
                      </div>
                      <div className="p-2 rounded-lg flex-shrink-0" style={{background: 'rgba(255,179,230,0.15)'}}>
                        <Icon size={20} weight="bold" style={{color: '#FFB3E6'}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate" style={{color: '#E8E7F5'}}>{exp.description}</div>
                        <div className="text-sm" style={{color: '#A5A4B6'}}>{exp.category} • {exp.date}</div>
                      </div>
                      <div className="font-bold text-lg flex-shrink-0 text-right" style={{color: '#FFB3E6'}}>
                        {exp.amount.toLocaleString('sr-RS')} {exp.currency || "RSD"}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
            )}
          </div>
        </div>

        {/* Averages - Full Width Card */}
        <div className="rounded-2xl backdrop-blur-md p-6 border" 
             style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
          <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
            Prosečni mesečni troškovi i prihodi (12 meseci)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {/* Prosečni troškovi */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>
                  Prosečni troškovi
                </div>
                <TrendDown size={20} weight="duotone" style={{color: '#FFB3E6'}} />
              </div>
              <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                {averages.expenses.toLocaleString('sr-RS')} <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
              </div>
            </div>
            
            {/* Prosečni prihodi */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>
                  Prosečni prihodi
                </div>
                <TrendUp size={20} weight="duotone" style={{color: '#6FFFC4'}} />
              </div>
              <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                {averages.incomes.toLocaleString('sr-RS')} <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
            Dodatne statistike
          </h2>

          {/* Row 1: Hourly Expenses + Last 30 Days */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hourly Expenses */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Troškovi po satima u danu
              </h3>
              {hourlyExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hourlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(50,50,50,0.3)" />
                    <XAxis dataKey="hour" stroke="#A5A4B6" style={{fontSize: '11px'}} />
                    <YAxis stroke="#A5A4B6" style={{fontSize: '11px'}} />
                    <Tooltip contentStyle={{background: '#1A1825', border: 'none', borderRadius: '10px', color: '#FFFFFF'}} />
                    <Bar dataKey="amount" fill="#B794FF" name="Iznos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
              )}
            </div>

            {/* Last 30 Days Flow */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Priliv i odliv poslednjih 30 dana
              </h3>
              {last30Days.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(50,50,50,0.3)" />
                    <XAxis dataKey="date" stroke="#A5A4B6" style={{fontSize: '10px'}} />
                    <YAxis stroke="#A5A4B6" style={{fontSize: '11px'}} />
                    <Tooltip contentStyle={{background: '#1A1825', border: 'none', borderRadius: '10px', color: '#FFFFFF'}} />
                    <Legend wrapperStyle={{fontSize: '12px', fontFamily: '"Inter", sans-serif'}} iconType="line" />
                    <Line type="monotone" dataKey="expenses" stroke="#FFB3E6" strokeWidth={2} name="Troškovi" dot={false} />
                    <Line type="monotone" dataKey="incomes" stroke="#6FFFC4" strokeWidth={2} name="Prihodi" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
              )}
            </div>
          </div>

          {/* Row 2: Consistent Categories + Category Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Consistent Categories */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Najkonzistentnije kategorije
              </h3>
              {consistentCategories.length > 0 ? (
                <div className="space-y-3">
                  {consistentCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl" style={{background: 'rgba(183,148,255,0.08)'}}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                             style={{background: 'rgba(183,148,255,0.2)', color: '#B794FF'}}>
                          {idx + 1}
                        </div>
                        <span className="font-semibold" style={{color: '#E8E7F5'}}>{cat.name}</span>
                      </div>
                      <div className="text-sm font-bold" style={{color: '#B794FF'}}>
                        {cat.months}/12 meseci
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
              )}
            </div>

            {/* Category Growth */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[360px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Rast kategorija (poslednjih 6 meseci)
              </h3>
              {categoryGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryGrowth} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(50,50,50,0.3)" />
                    <XAxis type="number" stroke="#A5A4B6" style={{fontSize: '11px'}} />
                    <YAxis dataKey="name" type="category" stroke="#A5A4B6" style={{fontSize: '11px'}} width={100} />
                    <Tooltip contentStyle={{background: '#1A1825', border: 'none', borderRadius: '10px', color: '#FFFFFF'}} />
                    <Bar dataKey="growth" fill="#7FDFFF" name="Rast %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
              )}
            </div>
          </div>

          {/* Row 3: Months in Profit + Weekday Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Months in Profit */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[200px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Meseci u plusu (poslednjih 12)
              </h3>
              <div className="flex items-center justify-center" style={{height: '120px'}}>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2" style={{color: monthsInProfit >= 6 ? '#6FFFC4' : '#FFB3E6'}}>
                    {monthsInProfit}
                  </div>
                  <div className="text-sm" style={{color: '#A5A4B6'}}>
                    od 12 meseci ({Math.round((monthsInProfit / 12) * 100)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Weekday Heatmap */}
            <div className="rounded-2xl backdrop-blur-md p-6 min-h-[200px] border" 
                 style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(0,0,0,0.25)'}}>
              <h3 className="text-[15px] font-medium mb-6" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                Potrošnja po danima u nedelji
              </h3>
              {weekdayExpenses.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {weekdayExpenses.map((day, idx) => {
                    const maxAmount = Math.max(...weekdayExpenses.map(d => d.amount))
                    const intensity = day.amount / maxAmount
                    return (
                      <div key={idx} className="text-center">
                        <div 
                          className="rounded-lg p-4 mb-2" 
                          style={{
                            background: `rgba(255, 179, 230, ${intensity * 0.6 + 0.1})`,
                            border: '1px solid rgba(255, 179, 230, 0.3)'
                          }}
                        >
                          <div className="text-xs font-bold" style={{color: '#FFB3E6'}}>{day.day}</div>
                        </div>
                        <div className="text-xs" style={{color: '#A5A4B6'}}>
                          {(day.amount / 1000).toFixed(1)}k
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10" style={{color: '#A5A4B6'}}>Nema podataka za prikaz</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <HelpButton page="statistics" />
    </div>
  )
}