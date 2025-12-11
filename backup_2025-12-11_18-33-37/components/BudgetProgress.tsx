'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, AlertCircle, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Target, Calendar, CalendarRange } from 'lucide-react'
import BudgetStatistics from './BudgetStatistics'
import { getIcon } from '@/lib/iconMapping'

interface Budget {
  id: string
  amount: number
  period: 'MONTHLY' | 'YEARLY'
  categoryId: string | null
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  spent: number
  percentage: number
  remaining: number
  alert80Sent: boolean
  alert100Sent: boolean
}

interface BudgetProgressProps {
  onAddBudget?: () => void
  onEditBudget?: (budget: Budget) => void
}

export default function BudgetProgress({ onAddBudget, onEditBudget }: BudgetProgressProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/budgets?period=MONTHLY')
      if (!res.ok) throw new Error('Failed to fetch budgets')
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      setBudgets(data)
    } catch (err) {
      console.error('Error fetching budgets:', err)
      setError('Greška pri učitavanju budžeta')
    } finally {
      setLoading(false)
    }
  }

  const deleteBudget = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj budžet?')) return

    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete budget')
      
      setBudgets(budgets.filter(b => b.id !== id))
      console.log('✅ Budget deleted')
    } catch (err) {
      console.error('Error deleting budget:', err)
      alert('Greška pri brisanju budžeta')
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-gradient-to-r from-rose-400 to-pink-500'
    if (percentage >= 80) return 'bg-gradient-to-r from-orange-400 to-amber-500'
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-400 to-amber-400'
    return 'bg-gradient-to-r from-emerald-400 to-green-500'
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-rose-400'
    if (percentage >= 80) return 'text-orange-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const toggleExpanded = (budgetId: string) => {
    setExpandedBudgets(prev => {
      const next = new Set(prev)
      if (next.has(budgetId)) {
        next.delete(budgetId)
      } else {
        next.add(budgetId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4 h-24" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
        <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Nema postavljenih budžeta
        </h3>
        <p className="text-gray-400 mb-4">
          Postavite mesečni budžet za kategorije kako biste pratili potrošnju
        </p>
        {onAddBudget && (
          <button
            onClick={onAddBudget}
            className="group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto overflow-hidden"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" style={{color: '#60A5FA'}} />
            <span className="relative z-10" style={{color: '#60A5FA'}}>Dodaj budžet</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Mesečni budžeti
        </h3>
        {onAddBudget && (
          <button
            onClick={onAddBudget}
            className="group relative px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2.5 text-sm overflow-hidden"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" style={{color: '#60A5FA'}} />
            <span className="relative z-10" style={{color: '#60A5FA'}}>Novi</span>
          </button>
        )}
      </div>

      {budgets.map(budget => {
        const percentage = Math.round(budget.percentage)
        const progressColor = getProgressColor(percentage)
        const textColor = getTextColor(percentage)
        const isExpanded = expandedBudgets.has(budget.id)

        return (
          <div
            key={budget.id}
            className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {budget.category ? (
                    <>
                      {(() => {
                        const IconComponent = getIcon(budget.category.icon)
                        return (
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#2E2B44', color: budget.category.color }}
                          >
                            <IconComponent size={24} weight="duotone" />
                          </div>
                        )
                      })()}
                      <div>
                        <h4 className="font-semibold text-white">
                          {budget.category.name}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {budget.period === 'MONTHLY' ? (
                            <><Calendar className="w-3 h-3" /> Mesečno</>
                          ) : (
                            <><CalendarRange className="w-3 h-3" /> Godišnje</>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2E2B44' }}>
                        <Target className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Ukupan budžet</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {budget.period === 'MONTHLY' ? (
                            <><Calendar className="w-3 h-3" /> Mesečno</>
                          ) : (
                            <><CalendarRange className="w-3 h-3" /> Godišnje</>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onEditBudget && (
                    <button
                      onClick={() => onEditBudget(budget)}
                      className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: 'rgba(159, 112, 255, 0.1)',
                        border: '1px solid rgba(159, 112, 255, 0.2)',
                      }}
                    >
                      <Pencil className="w-4 h-4" style={{color: '#9F70FF'}} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                    style={{
                      background: 'rgba(251, 113, 133, 0.1)',
                      border: '1px solid rgba(251, 113, 133, 0.2)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" style={{color: '#FB7185'}} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-400">
                    Potrošeno:{' '}
                    <span className={`font-semibold ${textColor}`}>
                      {budget.spent.toLocaleString('sr-RS')} RSD
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    od {budget.amount.toLocaleString('sr-RS')} RSD
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${textColor}`}>
                    {percentage}%
                  </p>
                  {budget.remaining > 0 ? (
                    <p className="text-xs text-gray-400">
                      Preostalo: {budget.remaining.toLocaleString('sr-RS')} RSD
                    </p>
                  ) : (
                    <p className="text-xs text-red-400">
                      Prekoračenje: {Math.abs(budget.remaining).toLocaleString('sr-RS')} RSD
                    </p>
                  )}
                </div>
              </div>

              {/* Warning */}
              {percentage >= 80 && (
                <div className="mt-3 flex items-start gap-2 rounded-xl p-3" style={{
                  background: 'rgba(251, 146, 60, 0.1)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color: '#FB923C'}} />
                  <p className="text-xs" style={{color: '#FB923C'}}>
                    {percentage >= 100
                      ? '⚠️ Prekoračili ste budžet!'
                      : `⚠️ Potrošili ste ${percentage}% budžeta`}
                  </p>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(budget.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(159, 112, 255, 0.05)',
                  border: '1px solid rgba(159, 112, 255, 0.15)',
                  color: '#9F70FF'
                }}
              >
                <span>
                  {isExpanded ? 'Sakrij detalje' : 'Prikaži detalje po kategorijama'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-700 bg-gray-900/30 p-4">
                <BudgetStatistics
                  budgetId={budget.id}
                  budgetAmount={budget.amount}
                  budgetPeriod={budget.period}
                  categoryId={budget.category?.id || null}
                  categoryName={budget.category?.name || null}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
