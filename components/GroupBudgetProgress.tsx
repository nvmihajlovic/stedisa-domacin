'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, AlertCircle, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react'
import BudgetStatistics from './BudgetStatistics'

interface GroupBudget {
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
  user: {
    id: string
    name: string
  }
  spent: number
  percentage: number
  remaining: number
  alert80Sent: boolean
  alert100Sent: boolean
}

interface GroupBudgetProgressProps {
  groupId: string
  isOwnerOrAdmin: boolean
  onAddBudget?: () => void
  onEditBudget?: (budget: GroupBudget) => void
}

export default function GroupBudgetProgress({
  groupId,
  isOwnerOrAdmin,
  onAddBudget,
  onEditBudget,
}: GroupBudgetProgressProps) {
  const [budgets, setBudgets] = useState<GroupBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (groupId) {
      fetchBudgets()
    }
  }, [groupId])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/group/budgets?groupId=${groupId}&period=MONTHLY`)
      if (!res.ok) throw new Error('Failed to fetch group budgets')
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      setBudgets(data)
    } catch (err) {
      console.error('Error fetching group budgets:', err)
      setError('Greška pri učitavanju grupnih budžeta')
    } finally {
      setLoading(false)
    }
  }

  const deleteBudget = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj grupni budžet?')) return

    try {
      const res = await fetch(`/api/group/budgets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete budget')
      
      setBudgets(budgets.filter(b => b.id !== id))
      console.log('✅ Group budget deleted')
    } catch (err) {
      console.error('Error deleting group budget:', err)
      alert('Greška pri brisanju budžeta')
    }
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-500'
    if (percentage >= 80) return 'text-orange-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
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
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Nema postavljenih grupnih budžeta
        </h3>
        <p className="text-gray-400 mb-4 text-sm">
          Postavite budžet za grupne troškove kako biste pratili zajedničku potrošnju
        </p>
        {isOwnerOrAdmin && onAddBudget && (
          <button
            onClick={onAddBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Dodaj grupni budžet
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
          Grupni budžeti
        </h3>
        {isOwnerOrAdmin && onAddBudget && (
          <button
            onClick={onAddBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Novi
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
                      <span className="text-2xl">{budget.category.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400">
                          {budget.period === 'MONTHLY' ? 'Mesečno' : 'Godišnje'} • Postavio: {budget.user.name}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-6 h-6 text-gray-400" />
                      <div>
                        <h4 className="font-semibold text-white">Ukupan grupni budžet</h4>
                        <p className="text-xs text-gray-400">
                          {budget.period === 'MONTHLY' ? 'Mesečno' : 'Godišnje'} • Postavio: {budget.user.name}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(isOwnerOrAdmin || budget.user.id === budget.userId) && onEditBudget && (
                    <button
                      onClick={() => onEditBudget(budget)}
                      className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                      title="Izmeni budžet"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {(isOwnerOrAdmin || budget.user.id === budget.userId) && (
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-1.5 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400"
                      title="Obriši budžet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                <div className="mt-3 flex items-start gap-2 bg-orange-900/20 border border-orange-500/30 rounded p-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-400">
                    {percentage >= 100
                      ? '⚠️ Grupni budžet prekoračen!'
                      : `⚠️ Grupa je potrošila ${percentage}% budžeta`}
                  </p>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(budget.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2 rounded hover:bg-gray-700/30"
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
