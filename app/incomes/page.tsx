"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash, CalendarBlank, CreditCard, X, TrendUp, CurrencyCircleDollar, PencilSimple, CaretLeft, CaretRight, Repeat, Funnel, DownloadSimple, FilePdf, FileText } from "phosphor-react";
import CategorySelector from "@/lib/components/CategorySelector";
import ReceiptUploader from "@/lib/components/ReceiptUploader";
import HelpButton from "@/components/HelpButton";
import { getIcon } from "@/lib/iconMapping";
import { generatePDFReport, downloadPDF } from "@/lib/pdf-generator";
import { showToast } from "@/lib/toast";
import ConvertedAmount from "@/components/ConvertedAmount";
import IncomeFilters from "@/components/IncomeFilters";

interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLoanRepayment: boolean;
}

interface RecurringIncome {
  id: string;
  frequency: string;
  nextExecutionAt: string;
}

interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
  loanRepaymentAmount: number | null;
  category: IncomeCategory;
  recurringIncome?: RecurringIncome | null;
  note?: string | null;
  currency?: string | null;
}

export default function IncomesPage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  
  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [currency, setCurrency] = useState("RSD");
  const [loanRepaymentAmount, setLoanRepaymentAmount] = useState("");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Recurring fields
  const [recurringType, setRecurringType] = useState("monthly");
  const [nextRecurringDate, setNextRecurringDate] = useState(new Date().toISOString().split('T')[0]);

  // Current month/year
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

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

  // Bulk operations state
  const [selectedIncomes, setSelectedIncomes] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  // Export state
  const [exportLoading, setExportLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const formatNumber = (num: number) => {
    return num.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
    
    // Listen for settlement updates - real-time refresh
    const handleSettlementUpdate = () => {
      console.log('🔄 Settlement updated, refreshing incomes...')
      fetchIncomes()
    }
    
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [month, year]);

  const fetchIncomes = async () => {
    const res = await fetch(`/api/incomes?month=${month}&year=${year}`);
    if (res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setIncomes(data);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/income-categories");
    if (res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      // Filter only active categories
      setCategories(data.filter((cat: any) => cat.isActive !== false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/incomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        date,
        categoryId,
        currency,
        loanRepaymentAmount: loanRepaymentAmount ? parseFloat(loanRepaymentAmount) : null,
        note: note || null,
        isRecurring,
        recurringType: isRecurring ? recurringType : null,
        nextRecurringDate: isRecurring ? nextRecurringDate : null
      }),
    });

    if (res.ok) {
      setShowModal(false);
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategoryId("");
      setCurrency("RSD");
      setLoanRepaymentAmount("");
      setNote("");
      setIsRecurring(false);
      setRecurringType("monthly");
      setNextRecurringDate(new Date().toISOString().split('T')[0]);
      showToast("Prihod uspešno dodat", "success");
      fetchIncomes();
    } else {
      showToast("Greška pri dodavanju prihoda", "error");
    }
  };

  const handleEdit = (income: Income) => {
    console.log('🔍 Editing income:', income)
    console.log('Currency from income:', income.currency)
    setEditingIncome(income)
    setAmount(income.amount.toString())
    setDescription(income.description)
    setDate(income.date.split('T')[0])
    setCategoryId(income.category.id)
    setCurrency(income.currency || 'RSD')
    console.log('Set currency to:', income.currency || 'RSD')
    setNote(income.note || '')
    setLoanRepaymentAmount(income.loanRepaymentAmount?.toString() || "")
    setIsRecurring(!!income.recurringIncome)
    setRecurringType(income.recurringIncome?.frequency || 'monthly')
    setNextRecurringDate(income.recurringIncome?.nextExecutionAt ? income.recurringIncome.nextExecutionAt.split('T')[0] : new Date().toISOString().split('T')[0])
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIncome) return
    
    const res = await fetch(`/api/incomes/${editingIncome.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        date,
        categoryId,
        currency,
        loanRepaymentAmount: loanRepaymentAmount ? parseFloat(loanRepaymentAmount) : null,
        note: note || null,
        isRecurring,
        recurringType: isRecurring ? recurringType : null,
        nextRecurringDate: isRecurring ? nextRecurringDate : null
      })
    })
    
    if (res.ok) {
      setShowEditModal(false)
      setEditingIncome(null)
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId("")
      setCurrency("RSD")
      setLoanRepaymentAmount("")
      setNote("")
      setIsRecurring(false)
      setRecurringType("monthly")
      setNextRecurringDate(new Date().toISOString().split('T')[0])
      showToast("Prihod uspešno aźuriran", "success")
      fetchIncomes()
    } else {
      showToast('Greška pri ažuriranju prihoda', 'error')
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingIncome(null)
    setAmount("")
    setDescription("")
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId("")
    setCurrency("RSD")
    setLoanRepaymentAmount("")
    setNote("")
    setIsRecurring(false)
    setRecurringType("monthly")
    setNextRecurringDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj prihod?")) {
      return;
    }

    const res = await fetch(`/api/incomes/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Prihod uspešno obrisan", "success");
      fetchIncomes();
    } else {
      showToast("Greška pri brisanju prihoda", "error");
    }
  };

  // Bulk operations handlers
  const toggleSelectIncome = (incomeId: string) => {
    const newSelected = new Set(selectedIncomes)
    if (newSelected.has(incomeId)) {
      newSelected.delete(incomeId)
    } else {
      newSelected.add(incomeId)
    }
    setSelectedIncomes(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIncomes.size === filteredIncomes.length && filteredIncomes.length > 0) {
      setSelectedIncomes(new Set())
    } else {
      setSelectedIncomes(new Set(filteredIncomes.map(i => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIncomes.size === 0) return
    
    if (!confirm(`Da li ste sigurni da želite da obrišete ${selectedIncomes.size} prihoda?`)) {
      return
    }

    setBulkDeleteLoading(true)
    
    try {
      const res = await fetch("/api/incomes/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomeIds: Array.from(selectedIncomes) }),
      })

      if (res.ok) {
        const data = await res.json()
        showToast(data.message || `Obrisano ${selectedIncomes.size} prihoda`, "success")
        setSelectedIncomes(new Set())
        fetchIncomes()
      } else {
        const error = await res.json()
        showToast(error.error || "Greška pri brisanju", "error")
      }
    } catch (error) {
      console.error("Bulk delete error:", error)
      showToast("Greška pri brisanju prihoda", "error")
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedIncomes(new Set())
  }

  // Export functions
  const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    setExportLoading(true)

    try {
      // Use filtered incomes for export
      const incomeIds = filteredIncomes.map(i => i.id).join(',')
      
      const url = `/api/incomes/export?incomeIds=${encodeURIComponent(incomeIds)}&format=${format}`

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `prihodi_${year}-${month.toString().padStart(2, '0')}.${format}`
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
      // Use filtered incomes for PDF export
      const incomeIds = filteredIncomes.map(i => i.id).join(',')

      // Fetch data for PDF
      const response = await fetch(`/api/export/pdf-data?incomeIds=${encodeURIComponent(incomeIds)}`)
      if (!response.ok) throw new Error('Failed to fetch PDF data')
      
      const data = await response.json()
      
      // Generate PDF
      const pdfBlob = await generatePDFReport(data)
      
      // Download PDF
      const filename = `prihodi_${year}-${month.toString().padStart(2, '0')}.pdf`
      downloadPDF(pdfBlob, filename)

      showToast('PDF izveštaj uspešno preuzet!', 'success')
    } catch (error) {
      console.error('PDF export error:', error)
      showToast('Greška pri kreiranju PDF izveštaja', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  // Filter and search logic
  const getFilteredIncomes = () => {
    let filtered = [...incomes]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(income => 
        income.description.toLowerCase().includes(query) ||
        income.category.name.toLowerCase().includes(query) ||
        income.note?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (filters.dateRange === 'today') {
        filtered = filtered.filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate >= today
        })
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate >= weekAgo
        })
      } else if (filters.dateRange === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        filtered = filtered.filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate >= monthStart
        })
      } else if (filters.dateRange === 'custom' && filters.customDateFrom && filters.customDateTo) {
        const from = new Date(filters.customDateFrom)
        const to = new Date(filters.customDateTo)
        to.setHours(23, 59, 59, 999)
        filtered = filtered.filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate >= from && incomeDate <= to
        })
      }
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(income => 
        filters.categories.includes(income.category.id)
      )
    }

    // Apply amount range filter
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(income => income.amount >= filters.minAmount!)
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(income => income.amount <= filters.maxAmount!)
    }

    return filtered
  }

  const filteredIncomes = getFilteredIncomes()
  const hasActiveFilters = 
    filters.dateRange !== 'all' ||
    filters.categories.length > 0 ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined ||
    searchQuery.trim() !== ''

  // Group incomes by currency and calculate totals
  const totalsByCurrency = incomes.reduce((acc, income) => {
    const currency = income.currency || 'RSD'
    if (!acc[currency]) {
      acc[currency] = 0
    }
    acc[currency] += income.amount
    return acc
  }, {} as Record<string, number>)

  // Ukupan iznos u RSD (koristi konvertovane iznose)
  const totalInRSD = incomes.reduce((sum, income) => sum + ((income as any).amountInRSD || income.amount), 0)

  const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-10 lg:px-14 mt-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-fintech-gradient bg-clip-text text-transparent mb-4">
              Prihodi
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
          <div className="flex gap-4">
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

        {/* Header Card - Ukupni prihodi */}
        <div className="rounded-3xl relative p-6 lg:p-7 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)', height: '120px', marginBottom: '32px'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-sm font-semibold" style={{color: 'rgba(255,255,255,0.55)', fontFamily: '"Inter", sans-serif'}}>Ukupni prihodi</div>
            <TrendUp size={20} weight="duotone" style={{color: '#6FFFC4'}} />
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
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: 'rgba(111, 255, 196, 0.15)', color: '#6FFFC4', border: '1px solid rgba(111, 255, 196, 0.2)'}}>
            {monthNames[month - 1]} {year}
          </div>
        </div>

        {/* Main Card - Lista prihoda */}
        <div className="p-1 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(135deg, rgba(40,234,138,0.25) 0%, rgba(31,184,255,0.25) 100%)'}}>
          <div className="rounded-3xl backdrop-blur-xl p-6 lg:p-7 pb-8" style={{background: 'rgba(20, 18, 38, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)'}}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <CurrencyCircleDollar size={36} weight="duotone" className="mb-4" style={{color: '#D3FFF2'}} />
                <h3 className="text-xl font-semibold mb-2" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Prihodi</h3>
                <p className="text-sm" style={{color: '#D3FFF2', opacity: 0.7}}>Pratite svoje prihode</p>
              </div>
            </div>
            
            {incomes.length === 0 ? (
              <div className="text-center py-12" style={{color: '#A5A4B6'}}>
                Nemate prihoda za ovaj mesec. Dodajte prvi!
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
                      placeholder="Pretraži prihode..."
                      className="w-full px-4 py-3 pl-12 rounded-xl backdrop-blur-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
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
                        ? 'linear-gradient(135deg, #63E6BE 0%, #20C997 100%)' 
                        : 'rgba(99, 230, 190, 0.15)',
                      border: '1px solid rgba(99, 230, 190, 0.3)',
                      color: hasActiveFilters ? '#FFFFFF' : '#63E6BE'
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

                {/* Bulk Actions Bar */}
                {selectedIncomes.size > 0 && (
                  <div className="mb-4 flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#D3FFF2'}}>
                        {selectedIncomes.size === 1 ? '1 prihod izabran' : `${selectedIncomes.size} prihoda izabrano`}
                      </span>
                      <button
                        onClick={clearSelection}
                        className="text-xs px-3 py-1 rounded-lg hover:opacity-80 transition-all"
                        style={{background: 'rgba(255, 255, 255, 0.1)', color: '#D3FFF2'}}
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
                        <span className="relative z-10" style={{color: '#FF6B9D'}}>{bulkDeleteLoading ? "Brisanje..." : `Obriši (${selectedIncomes.size})`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Select All Checkbox */}
                <div className="mb-3 flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filteredIncomes.length > 0 && selectedIncomes.size === filteredIncomes.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{accentColor: '#45D38A'}}
                    />
                    <span className="text-sm" style={{color: '#D3FFF2', opacity: 0.7}}>
                      {selectedIncomes.size === filteredIncomes.length && filteredIncomes.length > 0 ? 'Poništi sve' : 'Izaberi sve'}
                    </span>
                  </div>
                  
                  {/* Export buttons (visible when no selection) */}
                  {selectedIncomes.size === 0 && (
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
                    </div>
                  )}
                </div>

                {/* Filtered Results Info */}
                {hasActiveFilters && (
                  <div className="mb-4 p-3 rounded-xl flex items-center justify-between" style={{background: 'rgba(99, 230, 190, 0.1)', border: '1px solid rgba(99, 230, 190, 0.2)'}}>
                    <span className="text-sm" style={{color: '#D3FFF2'}}>
                      Prikazano {filteredIncomes.length} od {incomes.length} prihoda
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
                      style={{background: 'rgba(255, 255, 255, 0.1)', color: '#D3FFF2'}}
                    >
                      Resetuj filtere
                    </button>
                  </div>
                )}

                {filteredIncomes.length === 0 ? (
                  <div className="text-center py-12" style={{color: '#A5A4B6'}}>
                    {hasActiveFilters 
                      ? 'Nema prihoda koji odgovaraju filterima.' 
                      : 'Nemate prihoda.'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 lg:gap-4 pb-4">
                    {filteredIncomes.map((income) => {
                  const IconComponent = getIcon(income.category.icon);
                  return (
                    <div 
                      key={income.id}
                      className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]"
                      style={{border: '1px solid rgba(255, 255, 255, 0.04)'}}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Checkbox for bulk selection */}
                        <input
                          type="checkbox"
                          checked={selectedIncomes.has(income.id)}
                          onChange={() => toggleSelectIncome(income.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                          style={{accentColor: '#45D38A'}}
                        />
                        
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: 'rgba(111, 255, 196, 0.15)', border: '1px solid rgba(111, 255, 196, 0.2)', boxShadow: '0 0 15px rgba(111, 255, 196, 0.2)'}}>
                          <IconComponent size={18} weight="duotone" style={{color: '#6FFFC4'}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold truncate" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>{income.description}</div>
                            {income.recurringIncome && (
                              <div className="flex-shrink-0 px-2 py-0.5 rounded-xl flex items-center gap-1" style={{background: 'rgba(69, 211, 138, 0.12)', border: '1px solid rgba(69, 211, 138, 0.25)'}}>
                                <Repeat size={12} weight="bold" style={{color: '#45D38A'}} />
                                <span className="text-xs font-medium" style={{color: '#45D38A'}}>
                                  {income.recurringIncome.frequency === 'monthly' ? 'Mesečno' : 
                                   income.recurringIncome.frequency === 'weekly' ? 'Nedeljno' : 'Godišnje'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm" style={{color: '#D3FFF2', opacity: 0.6}}>
                            {income.category?.name}
                            {income.recurringIncome && (
                              <span className="ml-2">
                                • Sledeće: {new Date(income.recurringIncome.nextExecutionAt).toLocaleDateString('sr-RS')}
                              </span>
                            )}
                          </div>
                          {income.note && (
                            <div className="text-xs mt-1 italic" style={{color: '#A5A4B6', opacity: 0.8}}>
                              {income.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <div className="text-lg whitespace-nowrap" style={{color: '#C6FFE6', fontFamily: '"Inter", sans-serif', textShadow: '0 0 5px rgba(198, 255, 230, 0.1)'}}>
                            <span style={{fontWeight: 700}}>+</span><span style={{fontWeight: 500}}>{formatNumber(income.amount)}</span> <span style={{fontSize: '0.75em', opacity: 0.6, marginLeft: '2px'}}>{income.currency || "RSD"}</span>
                          </div>
                          {income.currency && income.currency !== 'RSD' && (
                            <ConvertedAmount 
                              amount={income.amount} 
                              fromCurrency={income.currency} 
                              toCurrency="RSD"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleEdit(income)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                          style={{background: 'rgba(111, 255, 196, 0.1)', border: '1px solid rgba(111, 255, 196, 0.2)'}}
                        >
                          <PencilSimple size={16} weight="duotone" style={{color: '#6FFFC4'}} />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                          style={{background: 'rgba(111, 255, 196, 0.1)', border: '1px solid rgba(111, 255, 196, 0.2)'}}
                        >
                          <Trash size={16} weight="duotone" style={{color: '#6FFFC4'}} />
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
                className="w-full py-3 rounded-xl font-semibold hover:scale-[1.01] hover:opacity-95 transition-all cursor-pointer border border-white/10"
                style={{background: 'rgba(0, 0, 0, 0.28)', color: '#D3FFF2', fontFamily: '"Inter", "Poppins", sans-serif', fontWeight: 600}}
              >
                + Dodaj prihod
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-[#1C1A2E] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
              style={{color: '#A5A4B6'}}
            >
              <X size={24} weight="bold" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Novi prihod</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv prihoda *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="npr. Plata, Honorar..."
                  className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                    required
                  >
                    <option value="RSD">RSD</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                {!categoryId && (
                  <p className="text-xs mb-3" style={{color: '#7A7A8C'}}>Izaberi kategoriju prihoda</p>
                )}
                <CategorySelector
                  categories={categories}
                  selectedId={categoryId}
                  onSelect={setCategoryId}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Otplata zajma (opciono)</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanRepaymentAmount}
                  onChange={(e) => setLoanRepaymentAmount(e.target.value)}
                  placeholder="Unesite ako je deo otplate zajma"
                  className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                />
                <p className="text-xs mt-1" style={{color: '#7A7A8C'}}>Za praćenje povraćaja novca koji ste pozajmili</p>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena (opciono)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dodatne informacije..."
                  rows={3}
                  className="w-full bg-[#242236] border border-[#3a3850] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#45D38A] transition-colors resize-none"
                />
              </div>

              {/* Recurring Section */}
              <div className="rounded-xl p-4" style={{background: 'rgba(69, 211, 138, 0.05)', border: '1px solid rgba(69, 211, 138, 0.15)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                    style={{background: isRecurring ? '#45D38A' : 'rgba(69, 211, 138, 0.2)'}}
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
                        value={nextRecurringDate}
                        onChange={(e) => setNextRecurringDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                        style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#242236] text-white py-3 rounded-xl hover:bg-[#2a2840] transition-colors"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white py-3 rounded-xl hover:opacity-90 transition-all"
                  style={{background: 'linear-gradient(135deg, #45D38A, #2ECC71)', boxShadow: '0 4px 12px rgba(69, 211, 138, 0.3)'}}
                >
                  Dodaj prihod
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
            <h2 className="text-2xl font-bold mb-6" style={{color: '#fff'}}>Izmeni prihod</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Naziv prihoda *</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="npr. Plata..." className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Iznos *</label>
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Valuta</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}>
                    <option value="RSD">RSD</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Datum *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} required />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Kategorija *</label>
                <CategorySelector
                  categories={categories}
                  selectedId={categoryId}
                  onSelect={setCategoryId}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Otplata zajma</label>
                <input type="number" step="0.01" value={loanRepaymentAmount} onChange={(e) => setLoanRepaymentAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{color: '#A5A4B6'}}>Napomena</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl outline-none resize-none" style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}} />
              </div>

              {/* Recurring Section */}
              <div className="rounded-xl p-4" style={{background: 'rgba(69, 211, 138, 0.05)', border: '1px solid rgba(69, 211, 138, 0.15)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-in-out"
                    style={{background: isRecurring ? '#45D38A' : 'rgba(69, 211, 138, 0.2)'}}
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
                        value={nextRecurringDate}
                        onChange={(e) => setNextRecurringDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border text-white focus:outline-none focus:border-[#45D38A] transition-colors"
                        style={{background: '#1C1A2E', borderColor: '#2E2B44'}}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCancelEdit} className="flex-1 bg-[#242236] text-white py-3 rounded-xl hover:bg-[#2a2840] transition-colors">Otkaži</button>
                <button type="submit" className="flex-1 text-white py-3 rounded-xl hover:opacity-90 transition-all" style={{background: 'linear-gradient(135deg, #45D38A, #2ECC71)', boxShadow: '0 4px 12px rgba(69, 211, 138, 0.3)'}}>Sačuvaj izmene</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton page="incomes" />

      {/* Filters Drawer */}
      <IncomeFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        members={[]}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </div>
  );
}
