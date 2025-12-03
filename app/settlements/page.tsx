'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, DollarSign } from 'lucide-react'
import GroupSettlement from '@/components/GroupSettlement'

export default function SettlementsPage() {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups/user')
      const text = await response.text()
      const data = text ? JSON.parse(text) : { groups: [] }

      if (data.groups) {
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Nazad na Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            Poravnanja
          </h1>
          <p className="text-gray-400 mt-2">
            Upravljajte dugovima i poravnanjima u vašim grupama
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Nemate grupa
            </h2>
            <p className="text-gray-400 mb-6">
              Kreirajte grupu ili se pridružite postojećoj da biste pratili zajedničke troškove
            </p>
            <button
              onClick={() => router.push('/groups')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Pregledaj grupe
            </button>
          </div>
        ) : !selectedGroup ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Izaberite grupu
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left hover:border-purple-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Kliknite za prikaz poravnanja
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {groups.find((g) => g.id === selectedGroup)?.name}
              </h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Nazad na listu
              </button>
            </div>

            <GroupSettlement groupId={selectedGroup} />
          </div>
        )}

        {/* Info Card */}
        {!selectedGroup && groups.length > 0 && (
          <div className="mt-8 bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">
              💡 Kako funkcionišu poravnanja?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>
                  Sistem automatski <strong>izračunava ko kome duguje</strong> na osnovu troškova u grupi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>
                  Prikazuje se <strong>najmanji broj transakcija</strong> potrebnih za poravnanje
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>
                  Kliknite <strong>"Settle Up"</strong> kada izvršite uplatu
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span>
                  Istorija svih poravnanja je dostupna u kartici <strong>"Istorija"</strong>
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
