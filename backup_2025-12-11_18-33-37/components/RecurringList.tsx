'use client'

import { useState, useEffect } from 'react'
import { ArrowClockwise, Pause, Play, Trash, CalendarBlank, TrendUp, TrendDown } from '@phosphor-icons/react'

interface RecurringTransaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  description: string
  categoryId: string
  frequency: string
  dayOfMonth?: number | null
  dayOfWeek?: number | null
  isActive: boolean
  nextExecutionAt: string
  createdAt: string
}

const frequencyLabels: Record<string, string> = {
  daily: 'Dnevno',
  weekly: 'Nedeljno',
  monthly: 'Mesečno',
  yearly: 'Godišnje'
}

const dayNames = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota']

export default function RecurringList() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const typeParam = filter === 'all' ? '' : `?type=${filter}`
      const response = await fetch(`/api/recurring${typeParam}`)
      const result = await response.json()

      if (result.success) {
        setTransactions(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, type: string, currentlyActive: boolean) => {
    try {
      const response = await fetch(`/api/recurring/${id}?type=${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, isActive: !currentlyActive })
      })

      if (response.ok) {
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const deleteTransaction = async (id: string, type: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu recurring transakciju?')) {
      return
    }

    try {
      const response = await fetch(`/api/recurring/${id}?type=${type}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const getNextExecutionText = (date: string) => {
    const next = new Date(date)
    const now = new Date()
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Rok prošao'
    if (diffDays === 0) return 'Danas'
    if (diffDays === 1) return 'Sutra'
    if (diffDays <= 7) return `Za ${diffDays} dana`
    return next.toLocaleDateString('sr-RS')
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F70FF]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: filter === 'all' ? 'linear-gradient(135deg, #9F70FF, #7B4FD8)' : 'rgba(255, 255, 255, 0.05)',
            color: filter === 'all' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          Sve ({transactions.length})
        </button>
        <button
          onClick={() => setFilter('expense')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: filter === 'expense' ? 'linear-gradient(135deg, #FF6B6B, #EE5A6F)' : 'rgba(255, 255, 255, 0.05)',
            color: filter === 'expense' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          Troškovi ({transactions.filter(t => t.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilter('income')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: filter === 'income' ? 'linear-gradient(135deg, #45D38A, #3BC578)' : 'rgba(255, 255, 255, 0.05)',
            color: filter === 'income' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          Prihodi ({transactions.filter(t => t.type === 'income').length})
        </button>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <ArrowClockwise size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} className="mx-auto mb-3" />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Nemate recurring {filter === 'expense' ? 'troškove' : filter === 'income' ? 'prihode' : 'transakcije'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Kreirajte novu da automatski dodajete transakcije
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
                border: `1px solid ${
                  transaction.isActive ? 'rgba(159, 112, 255, 0.2)' : 'rgba(255,255,255,0.06)'
                }`,
                opacity: transaction.isActive ? 1 : 0.6
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          transaction.type === 'expense'
                            ? 'rgba(255, 107, 107, 0.15)'
                            : 'rgba(69, 211, 138, 0.15)'
                      }}
                    >
                      {transaction.type === 'expense' ? (
                        <TrendDown size={20} weight="bold" style={{ color: '#FF6B6B' }} />
                      ) : (
                        <TrendUp size={20} weight="bold" style={{ color: '#45D38A' }} />
                      )}
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {transaction.description}
                      </h3>
                      <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {frequencyLabels[transaction.frequency] || transaction.frequency}
                        {transaction.dayOfMonth && ` - ${transaction.dayOfMonth}. u mesecu`}
                        {transaction.dayOfWeek !== null && ` - ${dayNames[transaction.dayOfWeek]}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <CalendarBlank size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Sledeće: {getNextExecutionText(transaction.nextExecutionAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: transaction.type === 'expense' ? '#FF6B6B' : '#45D38A',
                        fontFamily: '"Inter", sans-serif'
                      }}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                      {transaction.amount.toLocaleString('sr-RS')} RSD
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                      {transaction.isActive ? 'Aktivno' : 'Pauzirano'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleActive(transaction.id, transaction.type, transaction.isActive)
                      }
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      title={transaction.isActive ? 'Pauziraj' : 'Aktiviraj'}
                    >
                      {transaction.isActive ? (
                        <Pause size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      ) : (
                        <Play size={18} style={{ color: '#45D38A' }} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id, transaction.type)}
                      className="p-2 rounded-lg transition-all hover:bg-red-500/10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      title="Obriši"
                    >
                      <Trash size={18} style={{ color: '#FF6B6B' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
