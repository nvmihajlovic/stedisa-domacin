'use client'

import { useState } from 'react'
import { CurrencyDollar, Pencil, Trash, Plus, TrendUp, Calendar, Target } from '@phosphor-icons/react'
import { getIcon } from '@/lib/iconMapping'

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

interface Props {
  goal: SavingsGoal
  onEdit: () => void
  onDelete: () => void
  onRefresh: () => void
}

export default function SavingsGoalCard({ goal, onEdit, onDelete, onRefresh }: Props) {
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [contributeAmount, setContributeAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  const isCompleted = progress >= 100
  const remaining = goal.targetAmount - goal.currentAmount

  const IconComponent = getIcon(goal.category.icon)

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      alert('Molimo unesite validan iznos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/savings/${goal.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(contributeAmount),
          currency: goal.currency,
          description: 'Ručno dodavanje',
          isAutomatic: false
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowContributeModal(false)
        setContributeAmount('')
        onRefresh()
      } else {
        alert('Greška: ' + data.error)
      }
    } catch (error) {
      console.error('Error contributing:', error)
      alert('Greška prilikom dodavanja sredstava')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
          border: `2px solid ${isCompleted ? '#22C55E' : 'rgba(255, 215, 0, 0.3)'}`,
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#2E2B44',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: goal.category.color
              }}
            >
              <IconComponent size={24} weight="duotone" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFF', marginBottom: '4px' }}>
                {goal.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 215, 0, 0.15)',
                    color: '#FFD700',
                    fontWeight: '500'
                  }}
                >
                  {goal.category.name}
                </span>
                {goal.isRecurring && (
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(159, 112, 255, 0.15)',
                      color: '#9F70FF',
                      fontWeight: '500'
                    }}
                  >
                    Automatsko
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              <Pencil size={18} weight="bold" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'rgba(239, 68, 68, 0.8)' }}
            >
              <Trash size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
              {goal.currentAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} {goal.currency}
            </span>
            <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: '600' }}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              height: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min(progress, 100)}%`,
                height: '100%',
                background: isCompleted
                  ? 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)'
                  : 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                transition: 'width 0.5s ease-in-out',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <Target size={20} weight="bold" style={{ color: '#9F70FF', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFF', marginBottom: '2px' }}>
              {goal.targetAmount.toLocaleString('sr-RS')}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Cilj</p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <TrendUp size={20} weight="bold" style={{ color: '#22C55E', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFF', marginBottom: '2px' }}>
              {remaining > 0 ? remaining.toLocaleString('sr-RS') : '0'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Preostalo</p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <Calendar size={20} weight="bold" style={{ color: '#3B82F6', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFF', marginBottom: '2px' }}>
              {goal.period === 'monthly' ? 'Mesečno' : 'Godišnje'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Period</p>
          </div>
        </div>

        {/* Recurring Info */}
        {goal.isRecurring && (
          <div
            className="mb-4 relative z-10"
            style={{
              background: 'rgba(159, 112, 255, 0.1)',
              border: '1px solid rgba(159, 112, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
              💜 Automatski se upisuje{' '}
              <span style={{ color: '#9F70FF', fontWeight: '600' }}>
                {goal.recurringAmount?.toLocaleString('sr-RS')} {goal.currency}
              </span>{' '}
              svakog {goal.recurringDayOfMonth}. dana u mesecu
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => setShowContributeModal(true)}
          disabled={isCompleted}
          className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 relative z-10"
          style={{
            background: isCompleted
              ? 'rgba(34, 197, 94, 0.2)'
              : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: isCompleted ? '#22C55E' : '#000',
            opacity: isCompleted ? 0.6 : 1,
            cursor: isCompleted ? 'not-allowed' : 'pointer'
          }}
        >
          {isCompleted ? '✓ Cilj ostvaren!' : (
            <span className="flex items-center justify-center gap-2">
              <Plus size={20} weight="bold" />
              Dodaj novac
            </span>
          )}
        </button>
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => setShowContributeModal(false)}
        >
          <div
            className="w-full max-w-md"
            style={{
              background: '#242236',
              borderRadius: '24px',
              padding: '32px',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#FFF', marginBottom: '8px' }}>
              Dodaj novac u štednju
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '24px' }}>
              {goal.name}
            </p>

            <form onSubmit={handleContribute}>
              <div className="mb-6">
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Iznos ({goal.currency})
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl"
                  style={{
                    background: '#1C1A2E',
                    border: '2px solid #2E2B44',
                    color: '#FFF',
                    fontSize: '18px',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-medium transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{
                    background: loading ? 'rgba(255, 215, 0, 0.5)' : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Dodavanje...' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
