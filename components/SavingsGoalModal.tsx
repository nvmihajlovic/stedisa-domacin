'use client'

import { useState, useEffect } from 'react'
import { X, CurrencyDollar, Calendar, Target, Repeat } from '@phosphor-icons/react'
import CategorySelector from '@/lib/components/CategorySelector'
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
}

interface Props {
  goal: SavingsGoal | null
  onClose: (refresh: boolean) => void
}

export default function SavingsGoalModal({ goal, onClose }: Props) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currency, setCurrency] = useState('RSD')
  const [categoryId, setCategoryId] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [targetDate, setTargetDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(1)
  const [recurringAmount, setRecurringAmount] = useState('')
  const [isGroup, setIsGroup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchCategories()

    if (goal) {
      setName(goal.name)
      setTargetAmount(goal.targetAmount.toString())
      setCurrency(goal.currency)
      setCategoryId(goal.categoryId)
      setPeriod(goal.period)
      setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '')
      setIsRecurring(goal.isRecurring)
      setRecurringFrequency(goal.recurringFrequency || 'monthly')
      setRecurringDayOfMonth(goal.recurringDayOfMonth || 1)
      setRecurringAmount(goal.recurringAmount?.toString() || '')
    } else {
      setRecurringDayOfMonth(new Date().getDate())
    }
  }, [goal])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      console.log('📂 Categories response:', data)
      
      // API returns array directly, not {success: true, categories: [...]}
      if (Array.isArray(data)) {
        setCategories(data)
        console.log('✅ Categories loaded:', data.length)
      } else if (data.error) {
        console.error('❌ Categories fetch error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {[key: string]: string} = {}

    if (!name) newErrors.name = 'Naziv je obavezan'
    if (!targetAmount) newErrors.targetAmount = 'Ciljani iznos je obavezan'
    if (!categoryId) newErrors.categoryId = 'Kategorija je obavezna'
    if (isRecurring && !recurringAmount) newErrors.recurringAmount = 'Iznos mesečne štednje je obavezan'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const url = goal ? `/api/savings/${goal.id}` : '/api/savings'
      const method = goal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetAmount: parseFloat(targetAmount),
          currency,
          categoryId,
          period,
          targetDate: targetDate || null,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
          recurringDayOfMonth: isRecurring ? recurringDayOfMonth : null,
          recurringAmount: isRecurring ? parseFloat(recurringAmount) : null,
          groupId: null, // TODO: Add group support
          color: '#FFD700',
          icon: 'CurrencyDollar'
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast(goal ? 'Cilj štednje uspešno ažuriran' : 'Cilj štednje uspešno kreiran', 'success')
        onClose(true)
      } else {
        console.error('API error:', data)
        showToast(data.error || 'Greška pri čuvanju cilja', 'error')
        if (data.details) {
          console.error('Error details:', data.details)
        }
      }
    } catch (error: any) {
      console.error('Error saving goal:', error)
      showToast('Greška prilikom čuvanja cilja: ' + (error.message || 'Nepoznata greška'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.75)' }}
      onClick={() => onClose(false)}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          background: '#242236',
          borderRadius: '24px',
          padding: '32px',
          margin: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
              <Target size={24} weight="bold" style={{ color: '#FFF' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#FFF' }}>
              {goal ? 'Izmeni cilj štednje' : 'Novi cilj štednje'}
            </h2>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '12px', display: 'block' }}>
              Tip štednje
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsGroup(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: !isGroup ? '#9F70FF' : '#1C1A2E',
                  border: !isGroup ? '2px solid #9F70FF' : '2px solid #2E2B44',
                  color: !isGroup ? '#FFF' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                <CurrencyDollar size={20} weight="bold" />
                <span style={{ fontWeight: '600' }}>Lična</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGroup(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isGroup ? '#9F70FF' : '#1C1A2E',
                  border: isGroup ? '2px solid #9F70FF' : '2px solid #2E2B44',
                  color: isGroup ? '#FFF' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                <CurrencyDollar size={20} weight="bold" />
                <span style={{ fontWeight: '600' }}>Grupna</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Naziv cilja *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({...errors, name: ''}) }}
              placeholder="npr. Odmor, Novi automobil, Emergency fond..."
              required
              className="w-full px-4 py-3 rounded-xl transition-all"
              style={{
                background: '#1C1A2E',
                border: errors.name ? '2px solid #FF6B6B' : '2px solid #2E2B44',
                color: '#FFF',
                outline: 'none'
              }}
            />
            {errors.name && (
              <p style={{ color: '#FF6B6B', fontSize: '12px', marginTop: '4px' }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Ciljani iznos *
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => { setTargetAmount(e.target.value); if (errors.targetAmount) setErrors({...errors, targetAmount: ''}) }}
                placeholder="0.00"
                required
                step="0.01"
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  background: '#1C1A2E',
                  border: errors.targetAmount ? '2px solid #FF6B6B' : '2px solid #2E2B44',
                  color: '#FFF',
                  outline: 'none'
                }}
              />
              {errors.targetAmount && (
                <p style={{ color: '#FF6B6B', fontSize: '12px', marginTop: '4px' }}>
                  {errors.targetAmount}
                </p>
              )}
            </div>
            <div>
              <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Valuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  background: '#1C1A2E',
                  border: '2px solid #2E2B44',
                  color: '#FFF',
                  outline: 'none'
                }}
              >
                <option value="RSD">RSD (Dinar)</option>
                <option value="EUR">EUR (Evro)</option>
                <option value="USD">USD (Dolar)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '12px', display: 'block' }}>
              Kategorija *
            </label>
            <CategorySelector
              categories={categories}
              selectedId={categoryId}
              onSelect={(id) => { setCategoryId(id); if (errors.categoryId) setErrors({...errors, categoryId: ''}) }}
            />
            {errors.categoryId && (
              <p style={{ color: '#FF6B6B', fontSize: '12px', marginTop: '4px' }}>
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Period */}
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '12px', display: 'block' }}>
              Period
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: period === 'monthly' ? '#9F70FF' : '#1C1A2E',
                  border: period === 'monthly' ? '2px solid #9F70FF' : '2px solid #2E2B44',
                  color: period === 'monthly' ? '#FFF' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                <Calendar size={20} weight="bold" />
                <span style={{ fontWeight: '600' }}>Mesečno</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: period === 'yearly' ? '#9F70FF' : '#1C1A2E',
                  border: period === 'yearly' ? '2px solid #9F70FF' : '2px solid #2E2B44',
                  color: period === 'yearly' ? '#FFF' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                <Calendar size={20} weight="bold" />
                <span style={{ fontWeight: '600' }}>Godišnje</span>
              </button>
            </div>
          </div>

          {/* Target Date (only for yearly) */}
          {period === 'yearly' && (
            <div>
              <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Rok za postizanje cilja
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  background: '#1C1A2E',
                  border: '2px solid #2E2B44',
                  color: '#FFF',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Recurring Toggle */}
          <div
            style={{
              background: 'rgba(159, 112, 255, 0.1)',
              border: '1px solid rgba(159, 112, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Repeat size={24} weight="bold" style={{ color: '#9F70FF' }} />
                <div>
                  <p style={{ color: '#FFF', fontWeight: '600', marginBottom: '4px' }}>
                    Automatska mesečna štednja
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                    Sistem će automatski kreirati trošak svaki mesec
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#9F70FF' }}
              />
            </label>

            {isRecurring && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                      Iznos mesečno *
                    </label>
                    <input
                      type="number"
                      value={recurringAmount}
                      onChange={(e) => { setRecurringAmount(e.target.value); if (errors.recurringAmount) setErrors({...errors, recurringAmount: ''}) }}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: '#1C1A2E',
                        border: errors.recurringAmount ? '2px solid #FF6B6B' : '2px solid #2E2B44',
                        color: '#FFF',
                        outline: 'none'
                      }}
                    />
                    {errors.recurringAmount && (
                      <p style={{ color: '#FF6B6B', fontSize: '12px', marginTop: '4px' }}>
                        {errors.recurringAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                      Dan u mesecu
                    </label>
                    <select
                      value={recurringDayOfMonth}
                      onChange={(e) => setRecurringDayOfMonth(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: '#1C1A2E',
                        border: '2px solid #2E2B44',
                        color: '#FFF',
                        outline: 'none'
                      }}
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}. dan u mesecu
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  <p style={{ color: '#FFD700', fontSize: '13px' }}>
                    💡 Sistem će automatski kreirati trošak za štednju svakog {recurringDayOfMonth}. dana u mesecu
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
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
              {loading ? 'Čuvanje...' : goal ? 'Sačuvaj izmene' : 'Kreiraj cilj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
