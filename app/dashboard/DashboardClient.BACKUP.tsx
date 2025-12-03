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
  Repeat
} from "phosphor-react"
import CountUp from 'react-countup'
import CategorySelector from "@/lib/components/CategorySelector"
import ReceiptUploader from "@/lib/components/ReceiptUploader"
import { getIcon } from "@/lib/iconMapping"

type User = {
  id: string
  name: string
  email: string
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
  const [stats, setStats] = useState({ 
    monthlyIncomes: 0, 
    monthlyExpenses: 0, 
    monthlyBalance: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    totalBalance: 0
  })
  const [currentMonthName, setCurrentMonthName] = useState("")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])
  const [recentIncomes, setRecentIncomes] = useState<any[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])
  const [incomesByCategory, setIncomesByCategory] = useState<any[]>([])

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

  // Income form
  const [incAmount, setIncAmount] = useState("")
  const [incDescription, setIncDescription] = useState("")
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0])
  const [incCategoryId, setIncCategoryId] = useState("")
  const [incCurrency, setIncCurrency] = useState("RSD")
  const [incNote, setIncNote] = useState("")
  const [incLoanRepayment, setIncLoanRepayment] = useState("")
  const [incIsRecurring, setIncIsRecurring] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchRecentTransactions()
  }, [])

  const fetchCategories = async () => {
    const [catRes, incCatRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/income-categories')
    ])
    if (catRes.ok) setCategories(await catRes.json())
    if (incCatRes.ok) setIncomeCategories(await incCatRes.json())
  }

  const fetchRecentTransactions = async () => {
    const [expensesRes, incomesRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/incomes')
    ])
    
    if (expensesRes.ok) {
      const expenses = await expensesRes.json()
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

      const monthlyExpensesTotal = monthlyExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
      const monthlyIncomesTotal = monthlyIncomes.reduce((sum: number, i: any) => sum + i.amount, 0)
      const totalExpensesTotal = totalExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
      const totalIncomesTotal = totalIncomes.reduce((sum: number, i: any) => sum + i.amount, 0)

      setStats({
        monthlyExpenses: monthlyExpensesTotal,
        monthlyIncomes: monthlyIncomesTotal,
        monthlyBalance: monthlyIncomesTotal - monthlyExpensesTotal,
        totalExpenses: totalExpensesTotal,
        totalIncomes: totalIncomesTotal,
        totalBalance: totalIncomesTotal - totalExpensesTotal
      })
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        receiptUrl: null
      })
    })
    if (res.ok) {
      setShowExpenseModal(false)
      setExpAmount("")
      setExpDescription("")
      setExpDate(new Date().toISOString().split('T')[0])
      setExpCategoryId("")
      setExpCurrency("RSD")
      setExpNote("")
      fetchStats()
      fetchRecentTransactions()
    }
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        isRecurring: incIsRecurring
      })
    })
    if (res.ok) {
      setShowIncomeModal(false)
      setIncAmount("")
      setIncDescription("")
      setIncDate(new Date().toISOString().split('T')[0])
      setIncCategoryId("")
      setIncCurrency("RSD")
      setIncNote("")
      setIncLoanRepayment("")
      setIncIsRecurring(false)
      fetchStats()
      fetchRecentTransactions()
    }
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen p-8">
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
            <p style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Dobrodošli, {user.name}</p>
            <p className="text-sm mt-1" style={{color: 'rgba(255,255,255,0.45)', fontFamily: '"Inter", sans-serif'}}>Vaša kontrolna tabla troškova i prihoda</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
            style={{background: '#242236', border: '1px solid #2E2B44'}}
          >
            <SignOut size={20} weight="bold" />
            Odjavi se
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="p-6 rounded-[20px] cursor-pointer hover:scale-[1.02] transition-all duration-300 relative" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(228, 88, 110, 0.25)'}} onClick={() => router.push('/expenses')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupni troškovi</div>
              <TrendDown size={32} weight="duotone" style={{color: '#FFB3E6'}} />
            </div>
            <div className="text-3xl font-bold mb-4" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              <CountUp 
                end={stats.totalExpenses} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
                onStart={playCoinSound}
              /> RSD
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{background: 'rgba(255, 179, 230, 0.15)', color: '#FFB3E6', border: '1px solid rgba(255, 179, 230, 0.25)'}}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyExpenses} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
              /> RSD
            </div>
          </div>
          
          <div className="p-6 rounded-[20px] cursor-pointer hover:scale-[1.02] transition-all duration-300 relative" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(27, 217, 106, 0.25)'}} onClick={() => router.push('/incomes')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupni prihodi</div>
              <TrendUp size={32} weight="duotone" style={{color: '#6FFFC4'}} />
            </div>
            <div className="text-3xl font-bold mb-4" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              <CountUp 
                end={stats.totalIncomes} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
                onStart={playCoinSound}
              /> RSD
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{background: 'rgba(111, 255, 196, 0.15)', color: '#6FFFC4', border: '1px solid rgba(111, 255, 196, 0.25)'}}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyIncomes} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
              /> RSD
            </div>
          </div>
          
          <div className="p-6 rounded-[20px] relative" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: stats.totalBalance >= 0 ? '0 4px 24px rgba(127, 223, 255, 0.25)' : '0 4px 24px rgba(228, 88, 110, 0.25)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Bilans</div>
              <Wallet size={32} weight="duotone" style={{color: stats.totalBalance >= 0 ? '#7FDFFF' : '#FFB3E6'}} />
            </div>
            <div className="text-3xl font-bold mb-4" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              <CountUp 
                end={stats.totalBalance} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
                onStart={playCoinSound}
              /> RSD
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{
              background: stats.monthlyBalance >= 0 ? 'rgba(127, 223, 255, 0.15)' : 'rgba(255, 179, 230, 0.15)', 
              color: stats.monthlyBalance >= 0 ? '#7FDFFF' : '#FFB3E6',
              border: stats.monthlyBalance >= 0 ? '1px solid rgba(127, 223, 255, 0.25)' : '1px solid rgba(255, 179, 230, 0.25)'
            }}>
              {currentMonthName}: <CountUp 
                end={stats.monthlyBalance} 
                duration={0.8} 
                decimals={2} 
                decimal="," 
                separator="." 
                preserveValue
              /> RSD
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div
            className="p-1 rounded-3xl bg-gradient-to-br from-[#6A4DFF] via-[#A54DFF] to-[#FF4DB8] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden cursor-pointer"
            style={{boxShadow: '0 0 50px rgba(255, 77, 184, 0.35)'}}
            onClick={() => router.push('/expenses')}
          >
            <div className="p-8 rounded-[22px] backdrop-blur-xl" style={{background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-1">
                  <Receipt size={48} weight="duotone" className="mb-4" style={{color: '#E8D9FF'}} />
                  <h3 className="text-2xl font-bold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", "Poppins", sans-serif', fontSize: '1.1rem', fontWeight: 700}}>Troškovi</h3>
                  <p style={{color: '#E8D9FF', opacity: 0.9, fontWeight: 600}}>Upravljajte svojim troškovima</p>
                </div>
                
                {expensesByCategory.length > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl shadow-lg" style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'}}>
                    <div className="relative">
                      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
                        <defs>
                          <linearGradient id="segmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                          </linearGradient>
                        </defs>
                        <g transform="rotate(-90 70 70)">
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
                              const x1 = 70 + 60 * Math.cos(startRad);
                              const y1 = 70 + 60 * Math.sin(startRad);
                              const x2 = 70 + 60 * Math.cos(endRad);
                              const y2 = 70 + 60 * Math.sin(endRad);
                              const largeArc = angle > 180 ? 1 : 0;
                              const color = premiumColors[idx % premiumColors.length];
                              
                              return (
                                <g key={idx}>
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={color}
                                    className="hover:opacity-90 transition-opacity"
                                    style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}
                                  />
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="url(#segmentShine)"
                                    opacity="0.3"
                                  />
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.3)"
                                    strokeWidth="1.5"
                                  />
                                </g>
                              );
                            });
                          })()}
                        </g>
                        <circle cx="70" cy="70" r="28" fill="rgba(20, 18, 36, 0.95)" stroke="rgba(255, 184, 230, 0.3)" strokeWidth="2" />
                        <text x="70" y="65" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="16" fontWeight="bold">
                          {expensesByCategory.length}
                        </text>
                        <text x="70" y="80" textAnchor="middle" dominantBaseline="middle" fill="#E5E5E5" fontSize="10" opacity="0.7">
                          kategorija
                        </text>
                      </svg>
                    </div>
                    <div className="space-y-2" style={{minWidth: '140px'}}>
                      {expensesByCategory.slice(0, 5).map((cat, idx) => {
                        const total = expensesByCategory.reduce((sum, c) => sum + c.total, 0);
                        const percentage = ((cat.total / total) * 100).toFixed(1);
                        const premiumColors = ['#FFB3E6', '#D19CFF', '#FFC35A', '#FF7AD9'];
                        const color = premiumColors[idx % premiumColors.length];
                        return (
                          <div key={idx} className="flex items-center gap-2 group">
                            <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg" style={{background: color, boxShadow: `0 0 8px ${color}80`}}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate" style={{color: '#E8D9FF'}}>{cat.name}</div>
                              <div className="text-[10px] font-bold" style={{color: color}}>{percentage}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {recentExpenses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold mb-3" style={{color: '#E8D9FF', opacity: 0.9, fontFamily: '"Inter", "Poppins", sans-serif'}}>POSLEDNJI TROŠKOVI</div>
                  {recentExpenses.map((expense, idx) => {
                    const IconComponent = getIcon(expense.category?.icon);
                    return (
                      <div 
                        key={expense.id}
                        className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl hover:scale-[1.01] hover:opacity-95 transition-all cursor-pointer"
                        style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)'}}
                        onClick={(e) => { e.stopPropagation(); router.push('/expenses'); }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(255, 179, 230, 0.2)', border: '1px solid rgba(255, 179, 230, 0.3)'}}>
                          <IconComponent size={20} weight="duotone" style={{color: '#FFB3E6'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", "Poppins", sans-serif'}}>{expense.description}</div>
                          <div className="text-xs" style={{color: '#E8D9FF', opacity: 0.7}}>{expense.category?.name}</div>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap" style={{color: '#FFE3F7', fontFamily: '"Inter", "Poppins", sans-serif'}}>
                          -{formatNumber(expense.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button
                onClick={(e) => { e.stopPropagation(); router.push('/expenses'); }}
                className="mt-4 w-full py-3 rounded-2xl font-semibold hover:scale-[1.01] hover:opacity-95 transition-all cursor-pointer"
                style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#E8D9FF', fontFamily: '"Inter", "Poppins", sans-serif', fontWeight: 600}}
              >
                Prikaži sve →
              </button>
            </div>
          </div>

          <div
            className="p-1 rounded-3xl bg-gradient-to-br from-[#1BD96A] via-[#13C4A3] to-[#0FB2D6] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden cursor-pointer"
            style={{boxShadow: '0 0 45px rgba(19, 196, 163, 0.35)'}}
            onClick={() => router.push('/incomes')}
          >
            <div className="p-8 rounded-[22px] backdrop-blur-xl" style={{background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-1">
                  <CurrencyCircleDollar size={48} weight="duotone" className="mb-4" style={{color: '#D3FFF2', filter: 'drop-shadow(0 0 8px rgba(0, 255, 187, 0.25))'}} />
                  <h3 className="text-xl font-bold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", "Poppins", sans-serif', fontWeight: 700}}>Prihodi</h3>
                  <p style={{color: '#D3FFF2', opacity: 0.9, fontWeight: 600}}>Pratite svoje prihode</p>
                </div>
                
                {incomesByCategory.length > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl shadow-lg" style={{background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'}}>
                    <div className="relative">
                      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
                        <defs>
                          <linearGradient id="segmentShineIncome" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                          </linearGradient>
                        </defs>
                        <g transform="rotate(-90 70 70)">
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
                              const x1 = 70 + 60 * Math.cos(startRad);
                              const y1 = 70 + 60 * Math.sin(startRad);
                              const x2 = 70 + 60 * Math.cos(endRad);
                              const y2 = 70 + 60 * Math.sin(endRad);
                              const largeArc = angle > 180 ? 1 : 0;
                              const color = premiumColors[idx % premiumColors.length];
                              
                              return (
                                <g key={idx}>
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={color}
                                    className="hover:opacity-90 transition-opacity"
                                    style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}
                                  />
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="url(#segmentShineIncome)"
                                    opacity="0.3"
                                  />
                                  <path
                                    d={`M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.3)"
                                    strokeWidth="1.5"
                                  />
                                </g>
                              );
                            });
                          })()}
                        </g>
                        <circle cx="70" cy="70" r="28" fill="rgba(20, 18, 36, 0.95)" stroke="rgba(180, 255, 228, 0.4)" strokeWidth="2" />
                        <text x="70" y="65" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="16" fontWeight="bold">
                          {incomesByCategory.length}
                        </text>
                        <text x="70" y="80" textAnchor="middle" dominantBaseline="middle" fill="#E5E5E5" fontSize="10" opacity="0.7">
                          kategorija
                        </text>
                      </svg>
                    </div>
                    <div className="space-y-2" style={{minWidth: '140px'}}>
                      {incomesByCategory.slice(0, 5).map((cat, idx) => {
                        const total = incomesByCategory.reduce((sum, c) => sum + c.total, 0);
                        const percentage = ((cat.total / total) * 100).toFixed(1);
                        const premiumColors = ['#B4FFE4', '#6FFFC4', '#7FDFFF', '#00BFA6'];
                        const color = premiumColors[idx % premiumColors.length];
                        return (
                          <div key={idx} className="flex items-center gap-2 group">
                            <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg" style={{background: color, boxShadow: `0 0 8px ${color}80`}}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate" style={{color: '#D3FFF2'}}>{cat.name}</div>
                              <div className="text-[10px] font-bold" style={{color: color}}>{percentage}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {recentIncomes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold mb-3" style={{color: '#D3FFF2', opacity: 0.9, fontFamily: '"Inter", "Poppins", sans-serif'}}>POSLEDNJI PRIHODI</div>
                  {recentIncomes.map((income, idx) => {
                    const IconComponent = getIcon(income.category?.icon);
                    return (
                      <div 
                        key={income.id}
                        className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl hover:scale-[1.01] transition-all cursor-pointer"
                        style={{background: 'rgba(0, 0, 0, 0.28)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 2px 8px rgba(19, 196, 163, 0.15)'}}
                        onClick={(e) => { e.stopPropagation(); router.push('/incomes'); }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(114, 255, 228, 0.2)', border: '1px solid rgba(114, 255, 228, 0.3)'}}>
                          <IconComponent size={20} weight="duotone" style={{color: '#72FFE4'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", "Poppins", sans-serif'}}>{income.description}</div>
                          <div className="text-xs" style={{color: '#D3FFF2', opacity: 0.7}}>{income.category?.name}</div>
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap" style={{color: '#C6FFE6', fontFamily: '"Inter", "Poppins", sans-serif'}}>
                          +{formatNumber(income.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button
                onClick={(e) => { e.stopPropagation(); router.push('/incomes'); }}
                className="mt-4 w-full py-3 rounded-2xl font-semibold hover:scale-[1.01] hover:opacity-95 transition-all cursor-pointer"
                style={{background: 'rgba(0, 0, 0, 0.28)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#D3FFF2', fontFamily: '"Inter", "Poppins", sans-serif', fontWeight: 600}}
              >
                Prikaži sve →
              </button>
            </div>
          </div>
        </div>

          <div className="p-6 rounded-[20px]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}>
            <h2 className="text-xl font-bold mb-6" style={{fontFamily: '"Inter", sans-serif', color: '#FFFFFF'}}>Brzi pristup</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button onClick={() => router.push('/statistics')} className="p-6 rounded-[20px] hover:scale-[1.02] transition-all duration-300" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(159, 112, 255, 0.2)'}}>
                <ChartLine size={24} weight="bold" style={{color: '#B794FF'}} className="mx-auto mb-3" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Statistika</div>
              </button>
              <button onClick={() => router.push('/recurring')} className="p-6 rounded-[20px] hover:scale-[1.02] transition-all duration-300" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(255, 165, 0, 0.2)'}}>
                <Repeat size={24} weight="bold" style={{color: '#FFB366'}} className="mx-auto mb-3" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Recurring</div>
              </button>
              <button onClick={() => router.push('/groups')} className="p-6 rounded-[20px] hover:scale-[1.02] transition-all duration-300" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(76, 139, 234, 0.2)'}}>
                <Users size={24} weight="bold" style={{color: '#6FA8FF'}} className="mx-auto mb-3" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Grupe</div>
              </button>
              <button onClick={() => router.push('/categories')} className="p-6 rounded-[20px] hover:scale-[1.02] transition-all duration-300" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(111, 255, 196, 0.2)'}}>
                <Tag size={24} weight="bold" style={{color: '#6FFFC4'}} className="mx-auto mb-3" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Kategorije</div>
              </button>
              <button onClick={() => router.push('/profile')} className="p-6 rounded-[20px] hover:scale-[1.02] transition-all duration-300" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(255, 179, 230, 0.2)'}}>
                <Gear size={24} weight="bold" style={{color: '#FFB3E6'}} className="mx-auto mb-3" />
                <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif'}}>Profil</div>
              </button>
            </div>
          </div>        {/* Quick Add Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#6A4DFF] via-[#A54DFF] to-[#FF4DB8] hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-2xl group relative"
            style={{boxShadow: '0 8px 32px rgba(255, 77, 184, 0.5)', border: '2px solid rgba(255, 255, 255, 0.15)'}}
          >
            <Receipt size={24} weight="bold" style={{color: '#FFFFFF'}} />
            <span className="absolute right-20 bg-[#242236] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
              Dodaj trošak
            </span>
          </button>

          <button
            onClick={() => setShowIncomeModal(true)}
            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#1BD96A] via-[#13C4A3] to-[#0FB2D6] hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-2xl group relative"
            style={{boxShadow: '0 8px 32px rgba(19, 196, 163, 0.5)', border: '2px solid rgba(255, 255, 255, 0.15)'}}
          >
            <CurrencyCircleDollar size={24} weight="bold" style={{color: '#FFFFFF'}} />
            <span className="absolute right-20 bg-[#242236] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
              Dodaj prihod
            </span>
          </button>
        </div>

        {/* Expense Modal */}
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
                    onUploadComplete={(data) => {
                      if (data.amount) setExpAmount(data.amount.toString());
                      if (data.date) setExpDate(data.date);
                      if (data.description) setExpDescription(data.description);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv troška *</label>
                  <input type="text" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} placeholder="npr. Kupovina..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
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
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{background: '#1C1A2E'}}>
                  <input type="checkbox" id="incIsRecurring" checked={incIsRecurring} onChange={(e) => setIncIsRecurring(e.target.checked)} className="w-5 h-5 rounded accent-[#45D38A]" />
                  <label htmlFor="incIsRecurring" className="text-sm" style={{color: '#A5A4B6'}}>Recurring income</label>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}>Otkaži</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white" style={{background: 'linear-gradient(135deg, #45D38A, #2ECC71)'}}>Dodaj</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
