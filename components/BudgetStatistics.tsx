'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, Package, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface CategorySpending {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  spent: number
  percentage: number
}

interface BudgetStatisticsProps {
  budgetId: string
  budgetAmount: number
  budgetPeriod: 'MONTHLY' | 'YEARLY'
  categoryId: string | null
  categoryName: string | null
}

export default function BudgetStatistics({
  budgetId,
  budgetAmount,
  budgetPeriod,
  categoryId,
  categoryName,
}: BudgetStatisticsProps) {
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryBreakdown()
  }, [budgetId])

  const fetchCategoryBreakdown = async () => {
    try {
      setLoading(true)
      const period = budgetPeriod.toLowerCase()
      const res = await fetch(`/api/budgets/${budgetId}/breakdown?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch breakdown')
      
      const text = await res.text()
      const data = text ? JSON.parse(text) : { categories: [], totalSpent: 0 }
      setCategorySpending(data.categories || [])
      setTotalSpent(data.totalSpent || 0)
    } catch (err) {
      console.error('Error fetching budget breakdown:', err)
    } finally {
      setLoading(false)
    }
  }

  const percentage = Math.round((totalSpent / budgetAmount) * 100)

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800/30 rounded-lg p-4 h-40" />
    )
  }

  if (categoryId) {
    // Za budžet pojedinačne kategorije, prikaži samo osnovne informacije
    return (
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300">
            Pregled potrošnje
          </h4>
          <span className={`text-sm font-semibold ${
            percentage >= 100 ? 'text-red-400' :
            percentage >= 80 ? 'text-orange-400' :
            percentage >= 50 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {percentage}%
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Potrošeno:</span>
            <span className="text-white font-medium">
              {totalSpent.toLocaleString('sr-RS')} RSD
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Preostalo:</span>
            <span className="text-white font-medium">
              {(budgetAmount - totalSpent).toLocaleString('sr-RS')} RSD
            </span>
          </div>
        </div>

        {percentage >= 80 && (
          <div className={`mt-3 p-2 rounded ${
            percentage >= 100 ? 'bg-red-900/20 border border-red-500/30' : 'bg-orange-900/20 border border-orange-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${percentage >= 100 ? 'text-red-400' : 'text-orange-400'}`} />
              <p className={`text-xs ${percentage >= 100 ? 'text-red-400' : 'text-orange-400'}`}>
                {percentage >= 100 
                  ? 'Budžet prekoračen!' 
                  : 'Blizu ste limita budžeta'}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Za ukupan budžet, prikaži detaljnu statistiku po kategorijama
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Package className="w-4 h-4" />
          Potrošnja po kategorijama
        </h4>
        <span className={`text-sm font-semibold ${
          percentage >= 100 ? 'text-red-400' :
          percentage >= 80 ? 'text-orange-400' :
          percentage >= 50 ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {totalSpent.toLocaleString('sr-RS')} / {budgetAmount.toLocaleString('sr-RS')} RSD
        </span>
      </div>

      {categorySpending.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
          <p className="text-sm">Još nemate troškova u ovom periodu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categorySpending.slice(0, 5).map((cat) => (
            <div key={cat.categoryId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">{cat.categoryName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">
                    {cat.spent.toLocaleString('sr-RS')} RSD
                  </span>
                  <span className={`text-xs font-medium w-12 text-right ${
                    cat.percentage >= 40 ? 'text-rose-400' :
                    cat.percentage >= 30 ? 'text-orange-400' :
                    cat.percentage >= 20 ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    cat.percentage >= 40 ? 'bg-gradient-to-r from-rose-400 to-pink-500' :
                    cat.percentage >= 30 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                    cat.percentage >= 20 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}

          {categorySpending.length > 5 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              +{categorySpending.length - 5} još kategorija
            </p>
          )}
        </div>
      )}

      {percentage >= 80 && (
        <div className={`mt-4 p-3 rounded ${
          percentage >= 100 ? 'bg-red-900/20 border border-red-500/30' : 'bg-orange-900/20 border border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${percentage >= 100 ? 'text-red-400' : 'text-orange-400'}`} />
            <p className={`text-sm font-medium ${percentage >= 100 ? 'text-red-400' : 'text-orange-400'}`}>
              {percentage >= 100 
                ? `Prekoračen budžet za ${(totalSpent - budgetAmount).toLocaleString('sr-RS')} RSD` 
                : `Preostalo samo ${(budgetAmount - totalSpent).toLocaleString('sr-RS')} RSD`}
            </p>
          </div>
          <p className={`text-xs ${percentage >= 100 ? 'text-red-300' : 'text-orange-300'}`}>
            {percentage >= 100 
              ? 'Razmotrz smanjenje troškova da bi ste se vratili u okvir budžeta.' 
              : 'Blizu ste prekoračenja budžeta. Pažljivo kontrolišite potrošnju.'}
          </p>
        </div>
      )}
    </div>
  )
}
