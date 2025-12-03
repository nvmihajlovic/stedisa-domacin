"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "phosphor-react"
import { getIcon } from "../iconMapping"

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  type: 'expense' | 'income'
}

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onSave: (updatedCategory: Category) => void
}

const availableIcons = [
  'ShoppingCart', 'GasPump', 'Drop', 'Sparkle', 'TShirt', 'Sneaker',
  'House', 'Lightning', 'Armchair', 'ForkKnife', 'GameController', 'Airplane',
  'Key', 'Gift', 'CreditCard', 'User', 'Barbell', 'Wrench',
  'Car', 'IdentificationCard', 'GraduationCap', 'Scales', 'ShieldCheck', 'Bank',
  'Users', 'Money', 'Laptop', 'TrendUp', 'Question'
]

const presetColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA',
  '#95E1D3', '#F38181', '#AA96DA', '#6BCF7F', '#F67280', '#FFB6C1',
  '#FF7B89', '#FFAAA6', '#7FD8BE', '#FFD571', '#85D8CE', '#9FACE6',
  '#B8A4C9', '#FFB4A7', '#A8D8EA', '#FCBAD3', '#FFDFD3', '#B5EAD7',
  '#D4A5A5', '#FFA5D8', '#FFD93D'
]

export default function EditCategoryModal({ isOpen, onClose, category, onSave }: EditCategoryModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('Question')
  const [color, setColor] = useState('#FF6B6B')
  const [isActive, setIsActive] = useState(true)
  const [type, setType] = useState<'expense' | 'income'>('expense')

  useEffect(() => {
    if (category) {
      setName(category.name)
      setIcon(category.icon || 'Question')
      setColor(category.color || '#FF6B6B')
      setType(category.type)
    }
  }, [category])

  const handleSave = () => {
    if (!category || !name.trim()) return

    onSave({
      ...category,
      name: name.trim(),
      icon,
      color,
    })
  }

  if (!category) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-1 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(159, 112, 255, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
        <div 
          className="rounded-3xl backdrop-blur-xl p-8"
          style={{
            background: 'rgba(20, 18, 38, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
              Izmeni kategoriju
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <X size={20} weight="bold" style={{ color: '#fff' }} />
            </button>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Naziv kategorije
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite naziv kategorije"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontFamily: '"Inter", sans-serif'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            />
          </div>

          {/* Type (disabled if has transactions) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Tip kategorije
            </label>
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 px-4 py-3 rounded-xl font-medium cursor-not-allowed opacity-50"
                style={{
                  background: type === 'expense' ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: type === 'expense' ? '1px solid rgba(255, 107, 157, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: type === 'expense' ? '#FF6B9D' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Trošak
              </button>
              <button
                disabled
                className="flex-1 px-4 py-3 rounded-xl font-medium cursor-not-allowed opacity-50"
                style={{
                  background: type === 'income' ? 'rgba(69, 211, 138, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: type === 'income' ? '1px solid rgba(69, 211, 138, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: type === 'income' ? '#45D38A' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Prihod
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              Tip se ne može menjati nakon kreiranja
            </p>
          </div>

          {/* Icon Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ikonica
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto pr-2">
              {availableIcons.map((iconName) => {
                const IconComponent = getIcon(iconName)
                const isSelected = icon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className="aspect-square p-3 rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '2px solid rgba(167, 139, 250, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#A78BFA' : 'rgba(255, 255, 255, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    <IconComponent size={20} weight="duotone" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Boja
            </label>
            <div className="grid grid-cols-9 sm:grid-cols-12 gap-2">
              {presetColors.map((presetColor) => {
                const isSelected = color === presetColor
                return (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className="aspect-square rounded-xl transition-all duration-200 relative"
                    style={{
                      background: presetColor,
                      border: isSelected ? '3px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isSelected ? `0 0 20px ${presetColor}60` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={16} weight="bold" style={{ color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="mb-8">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="block text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </span>
                <span className="block text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                  Neaktivne kategorije se ne prikazuju u modalima
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="relative w-14 h-7 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(69, 211, 138, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: isActive ? '1px solid rgba(69, 211, 138, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div
                  className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? '#45D38A' : 'rgba(255, 255, 255, 0.4)',
                    left: isActive ? 'calc(100% - 26px)' : '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </button>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: '"Inter", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Otkaži
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: name.trim() ? 'linear-gradient(135deg, #A78BFA 0%, #6366F1 100%)' : 'rgba(167, 139, 250, 0.2)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                color: '#fff',
                fontFamily: '"Inter", sans-serif'
              }}
              onMouseEnter={(e) => {
                if (name.trim()) {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(167, 139, 250, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (name.trim()) {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Sačuvaj izmene
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
