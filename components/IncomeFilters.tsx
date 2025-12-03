'use client'

import { useState } from 'react'
import { X, Filter, Calendar, DollarSign, User, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Member {
  id: string
  name: string
}

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  customDateFrom?: string
  customDateTo?: string
  categories: string[]
  minAmount?: number
  maxAmount?: number
  users: string[]
}

interface IncomeFiltersProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  members: Member[]
  onApplyFilters: (filters: FilterState) => void
  currentFilters: FilterState
}

export default function IncomeFilters({
  isOpen,
  onClose,
  categories,
  members,
  onApplyFilters,
  currentFilters,
}: IncomeFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      dateRange: 'all',
      categories: [],
      users: [],
    }
    setFilters(resetFilters)
    onApplyFilters(resetFilters)
  }

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const toggleUser = (userId: string) => {
    setFilters(prev => ({
      ...prev,
      users: prev.users.includes(userId)
        ? prev.users.filter(id => id !== userId)
        : [...prev.users, userId],
    }))
  }

  const activeFiltersCount = 
    (filters.dateRange !== 'all' ? 1 : 0) +
    filters.categories.length +
    filters.users.length +
    (filters.minAmount !== undefined ? 1 : 0) +
    (filters.maxAmount !== undefined ? 1 : 0)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #1E1B2A, #171421)',
          boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(99, 230, 190, 0.15)',
                border: '1px solid rgba(99, 230, 190, 0.3)',
              }}
            >
              <Filter className="w-5 h-5" style={{ color: '#63E6BE' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Filteri</h2>
              {activeFiltersCount > 0 && (
                <span className="text-xs" style={{ color: '#63E6BE' }}>
                  {activeFiltersCount} aktivnih
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            style={{ color: '#A5A4B6' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(99, 230, 190, 0.3) transparent'
        }}>
          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#E8D9FF' }}>
              <Calendar className="w-4 h-4" style={{ color: '#63E6BE' }} />
              Datum
            </label>
            <div className="space-y-1.5">
              {[
                { value: 'all', label: 'Sve' },
                { value: 'today', label: 'Danas' },
                { value: 'week', label: 'Ova nedelja' },
                { value: 'month', label: 'Ovaj mesec' },
                { value: 'custom', label: 'Prilagođeno' },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: filters.dateRange === option.value ? 'rgba(99, 230, 190, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: filters.dateRange === option.value ? '1px solid rgba(99, 230, 190, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={filters.dateRange === option.value}
                    onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-4 h-4"
                    style={{ accentColor: '#63E6BE' }}
                  />
                  <span className="text-sm font-medium" style={{ color: filters.dateRange === option.value ? '#FFFFFF' : '#B8B7C5' }}>{option.label}</span>
                </label>
              ))}
            </div>

            {filters.dateRange === 'custom' && (
              <div className="mt-3 space-y-3 pl-1">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A5A4B6' }}>Od</label>
                  <input
                    type="date"
                    value={filters.customDateFrom || ''}
                    onChange={e => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#1C1A2E',
                      border: '1px solid #2E2B44',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A5A4B6' }}>Do</label>
                  <input
                    type="date"
                    value={filters.customDateTo || ''}
                    onChange={e => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#1C1A2E',
                      border: '1px solid #2E2B44',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#E8D9FF' }}>
                <Tag className="w-4 h-4" style={{ color: '#63E6BE' }} />
                Kategorije
              </label>
              <div className="space-y-1.5">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: filters.categories.includes(category.id) ? 'rgba(99, 230, 190, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: filters.categories.includes(category.id) ? '1px solid rgba(99, 230, 190, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#63E6BE' }}
                    />
                    <span className="text-sm font-medium" style={{ color: filters.categories.includes(category.id) ? '#FFFFFF' : '#B8B7C5' }}>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Amount Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#E8D9FF' }}>
              <DollarSign className="w-4 h-4" style={{ color: '#63E6BE' }} />
              Iznos (RSD)
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A5A4B6' }}>Minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount || ''}
                  onChange={e => setFilters(prev => ({ 
                    ...prev, 
                    minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#1C1A2E',
                    border: '1px solid #2E2B44',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A5A4B6' }}>Maximum</label>
                <input
                  type="number"
                  placeholder="Neograničeno"
                  value={filters.maxAmount || ''}
                  onChange={e => setFilters(prev => ({ 
                    ...prev, 
                    maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#1C1A2E',
                    border: '1px solid #2E2B44',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Users */}
          {members.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#E8D9FF' }}>
                <User className="w-4 h-4" style={{ color: '#63E6BE' }} />
                Korisnici
              </label>
              <div className="space-y-1.5">
                {members.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: filters.users.includes(member.id) ? 'rgba(99, 230, 190, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: filters.users.includes(member.id) ? '1px solid rgba(99, 230, 190, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.users.includes(member.id)}
                      onChange={() => toggleUser(member.id)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#63E6BE' }}
                    />
                    <span className="text-sm font-medium" style={{ color: filters.users.includes(member.id) ? '#FFFFFF' : '#B8B7C5' }}>{member.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-5 flex gap-3"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#B8B7C5',
            }}
          >
            Resetuj
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #63E6BE, #20C997)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(99, 230, 190, 0.3)',
            }}
          >
            Primeni
          </button>
        </div>
      </div>
    </>
  )
}
