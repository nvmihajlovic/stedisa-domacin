"use client"

import { getIcon } from "../iconMapping"

type Category = {
  id: string
  name: string
  icon?: string
  color?: string
}

type CategorySelectorProps = {
  categories: Category[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function CategorySelector({ categories, selectedId, onSelect }: CategorySelectorProps) {
  return (
    <div className="max-h-[400px] overflow-y-auto pr-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {categories.map((category) => {
          const IconComponent = getIcon(category.icon)
          const isSelected = selectedId === category.id
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-200"
              style={isSelected 
                ? {background: '#2E2B44', border: '2px solid #9F70FF'} 
                : {background: '#1C1A2E', border: '2px solid #2E2B44'}
              }
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#2E2B44', color: category.color }}
              >
                <IconComponent size={24} weight="duotone" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{color: isSelected ? '#FFFFFF' : '#A5A4B6'}}>
                {category.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
