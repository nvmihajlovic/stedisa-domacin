'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, CurrencyDollar, TrendUp, Target, Calendar, Pencil, Trash } from '@phosphor-icons/react'
import SavingsGoalModal from '@/components/SavingsGoalModal'
import SavingsGoalCard from '@/components/SavingsGoalCard'
import { showToast } from '@/lib/toast'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  categoryId: string
  period: string
  targetDate: string | null
  isRecurring: boolean
  recurringFrequency: string | null
  recurringDayOfMonth: number | null
  recurringAmount: number | null
  color: string
  icon: string
  createdAt: string
  category: Category
  group: any
  contributions: any[]
}

export default function SavingsPage() {
  const router = useRouter()
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal')

  useEffect(() => {
    fetchSavingsGoals()
  }, [activeTab])

  const fetchSavingsGoals = async () => {
    try {
      setLoading(true)
      
      // Send groupFilter to backend - same logic as expenses page
      const groupFilter = activeTab === 'personal' ? 'personal' : 'all'
      console.log('🎯 Savings page - activeTab:', activeTab, 'groupFilter:', groupFilter)
      const response = await fetch(`/api/savings?groupFilter=${groupFilter}`)
      const data = await response.json()
      console.log('📥 Savings API response:', data)

      if (data.success) {
        setSavingsGoals(data.data)
        console.log('✅ Set savings goals:', data.data.length, 'goals')
      }
    } catch (error) {
      console.error('Error fetching savings goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = () => {
    setEditingGoal(null)
    setShowModal(true)
  }

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setShowModal(true)
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj cilj štednje?')) {
      return
    }

    try {
      const response = await fetch(`/api/savings/${goalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Cilj štednje uspešno obrisan', 'success')
        fetchSavingsGoals()
      } else {
        const data = await response.json()
        showToast(data.error || 'Greška prilikom brisanja cilja', 'error')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      showToast('Greška prilikom brisanja cilja', 'error')
    }
  }

  const handleModalClose = (refresh: boolean) => {
    setShowModal(false)
    setEditingGoal(null)
    if (refresh) {
      fetchSavingsGoals()
    }
  }

  // Calculate statistics
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const averageProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const activeGoalsCount = savingsGoals.filter(g => g.currentAmount < g.targetAmount).length

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #121421 0%, #0A0A0F 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 0'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4 transition-colors hover:text-white"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <ArrowLeft size={20} weight="bold" />
            <span>Nazad</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CurrencyDollar size={24} weight="fill" style={{ color: '#FFF' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#FFF', marginBottom: '4px' }}>
                  Štednja
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Pratite i ostvarujte vaše ciljeve štednje
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateGoal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000',
                fontWeight: '600'
              }}
            >
              <Plus size={20} weight="bold" />
              <span>Novi cilj</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
            style={{
              background: activeTab === 'personal' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'personal' ? '#FFD700' : 'rgba(255, 255, 255, 0.6)',
              border: activeTab === 'personal' ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            Lična štednja
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
            style={{
              background: activeTab === 'group' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'group' ? '#FFD700' : 'rgba(255, 255, 255, 0.6)',
              border: activeTab === 'group' ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            Grupna štednja
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '16px',
              padding: '20px'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <CurrencyDollar size={24} weight="bold" style={{ color: '#FFD700' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Ukupno uštedeno</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#FFD700' }}>
              {totalSaved.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
            </p>
          </div>

          <div
            style={{
              background: 'rgba(159, 112, 255, 0.1)',
              border: '1px solid rgba(159, 112, 255, 0.2)',
              borderRadius: '16px',
              padding: '20px'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target size={24} weight="bold" style={{ color: '#9F70FF' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Ciljani iznos</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#9F70FF' }}>
              {totalTarget.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
            </p>
          </div>

          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '16px',
              padding: '20px'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendUp size={24} weight="bold" style={{ color: '#22C55E' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Prosečan napredak</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#22C55E' }}>
              {averageProgress.toFixed(1)}%
            </p>
          </div>

          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '20px'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} weight="bold" style={{ color: '#3B82F6' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Aktivnih ciljeva</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#3B82F6' }}>
              {activeGoalsCount}
            </p>
          </div>
        </div>

        {/* Savings Goals List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              className="inline-block animate-spin"
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255, 215, 0, 0.2)',
                borderTopColor: '#FFD700',
                borderRadius: '50%'
              }}
            />
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '16px' }}>Učitavanje...</p>
          </div>
        ) : savingsGoals.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center'
            }}
          >
            <CurrencyDollar size={64} weight="duotone" style={{ color: 'rgba(255, 215, 0, 0.3)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFF', marginBottom: '8px' }}>
              Nemate postavljenih ciljeva štednje
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>
              Kreirajte svoj prvi cilj i počnite da štedite!
            </p>
            <button
              onClick={handleCreateGoal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#000',
                fontWeight: '600'
              }}
            >
              <Plus size={20} weight="bold" />
              <span>Kreiraj prvi cilj</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onRefresh={fetchSavingsGoals}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <SavingsGoalModal
          goal={editingGoal}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
