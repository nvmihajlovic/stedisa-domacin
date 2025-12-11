"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "phosphor-react"

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<any[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [expRes, incRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/incomes')
      ])

      if (expRes.ok) {
        const expData = await expRes.json()
        setExpenses(expData)
      }

      if (incRes.ok) {
        const incData = await incRes.json()
        setIncomes(incData)
      }

      setLoading(false)
    } catch (err) {
      setError('Greška pri učitavanju podataka')
      setLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amountInRSD || e.amount), 0)
  const totalIncomes = incomes.reduce((sum, i) => sum + (i.amountInRSD || i.amount), 0)
  const balance = totalIncomes - totalExpenses

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Učitavanje...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Statistika</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-white/70 text-sm mb-2">Ukupni troškovi</h3>
            <p className="text-3xl font-bold text-red-400">
              {totalExpenses.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
            </p>
            <p className="text-white/50 text-sm mt-1">{expenses.length} transakcija</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-white/70 text-sm mb-2">Ukupni prihodi</h3>
            <p className="text-3xl font-bold text-green-400">
              {totalIncomes.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
            </p>
            <p className="text-white/50 text-sm mt-1">{incomes.length} transakcija</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-white/70 text-sm mb-2">Bilans</h3>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
            </p>
            <p className="text-white/50 text-sm mt-1">
              {balance >= 0 ? 'Pozitivan' : 'Negativan'}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Poslednje transakcije</h2>
          
          <div className="space-y-3">
            {[...expenses, ...incomes]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((item, index) => {
                const isExpense = 'categoryId' in item && !('incomeCategoryId' in item)
                return (
                  <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                    <div>
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-white/50 text-sm">
                        {new Date(item.date).toLocaleDateString('sr-RS')}
                      </p>
                    </div>
                    <p className={`text-lg font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                      {isExpense ? '-' : '+'}{item.amount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
