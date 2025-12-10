'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import BudgetProgress from '@/components/BudgetProgress'
import BudgetModal from '@/components/BudgetModal'
import ModernHelpButton from '@/components/ModernHelpButton'

export default function BudgetsPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeGroup, setActiveGroup] = useState<{ id: string; role: string } | null>(null)

  useEffect(() => {
    fetchActiveGroup()
  }, [])

  const fetchActiveGroup = async () => {
    try {
      const res = await fetch('/api/group/active')
      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : { isGroup: false }
        if (data.group) {
          setActiveGroup({
            id: data.group.id,
            role: data.membership.role,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching active group:', err)
    }
  }

  const handleAddBudget = () => {
    setEditBudget(null)
    setShowModal(true)
  }

  const handleEditBudget = (budget: any) => {
    setEditBudget(budget)
    setShowModal(true)
  }

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1) // Trigger re-fetch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                Budžeti
              </h1>
              <p className="text-gray-400 mt-1">
                Pratite mesečnu potrošnju po kategorijama
              </p>
            </div>
          </div>
          <ModernHelpButton page="budgets" />
        </div>

        {/* Budget Progress */}
        <BudgetProgress
          key={refreshKey}
          onAddBudget={handleAddBudget}
          onEditBudget={handleEditBudget}
        />

        {/* Info Card */}
        <div className="mt-8 rounded-2xl p-8 relative overflow-hidden" style={{
          background: 'rgba(59, 130, 246, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{color: '#60A5FA'}}>
            💡 Kako funkcionišu budžeti?
          </h3>
          <ul className="space-y-3 text-sm" style={{color: '#E8D9FF', opacity: 0.9}}>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#60A5FA', opacity: 0.8}}>•</span>
              <span>
                Postavite <strong style={{color: '#60A5FA'}}>mesečni ili godišnji budžet</strong> za svaku kategoriju
              </span>
            </li>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#34D399', opacity: 0.8}}>•</span>
              <span>
                <strong style={{color: '#34D399'}}>Zelena</strong> boja: potrošeno manje od 50%
              </span>
            </li>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#FBBF24', opacity: 0.8}}>•</span>
              <span>
                <strong style={{color: '#FBBF24'}}>Žuta</strong> boja: potrošeno 50-80%
              </span>
            </li>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#FB923C', opacity: 0.8}}>•</span>
              <span>
                <strong style={{color: '#FB923C'}}>Narandžasta</strong> boja: potrošeno 80-100%
              </span>
            </li>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#FB7185', opacity: 0.8}}>•</span>
              <span>
                <strong style={{color: '#FB7185'}}>Crvena</strong> boja: prekoračen budžet
              </span>
            </li>
            <li className="flex items-start gap-3 pl-2">
              <span style={{color: '#9F70FF', opacity: 0.8}}>•</span>
              <span>
                Dobićete <strong style={{color: '#9F70FF'}}>upozorenje</strong> kada potrošite 80% budžeta
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        editBudget={editBudget}
        activeGroupId={activeGroup?.id || null}
        isGroupOwnerOrAdmin={activeGroup ? ['owner', 'admin'].includes(activeGroup.role) : false}
      />
    </div>
  )
}
