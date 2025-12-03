'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import GroupSettlement from '@/components/GroupSettlement'

export default function SettlementDemoPage() {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  // Fetch user's groups on mount
  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const result = await response.json()

      if (result.success) {
        setGroups(result.data || [])
        // Get current user ID from first group if available
        if (result.data && result.data.length > 0) {
          // Fetch user info
          const userRes = await fetch('/api/user')
          const userData = await userRes.json()
          if (userData.user) {
            setUserId(userData.user.id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

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
            className="flex items-center gap-2 mb-4 transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Nazad</span>
          </button>
          <h1
            className="text-3xl font-bold"
            style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}
          >
            Settlement Demo
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Testirajte novi sistem za poravnavanje dugova u grupama
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F70FF]"></div>
          </div>
        ) : groups.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Nemate nijednu grupu. Kreirajte grupu ili se pridružite postojećoj.
            </p>
            <button
              onClick={() => router.push('/groups/create')}
              className="mt-4 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #9F70FF, #7B4FD8)',
                color: '#fff'
              }}
            >
              Kreiraj grupu
            </button>
          </div>
        ) : !selectedGroup ? (
          <div>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: '"Inter", sans-serif' }}
            >
              Izaberite grupu
            </h2>
            <div className="space-y-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className="w-full rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <h3
                    className="font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {group.name}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Klikni za prikaz settlemenata
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-semibold"
                style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: '"Inter", sans-serif' }}
              >
                {groups.find((g) => g.id === selectedGroup)?.name}
              </h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                Promeni grupu
              </button>
            </div>

            <GroupSettlement groupId={selectedGroup} userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}
