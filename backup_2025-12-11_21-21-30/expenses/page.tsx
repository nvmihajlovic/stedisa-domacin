"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash, CalendarBlank, CaretLeft, CaretRight, X, TrendDown, PencilSimple, CreditCard, Repeat, DownloadSimple, FilePdf, FileText, Funnel } from "phosphor-react"
import CategorySelector from "@/lib/components/CategorySelector"
import ReceiptUploader from "@/lib/components/ReceiptUploader"
import { theme } from "@/lib/theme-colors"
import ModernHelpButton from "@/components/ModernHelpButton"
import { getIcon } from "@/lib/iconMapping"
import { generatePDFReport, downloadPDF } from "@/lib/pdf-generator"
import { showToast } from "@/lib/toast"
import ConvertedAmount from "@/components/ConvertedAmount"
import ExpenseFilters from "@/components/ExpenseFilters"

type Category = {
  id: string
  name: string
  icon?: string
  color?: string
}

type RecurringExpense = {
  id: string
  frequency: string
  nextExecutionAt: string
}

type SplitUser = {
  id: string
  name: string
  email: string
}

type Split = {
  id: string
  amount: number
  isPaid: boolean
  owedBy: SplitUser
}

type Expense = {
  id: string
  amount: number
  description: string
  date: string
  category: Category
  recurringExpense?: RecurringExpense | null
  note?: string | null
  currency?: string | null
  splits?: Split[]
}

type GroupMember = {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

type Group = {
  id: string
  name: string
  members: GroupMember[]
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState("")
  const [currency, setCurrency] = useState("RSD")
  const [note, setNote] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState("monthly")
  const [nextRecurringDate, setNextRecurringDate] = useState(new Date().toISOString().split('T')[0])
  const [dayOfMonth, setDayOfMonth] = useState<number>(new Date().getDate())
  
  // Group split fields
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [splitWithGroup, setSplitWithGroup] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  
  // OCR suggestion tracking (for learning)
  const [ocrSuggestedCategoryId, setOcrSuggestedCategoryId] = useState<string | null>(null)
  const [ocrVendorName, setOcrVendorName] = useState<string | null>(null)
  
  // Savings goal selection
  const [savingsGoalId, setSavingsGoalId] = useState("")
  const [availableSavingsGoals, setAvailableSavingsGoals] = useState<any[]>([])
  
  // Bulk operations state
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  
  // Export state
  const [exportLoading, setExportLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'custom',
    customDateFrom: undefined as string | undefined,
    customDateTo: undefined as string | undefined,
    categories: [] as string[],
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    users: [] as string[],
  })
  const [searchQuery, setSearchQuery] = useState("")
  
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())

  const formatNumber = (num: number) => {
    return num.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
    fetchUserGroups()
    
    // Listen for settlement updates - real-time refresh
    const handleSettlementUpdate = () => {
      console.log('🔄 Settlement updated, refreshing expenses...')
      fetchExpenses()
    }
    
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [month, year])

  // Watch for Štednja category selection and fetch savings goals
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === categoryId)
      if (selectedCategory?.isSavings) {
        fetchAvailableSavingsGoals()
      } else {
        setSavingsGoalId("")
        setAvailableSavingsGoals([])
      }
    }
  }, [categoryId, categories])

  const fetchAvailableSavingsGoals = async () => {
    try {
      const response = await fetch('/api/savings?groupFilter=all')
      const data = await response.json()
      if (data.success) {
        const activeGoals = data.data.filter((g: any) => g.isActive)
        setAvailableSavingsGoals(activeGoals)
        if (activeGoals.length === 1) {
          setSavingsGoalId(activeGoals[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching savings goals:', error)
    }
  }

  const fetchUserGroups = async () => {
    try {
      const res = await fetch('/api/groups/user')
      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : { groups: [] }
        setUserGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching user groups:', error)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch("/api/categories")
    if (res.ok) {
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      // Filter only active categories
      setCategories(data.filter((cat: any) => cat.isActive !== false))
    }
  }

  const fetchExpenses = async () => {
    const res = await fetch(`/api/expenses?month=${month}&year=${year}&groupFilter=all`)
    if (res.ok) {
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      setExpenses(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validacija obaveznih polja
    if (!description.trim()) {
      console.warn('Molimo unesite opis troška')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      console.warn('Molimo unesite ispravan iznos')
      return
    }
    if (!date) {
      console.warn('Molimo izaberite datum')
      return
    }
    if (!categoryId) {
      console.warn('Molimo izaberite kategoriju')
      return
    }
    if (splitWithGroup && selectedParticipants.length === 0) {
      console.warn('Molimo izaberite bar jednog učesnika za podelu troška')
      return
    }
    
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        date,
        categoryId,
        currency,
        note: note || null,
        receiptUrl: null,
        isRecurring,
        recurringType: isRecurring ? recurringType : null,
        nextRecurringDate: isRecurring ? nextRecurringDate : null,
        dayOfMonth: isRecurring ? dayOfMonth : null,
        splitWithGroup,
        groupId: splitWithGroup ? selectedGroupId : null,
        participants: splitWithGroup ? selectedParticipants : null,
        savingsGoalId: savingsGoalId || null
      })
    })

    if (res.ok) {
      // Learn from category choice if OCR suggested something
      if (ocrVendorName && categoryId) {
        const wasCorrect = categoryId === ocrSuggestedCategoryId;
        
        try {
          await fetch('/api/expenses/suggest-category', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorName: ocrVendorName,
              categoryId: categoryId,
              wasCorrectSuggestion: wasCorrect,
            }),
          });
          console.log(`🎓 Learned: ${ocrVendorName} → category (${wasCorrect ? 'correct' : 'corrected'})`);
        } catch (error) {
          console.error('Failed to record learning:', error);
        }
      }
      
      setShowModal(false)
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId("")
      setCurrency("RSD")
      setNote("")
      setIsRecurring(false)
      setRecurringType("monthly")
      setNextRecurringDate(new Date().toISOString().split('T')[0])
      setSplitWithGroup(false)
      setSelectedGroupId("")
      setSelectedParticipants([])
      setOcrSuggestedCategoryId(null)
      setOcrVendorName(null)
      showToast("Trošak uspešno dodat", "success")
      fetchExpenses()
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setAmount(expense.amount.toString())
    setDescription(expense.description)
    setDate(expense.date.split('T')[0])
    setCategoryId(expense.category.id)
    setCurrency(expense.currency || 'RSD')
    setNote(expense.note || '')
    setIsRecurring(!!expense.recurringExpense)
    setRecurringType(expense.recurringExpense?.frequency || 'monthly')
    setNextRecurringDate(expense.recurringExpense?.nextExecutionAt ? expense.recurringExpense.nextExecutionAt.split('T')[0] : new Date().toISOString().split('T')[0])
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return
    
    try {
      const requestBody = {
        amount: parseFloat(amount),
        description,
        date,
        categoryId,
        currency,
        note: note || null,
        isRecurring,
        recurringType: isRecurring && recurringType ? recurringType : null,
        nextRecurringDate: isRecurring && nextRecurringDate ? nextRecurringDate : null
      }
      
      console.log('Sending update request:', requestBody)
      
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', errorText)
        let errorMessage = 'Nepoznata greška'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        showToast(`Greška pri ažuriranju troška: ${errorMessage}`, 'error')
        return
      }
      
      const result = await res.json()
      console.log('Update successful:', result)
      
      setShowEditModal(false)
      setEditingExpense(null)
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId("")
      setCurrency("RSD")
      setNote("")
      setIsRecurring(false)
      setRecurringType("monthly")
      setNextRecurringDate(new Date().toISOString().split('T')[0])
      showToast("Trošak uspešno ažuriran", "success")
      fetchExpenses()
    } catch (error) {
      console.error('Update error:', error)
      showToast('Greška pri ažuriranju troška', 'error')
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingExpense(null)
    setAmount("")
    setDescription("")
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId("")
    setCurrency("RSD")
    setNote("")
    setIsRecurring(false)
    setRecurringType("monthly")
    setNextRecurringDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = async (id: string) => {
    setExpenseToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return
    
    const res = await fetch(`/api/expenses/${expenseToDelete}`, { method: "DELETE" })
    if (res.ok) {
      setShowDeleteModal(false)
      setExpenseToDelete(null)
      showToast("Trošak uspešno obrisan", "success")
      fetchExpenses()
    }
  }

  // Bulk operations handlers
  const toggleSelectExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses)
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId)
    } else {
      newSelected.add(expenseId)
    }
    setSelectedExpenses(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0) {
      setSelectedExpenses(new Set())
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map(e => e.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedExpenses.size === 0) return
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = async () => {
    setShowBulkDeleteModal(false)
    setBulkDeleteLoading(true)
    
    try {
      const res = await fetch("/api/expenses/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseIds: Array.from(selectedExpenses) }),
      })

      if (res.ok) {
        const data = await res.json()
        showToast(data.message || `Obrisano ${selectedExpenses.size} troškova`, "success")
        setSelectedExpenses(new Set())
        fetchExpenses()
      } else {
        const error = await res.json()
        showToast(error.error || "Greška pri brisanju", "error")
      }
    } catch (error) {
      console.error("Bulk delete error:", error)
      showToast("Greška pri brisanju troškova", "error")
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedExpenses(new Set())
  }

  // Filter and search logic
  const getFilteredExpenses = () => {
    let filtered = [...expenses]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(query) ||
        expense.category.name.toLowerCase().includes(query) ||
        expense.note?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (filters.dateRange === 'today') {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= today
        })
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= weekAgo
        })
      } else if (filters.dateRange === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= monthStart
        })
      } else if (filters.dateRange === 'custom' && filters.customDateFrom && filters.customDateTo) {
        const from = new Date(filters.customDateFrom)
        const to = new Date(filters.customDateTo)
        to.setHours(23, 59, 59, 999) // Include full day
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= from && expenseDate <= to
        })
      }
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(expense => 
        filters.categories.includes(expense.category.id)
      )
    }

    // Apply amount range filter
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount!)
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount!)
    }

    return filtered
  }

  const filteredExpenses = getFilteredExpenses()
  const hasActiveFilters = 
    filters.dateRange !== 'all' ||
    filters.categories.length > 0 ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined ||
    searchQuery.trim() !== ''

  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    setExportLoading(true)

    try {
      // Use filtered expenses for export
      const expenseIds = filteredExpenses.map(e => e.id).join(',')
      
      const url = `/api/expenses/export?expenseIds=${encodeURIComponent(expenseIds)}&format=${format}`

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `troskovi_${year}-${month.toString().padStart(2, '0')}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Export u ${format.toUpperCase()} formatu uspešan!`, "success")
    } catch (error) {
      console.error("Export error:", error)
      showToast("Greška pri exportu", "error")
    } finally {
      setExportLoading(false)
    }
  }

  const handlePDFExport = async () => {
    setPdfLoading(true)

    try {
      // Use filtered expenses for PDF export
      const expenseIds = filteredExpenses.map(e => e.id).join(',')

      // Fetch data for PDF
      const response = await fetch(`/api/export/pdf-data?expenseIds=${encodeURIComponent(expenseIds)}`)
      if (!response.ok) throw new Error('Failed to fetch PDF data')
      
      const data = await response.json()
      
      // Generate PDF
      const pdfBlob = await generatePDFReport(data)
      
      // Download PDF
      const filename = `troskovi_${year}-${month.toString().padStart(2, '0')}.pdf`
      downloadPDF(pdfBlob, filename)

      showToast('PDF izveštaj uspešno preuzet!', 'success')
    } catch (error) {
      console.error('PDF export error:', error)
      showToast('Greška pri kreiranju PDF izveštaja', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  // Group expenses by currency and calculate totals
  const totalsByCurrency = expenses.reduce((acc, exp) => {
    const currency = exp.currency || 'RSD'
    if (!acc[currency]) {
      acc[currency] = 0
    }
    acc[currency] += exp.amount
    return acc
  }, {} as Record<string, number>)

  // Ukupan iznos u RSD (koristi konvertovane iznose)
  const totalInRSD = expenses.reduce((sum, exp) => sum + ((exp as any).amountInRSD || exp.amount), 0)

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthNames = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-10 lg:px-14 mt-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-fintech-gradient bg-clip-text text-transparent mb-4">
              Troškovi
            </h1>
            <div className="flex items-center gap-3 px-6 py-3 rounded-3xl backdrop-blur-xl" style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 0 35px -10px rgba(0, 0, 0, 0.45)'}}>
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <p style={{color: '#A5A4B6', fontSize: '16px', fontWeight: 500, minWidth: '140px', textAlign: 'center'}}>
                {monthNames[month - 1]} {year}
              </p>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Help Button */}
            <ModernHelpButton page="expenses" />
            
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-2xl font-semibold backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              style={{background: 'rgba(255, 255, 255, 0.05)', color: '#B8B7C5'}}
            >
              <ArrowLeft size={20} weight="bold" />
              Nazad
            </button>
          </div>
        </div>

        <div className="rounded-3xl relative p-6 lg:p-7 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', height: '120px', marginBottom: '32px'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupno troškova</div>
            <TrendDown size={20} weight="duotone" style={{color: '#FFB3E6'}} />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              {formatNumber(totalInRSD)} <span style={{fontSize: '0.65em', opacity: 0.6, fontWeight: 500, marginLeft: '4px'}}>RSD</span>
            </div>
            {Object.keys(totalsByCurrency).length > 1 && (
              <div className="text-[10px] italic" style={{color: 'rgba(255,255,255,0.4)', marginTop: '4px'}}>
                sa valutom konvertovanom u RSD
              </div>
            )}
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: 'rgba(255, 179, 230, 0.15)', color: '#FFB3E6', border: '1px solid rgba(255, 179, 230, 0.2)'}}>
            {monthNames[month - 1]} {year}
          </div>
        </div>

        {/* Main Card - Lista troškova */}
        <div className="p-1 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(135deg, rgba(228,88,110,0.25) 0%, rgba(255,179,230,0.25) 100%)'}}>
          <div className="rounded-3xl backdrop-blur-xl p-6 lg:p-7 pb-8" style={{background: 'rgba(20, 18, 38, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <CreditCard size={36} weight="duotone" className="mb-4" style={{color: '#FFE3F7'}} />
                <h3 className="text-xl font-semibold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Troškovi</h3>
                <p className="text-sm" style={{color: '#FFE3F7', opacity: 0.7}}>Pratite svoje troškove</p>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">Učitavanje...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12" style={{color: '#A5A4B6'}}>
                Nemate troškova ovog meseca. Dodajte prvi!
              </div>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pretraži troškove..."
                      className="w-full px-4 py-3 pl-12 rounded-xl backdrop-blur-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        '::placeholder': { color: 'rgba(255, 255, 255, 0.4)' }
                      }}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      🔍
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <X size={16} style={{color: '#A5A4B6'}} />
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(true)}
                    className="relative px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 hover:scale-105"
                    style={{
                      background: hasActiveFilters 
                        ? 'linear-gradient(135deg, #9F70FF 0%, #7B5CFF 100%)' 
                        : 'rgba(159, 112, 255, 0.15)',
                      border: '1px solid rgba(159, 112, 255, 0.3)',
                      color: hasActiveFilters ? '#FFFFFF' : '#9F70FF'
                    }}
                  >
                    <Funnel size={18} weight="bold" />
                    Filteri
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {[
                          filters.dateRange !== 'all' ? 1 : 0,
                          filters.categories.length,
                          filters.minAmount !== undefined ? 1 : 0,
                          filters.maxAmount !== undefined ? 1 : 0,
                          searchQuery.trim() !== '' ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filtered Results Info */}
                {hasActiveFilters && (
                  <div className="mb-4 p-3 rounded-xl flex items-center justify-between" style={{background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.2)'}}>
                    <span className="text-sm" style={{color: '#E8D9FF'}}>
                      Prikazano {filteredExpenses.length} od {expenses.length} troškova
                    </span>
                    <button
                      onClick={() => {
                        setFilters({
                          dateRange: 'all',
                          customDateFrom: undefined,
                          customDateTo: undefined,
                          categories: [],
                          minAmount: undefined,
                          maxAmount: undefined,
                          users: [],
                        })
                        setSearchQuery('')
                      }}
                      className="text-xs px-3 py-1 rounded-lg hover:opacity-80 transition-all"
                      style={{background: 'rgba(255, 255, 255, 0.1)', color: '#E8D9FF'}}
                    >
                      Resetuj filtere
                    </button>
                  </div>
                )}

                {/* Bulk Operations Toolbar */}
                {selectedExpenses.size > 0 && (
                  <div className="mb-4 flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#9F70FF'}}>
                        {selectedExpenses.size} izabrano
                      </span>
                      <button
                        onClick={clearSelection}
                        className="text-xs px-3 py-1 rounded-lg hover:opacity-80 transition-all"
                        style={{background: 'rgba(255, 255, 255, 0.1)', color: '#E8D9FF'}}
                      >
                        Poništi
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleExport('xlsx')}
                        disabled={exportLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(52, 211, 153, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(52, 211, 153, 0.3)',
                          boxShadow: '0 8px 32px rgba(52, 211, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <DownloadSimple size={20} weight="bold" style={{color: '#34D399'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#34D399'}}>{exportLoading ? "Eksportujem..." : "Excel"}</span>
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        disabled={exportLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(96, 165, 250, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(96, 165, 250, 0.3)',
                          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FileText size={20} weight="bold" style={{color: '#60A5FA'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#60A5FA'}}>{exportLoading ? "Eksportujem..." : "CSV"}</span>
                      </button>
                      <button
                        onClick={handlePDFExport}
                        disabled={pdfLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(251, 113, 133, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(251, 113, 133, 0.3)',
                          boxShadow: '0 8px 32px rgba(251, 113, 133, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FilePdf size={20} weight="bold" style={{color: '#FB7185'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#FB7185'}}>{pdfLoading ? "Generišem..." : "PDF"}</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkDeleteLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(255, 107, 157, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 107, 157, 0.3)',
                          boxShadow: '0 8px 32px rgba(255, 107, 157, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Trash size={20} weight="bold" style={{color: '#FF6B9D'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#FF6B9D'}}>{bulkDeleteLoading ? "Brisanje..." : `Obriši (${selectedExpenses.size})`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Select All Checkbox */}
                <div className="mb-3 flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filteredExpenses.length > 0 && selectedExpenses.size === filteredExpenses.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{accentColor: '#9F70FF'}}
                    />
                    <span className="text-sm" style={{color: '#E8D9FF', opacity: 0.7}}>
                      {selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0 ? 'Poništi sve' : 'Izaberi sve'}
                    </span>
                  </div>
                  
                  {/* Export buttons (visible when no selection) */}
                  {selectedExpenses.size === 0 && (
                    <div className="flex items-center gap-3" data-tour="export-buttons">
                      <button
                        onClick={() => handleExport('xlsx')}
                        disabled={exportLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(52, 211, 153, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(52, 211, 153, 0.3)',
                          boxShadow: '0 8px 32px rgba(52, 211, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <DownloadSimple size={20} weight="bold" style={{color: '#34D399'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#34D399'}}>{exportLoading ? "Eksportujem..." : "Excel"}</span>
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        disabled={exportLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(96, 165, 250, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(96, 165, 250, 0.3)',
                          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FileText size={20} weight="bold" style={{color: '#60A5FA'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#60A5FA'}}>{exportLoading ? "Eksportujem..." : "CSV"}</span>
                      </button>
                      <button
                        onClick={handlePDFExport}
                        disabled={pdfLoading}
                        className="group relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-sm overflow-hidden"
                        style={{
                          background: 'rgba(251, 113, 133, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(251, 113, 133, 0.3)',
                          boxShadow: '0 8px 32px rgba(251, 113, 133, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FilePdf size={20} weight="bold" style={{color: '#FB7185'}} className="relative z-10" />
                        <span className="relative z-10" style={{color: '#FB7185'}}>{pdfLoading ? "Generišem..." : "PDF"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-12" style={{color: '#A5A4B6'}}>
                    {hasActiveFilters 
                      ? 'Nema troškova koji odgovaraju filterima.' 
                      : 'Nemate troškova.'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 lg:gap-4 pb-4">
                    {filteredExpenses.map((expense) => {
                const IconComponent = getIcon(expense.category.icon);
                const categoryColor = expense.category.color || '#FFB3E6';
                return (
                  <div 
                    key={expense.id}
                    className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]"
                    style={{border: '1px solid rgba(255, 255, 255, 0.04)'}}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={selectedExpenses.has(expense.id)}
                        onChange={() => toggleSelectExpense(expense.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                        style={{accentColor: '#9F70FF'}}
                      />
                      
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: `${categoryColor}26`, border: `1px solid ${categoryColor}33`, boxShadow: `0 0 15px ${categoryColor}33`}}>
                        <IconComponent size={18} weight="duotone" style={{color: categoryColor}} />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>{expense.description}</div>
                          {expense.recurringExpense && (
                            <div className="flex-shrink-0 px-2 py-0.5 rounded-xl flex items-center gap-1" style={{background: 'rgba(159, 112, 255, 0.12)', border: '1px solid rgba(159, 112, 255, 0.25)'}}>
                              <Repeat size={12} weight="bold" style={{color: '#9F70FF'}} />
                              <span className="text-xs font-medium" style={{color: '#9F70FF'}}>
                                {expense.recurringExpense.frequency === 'monthly' ? 'Mesečno' : 
                                 expense.recurringExpense.frequency === 'weekly' ? 'Nedeljno' : 'Godišnje'}
                              </span>
                            </div>
                          )}
                          {expense.splits && expense.splits.length > 0 && (
                            <div className="flex-shrink-0 px-2 py-0.5 rounded-xl flex items-center gap-1" style={{background: 'rgba(255, 179, 230, 0.12)', border: '1px solid rgba(255, 179, 230, 0.25)'}}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#FFB3E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 7H8M16 7H20M4 12H8M16 12H20M4 17H8M16 17H20" stroke="#FFB3E6" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <span className="text-xs font-medium" style={{color: '#FFB3E6'}}>
                                {expense.splits.every(s => s.isPaid) ? 'Poravnato' : 'Podeljeno'} ({expense.splits.length + 1})
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm" style={{color: '#E8D9FF', opacity: 0.6}}>
                          {expense.category?.name}
                          {expense.recurringExpense && (
                            <span className="ml-2">
                              • Sledeće: {new Date(expense.recurringExpense.nextExecutionAt).toLocaleDateString('sr-RS')}
                            </span>
                          )}
                          {expense.splits && expense.splits.length > 0 && (
                            <span className="ml-2 italic text-xs">
                              • {expense.splits.map(s => s.owedBy.name).join(', ')}
                            </span>
                          )}
                        </div>
                        {expense.note && (
                          <div className="text-xs mt-1 italic" style={{color: '#A5A4B6', opacity: 0.8}}>
                            {expense.note}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <div className="text-lg whitespace-nowrap" style={{color: '#FFE3F7', fontFamily: '"Inter", sans-serif', textShadow: '0 0 5px rgba(255, 227, 247, 0.1)'}}>
                          <span style={{fontWeight: 700}}>-</span><span style={{fontWeight: 500}}>{formatNumber(expense.amount)}</span> <span style={{fontSize: '0.75em', opacity: 0.6, marginLeft: '2px'}}>{expense.currency || "RSD"}</span>
                        </div>
                        {expense.currency && expense.currency !== 'RSD' && (
                          <ConvertedAmount 
                            amount={expense.amount} 
                            fromCurrency={expense.currency} 
                            toCurrency="RSD"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                        style={{background: 'rgba(255, 179, 230, 0.1)', border: '1px solid rgba(255, 179, 230, 0.2)'}}
                      >
                        <PencilSimple size={16} weight="duotone" style={{color: '#FFB3E6'}} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                        style={{background: 'rgba(255, 179, 230, 0.1)', border: '1px solid rgba(255, 179, 230, 0.2)'}}
                      >
                        <Trash size={16} weight="duotone" style={{color: '#FFB3E6'}} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
                )}
              </>
          )}
          
          <div className="p-3 rounded-[16px]" style={{background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-xl font-semibold hover:scale-[1.01] hover:opacity-95 transition-all cursor-pointer"
              style={{background: theme.expense.gradient, border: `1px solid ${theme.expense.border}`, color: theme.expense.primary, fontFamily: '"Inter", "Poppins", sans-serif', fontWeight: 600}}
            >
              + Dodaj trošak
            </button>
          </div>
        </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Dodaj trošak</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Račun / Receipt</label>
                  <ReceiptUploader
                    categories={categories}
                    onUploadComplete={(data) => {
                      console.log("OCR callback data:", data);
                      if (data.amount) {
                        console.log("Setting amount:", data.amount);
                        setAmount(data.amount.toString());
                      }
                      if (data.date) {
                        console.log("Setting date:", data.date);
                        setDate(data.date);
                      }
                      if (data.description) {
                        console.log("Setting description:", data.description);
                        setDescription(data.description);
                        // Force update
                        setTimeout(() => {
                          if (data.description) setDescription(data.description);
                        }, 100);
                      }
                      if (data.categoryId) {
                        console.log("Setting categoryId:", data.categoryId);
                        setCategoryId(data.categoryId);
                        // Track OCR suggestion for learning
                        setOcrSuggestedCategoryId(data.categoryId);
                      }
                      // @ts-ignore - vendorName can be passed from OCR
                      if (data.vendorName) {
                        // @ts-ignore
                        setOcrVendorName(data.vendorName);
                        // @ts-ignore
                        console.log("Tracked vendor for learning:", data.vendorName);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Naziv troška *</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="npr. Kupovina namirnica, Struja..."
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                      style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Valuta *</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                      style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    >
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Datum troška *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  {!categoryId && (
                    <p className="text-xs mb-3" style={{color: '#7A7A8C'}}>Izaberi kategoriju troška</p>
                  )}
                  <CategorySelector
                    categories={categories}
                    selectedId={categoryId}
                    onSelect={setCategoryId}
                  />
                </div>

                {/* Savings Goal Selector - only show if Štednja category is selected */}
                {categoryId && categories.find(c => c.id === categoryId)?.isSavings && (
                  <div className="rounded-xl p-4" style={{background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.15)'}}>
                    <label className="block text-sm mb-2" style={{color: '#FFD700'}}>
                      Cilj štednje *
                    </label>
                    {availableSavingsGoals.length === 0 ? (
                      <div className="text-sm" style={{color: '#A5A4B6'}}>
                        <p className="mb-2">Nemate kreiran cilj štednje.</p>
                        <a
                          href="/savings"
                          className="text-[#FFD700] hover:underline"
                        >
                          Kreiraj cilj štednje →
                        </a>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs mb-3" style={{color: '#A5A4B6'}}>
                          Izaberi cilj za koji želiš da veš ovu štednju
                        </p>
                        <select
                          value={savingsGoalId}
                          onChange={(e) => setSavingsGoalId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-[#FFD700] transition-colors"
                          style={{background: '#1C1A2E', borderColor: '#2E2B44', color: '#fff'}}
                        >
                          <option value="">Izaberi cilj...</option>
                          {availableSavingsGoals.map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.name} ({goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {goal.currency})
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Napomena (opciono)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Dodatne informacije..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors resize-none"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                  />
                </div>

                {/* Recurring Section - Hidden for Savings category */}
                {!categories.find(c => c.id === categoryId)?.isSavings && (
                  <div className="rounded-xl p-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                        style={{background: isRecurring ? '#9F70FF' : 'rgba(159, 112, 255, 0.2)'}}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                          style={{transform: isRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                        />
                      </button>
                      <label className="text-sm font-medium cursor-pointer" style={{color: '#FFFFFF'}} onClick={() => setIsRecurring(!isRecurring)}>
                        Ponavlja se
                      </label>
                    </div>

                    {isRecurring && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                          <select
                            value={recurringType}
                            onChange={(e) => setRecurringType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                            style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                          >
                            <option value="monthly">Mesečno</option>
                            <option value="quarterly">Kvartalno (svakih 3 meseca)</option>
                            <option value="semi-annually">Polugodišnje (svakih 6 meseci)</option>
                            <option value="yearly">Godišnje</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Dan u mesecu</label>
                            <select
                              value={dayOfMonth}
                              onChange={(e) => setDayOfMonth(Number(e.target.value))}
                              className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                              style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                            >
                              {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{day}. dan u mesecu</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Prvo ponavljanje</label>
                            <input
                              type="date"
                              value={nextRecurringDate}
                              onChange={(e) => setNextRecurringDate(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                              style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                            />
                          </div>
                        </div>

                        <div className="text-xs p-3 rounded-lg" style={{background: 'rgba(159, 112, 255, 0.1)', color: '#B794FF'}}>
                          💡 Trošak će se automatski kreirati svakog{' '}
                          <strong>{dayOfMonth}.</strong> dana{' '}
                          {recurringType === 'monthly' && 'svakog meseca'}
                          {recurringType === 'quarterly' && 'na svaka 3 meseca'}
                          {recurringType === 'semi-annually' && 'na svakih 6 meseci'}
                          {recurringType === 'yearly' && 'jednom godišnje'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Group Split Section */}
                {userGroups.length > 0 && (
                  <div className="p-4 rounded-xl space-y-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.2)'}}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSplitWithGroup(!splitWithGroup)
                          if (splitWithGroup) {
                            setSelectedGroupId("")
                            setSelectedParticipants([])
                          }
                        }}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                        style={{background: splitWithGroup ? '#9F70FF' : 'rgba(159, 112, 255, 0.2)'}}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                          style={{transform: splitWithGroup ? 'translateX(26px)' : 'translateX(4px)'}}
                        />
                      </button>
                      <label className="text-sm font-medium cursor-pointer" style={{color: '#FFFFFF'}} onClick={() => {
                        setSplitWithGroup(!splitWithGroup)
                        if (splitWithGroup) {
                          setSelectedGroupId("")
                          setSelectedParticipants([])
                        }
                      }}>
                        Podeli trošak sa grupom
                      </label>
                    </div>

                    {splitWithGroup && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Izaberi grupu</label>
                          <select
                            value={selectedGroupId}
                            onChange={(e) => {
                              setSelectedGroupId(e.target.value)
                              setSelectedParticipants([])
                            }}
                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                            style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                            required={splitWithGroup}
                          >
                            <option value="">-- Izaberi grupu --</option>
                            {userGroups.map(group => (
                              <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                          </select>
                        </div>

                        {selectedGroupId && (
                          <div>
                            <label className="block text-sm font-medium mb-3" style={{color: '#A5A4B6'}}>
                              Učesnici (uključujući tebe)
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {userGroups.find(g => g.id === selectedGroupId)?.members.map(member => (
                                <label
                                  key={member.userId}
                                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                                  style={{background: selectedParticipants.includes(member.userId) ? 'rgba(159, 112, 255, 0.1)' : 'transparent'}}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedParticipants.includes(member.userId)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedParticipants([...selectedParticipants, member.userId])
                                      } else {
                                        setSelectedParticipants(selectedParticipants.filter(id => id !== member.userId))
                                      }
                                    }}
                                    className="w-5 h-5 rounded accent-purple-500"
                                  />
                                  <span className="text-sm" style={{color: '#fff'}}>
                                    {member.user.name} {member.user.email ? `(${member.user.email})` : ''}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {selectedParticipants.length > 0 && (
                              <p className="text-xs mt-2" style={{color: '#A5A4B6'}}>
                                Svaki učesnik duguje: {amount && selectedParticipants.length > 0 ? (parseFloat(amount) / selectedParticipants.length).toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} {currency}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl font-semibold hover:bg-opacity-80 transition-all"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
                    style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)', boxShadow: '0 4px 12px rgba(159, 112, 255, 0.3)'}}
                  >
                    Dodaj trošak
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCancelEdit}>
            <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleCancelEdit}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <h2 className="text-2xl font-bold mb-6" style={{color: '#fff'}}>Izmeni trošak</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Naziv troška *</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="npr. Kupovina u prodavnici"
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                      style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                      style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    >
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Datum troška *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                  <CategorySelector
                    categories={categories}
                    selectedId={categoryId}
                    onSelect={setCategoryId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>Napomena (opciono)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Dodatne informacije..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors resize-none"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
                  />
                </div>

                {/* Recurring Section - Hidden for Savings category */}
                {!categories.find(c => c.id === categoryId)?.isSavings && (
                  <div className="rounded-xl p-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                        style={{background: isRecurring ? '#9F70FF' : 'rgba(159, 112, 255, 0.2)'}}
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-150 ease-in-out"
                          style={{transform: isRecurring ? 'translateX(26px)' : 'translateX(4px)'}}
                        />
                      </button>
                      <label className="text-sm font-medium text-white cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                        Ponavlja se
                      </label>
                    </div>

                    {isRecurring && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Vrsta ponavljanja</label>
                          <select
                            value={recurringType}
                            onChange={(e) => setRecurringType(e.target.value)}
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
                            value={nextRecurringDate}
                            onChange={(e) => setNextRecurringDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#9F70FF] transition-colors"
                            style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Split Info Section - read-only */}
                {editingExpense && editingExpense.splits && editingExpense.splits.length > 0 && (
                  <div className="rounded-xl p-4" style={{background: 'rgba(255, 179, 230, 0.05)', border: '1px solid rgba(255, 179, 230, 0.15)'}}>
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#FFB3E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 7H8M16 7H20M4 12H8M16 12H20M4 17H8M16 17H20" stroke="#FFB3E6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-sm font-medium" style={{color: '#FFB3E6'}}>
                        {editingExpense.splits.every((s: Split) => s.isPaid) ? 'Poravnato' : 'Podeljen trošak'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs" style={{color: '#A5A4B6'}}>
                        {editingExpense.splits.every((s: Split) => s.isPaid) ? 'Poravnato sa' : 'Podeljeno sa'} {editingExpense.splits.length} {editingExpense.splits.length === 1 ? 'osobom' : editingExpense.splits.length < 5 ? 'osobe' : 'osoba'}:
                      </p>
                      <div className="space-y-1">
                        {editingExpense.splits.map((split) => (
                          <div key={split.id} className="flex justify-between items-center text-sm">
                            <span style={{color: '#fff'}}>{split.owedBy.name}</span>
                            <span style={{color: '#FFB3E6'}}>{split.amount.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {editingExpense.currency || 'RSD'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 rounded-xl font-semibold hover:bg-opacity-80 transition-all"
                    style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
                    style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)', boxShadow: '0 4px 12px rgba(159, 112, 255, 0.3)'}}
                  >
                    Sačuvaj izmene
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDeleteModal(false)}>
            <div className="w-full max-w-md p-8 rounded-2xl relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
                style={{color: '#A5A4B6'}}
              >
                <X size={24} weight="bold" />
              </button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background: '#E4586E20', color: '#E4586E'}}>
                  <Trash size={32} weight="duotone" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Da li ste sigurni?</h2>
                <p style={{color: '#A5A4B6'}}>Trošak će biti trajno obrisan i neće moći da se vrati.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-semibold hover:bg-opacity-80 transition-all"
                  style={{background: '#E4586E15', color: '#E4586E', border: '1px solid #E4586E40'}}
                >
                  Obriši
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
                  style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)', boxShadow: '0 4px 12px rgba(159, 112, 255, 0.3)'}}
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{background: "rgba(0,0,0,0.5)"}}
            onClick={() => setShowBulkDeleteModal(false)}
          >
            <div 
              className="rounded-2xl p-6 max-w-md w-full"
              style={{background: "#1C1B29", border: "1px solid #2E2B44"}}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: "rgba(228, 88, 110, 0.15)"}}>
                  <Trash size={32} weight="duotone" style={{color: "#E4586E"}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{color: "#FFFFFF"}}>
                    Obrisati {selectedExpenses.size} troškova?
                  </h3>
                  <p className="text-sm" style={{color: "#FFFFFF", opacity: 0.7}}>
                    Svi izabrani troškovi će biti trajno obrisani i neće moći da se vrate.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={confirmBulkDelete}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300"
                    style={{background: "#E4586E", color: "#FFFFFF"}}
                  >
                    Obriši sve
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all duration-300"
                    style={{background: "linear-gradient(135deg, #9F70FF 0%, #1FBFA4 100%)", color: "#FFFFFF"}}
                  >
                    Otkaži
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Drawer */}
      <ExpenseFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        members={[]}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </div>
  )
}
