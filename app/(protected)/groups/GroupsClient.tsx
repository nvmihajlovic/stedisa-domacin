"use client"

import { useState, useEffect } from "react"
import { Plus, Users, TrendUp, TrendDown, ArrowRight } from "phosphor-react"
import { useRouter } from "next/navigation"
import CreateGroupModal from "@/components/groups/CreateGroupModal"
import GroupSwitcher from "@/components/groups/GroupSwitcher"

type Group = {
  id: string
  name: string
  description?: string
  members: any[]
  expenses: any[]
  owner: {
    id: string
    name: string
    email: string
  }
}

type UserProfile = {
  id: string
  name: string
  email: string
}

export default function GroupsClient() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    fetchActiveGroup()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsRes, profileRes] = await Promise.all([
        fetch("/api/groups/user"),
        fetch("/api/profile")
      ])

      if (groupsRes.ok) {
        const data = await groupsRes.json()
        setGroups(data.groups || [])
      }

      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveGroup = async () => {
    try {
      const res = await fetch('/api/user/active-group')
      if (res.ok) {
        const data = await res.json()
        setActiveGroupId(data.activeGroup?.id || null)
      }
    } catch (error) {
      console.error('Error fetching active group:', error)
    }
  }

  const handleGroupCreated = () => {
    fetchData()
    fetchActiveGroup()
    setShowCreateModal(false)
  }

  const calculateTotalExpenses = (group: Group) => {
    return group.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
  }

  const calculateTotalIncome = () => {
    return 0 // Placeholder
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Grupe
            </h1>
            <p className="text-gray-400">
              Upravljajte svojim grupama i deljenim troškovima
            </p>
          </div>

          <div className="flex items-center gap-4">
            {groups.length > 0 && (
              <GroupSwitcher 
                currentGroupId={activeGroupId} 
                onGroupChange={() => {
                  fetchData()
                  fetchActiveGroup()
                }}
              />
            )}
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Plus size={24} weight="bold" />
              Kreiraj grupu
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-400 py-20">
            Učitavanje...
          </div>
        )}

        {/* Groups Grid */}
        {!loading && groups.length === 0 && (
          <div className="text-center py-20">
            <Users size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-6">
              Nemate nijednu grupu
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              Kreirajte prvu grupu
            </button>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const totalExpenses = calculateTotalExpenses(group)
              const totalIncome = calculateTotalIncome()
              const isOwner = profile?.id === group.owner.id

              return (
                <div
                  key={group.id}
                  className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Vlasnik: {group.owner.name}
                      </p>
                    </div>
                    {isOwner && (
                      <span className="px-3 py-1 text-xs font-semibold bg-purple-600/20 text-purple-400 rounded-full">
                        Vlasnik
                      </span>
                    )}
                  </div>

                  {/* Members Count */}
                  <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <Users size={20} />
                    <span className="text-sm">
                      {group.members?.length || 0} {group.members?.length === 1 ? 'član' : 'članova'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    {/* Total Expenses */}
                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TrendDown size={20} className="text-red-400" />
                        <span className="text-sm text-gray-300">Troškovi</span>
                      </div>
                      <span className="text-lg font-bold text-red-400">
                        {totalExpenses.toLocaleString('sr-RS')} RSD
                      </span>
                    </div>

                    {/* Total Income */}
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TrendUp size={20} className="text-green-400" />
                        <span className="text-sm text-gray-300">Prihodi</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">
                        {totalIncome.toLocaleString('sr-RS')} RSD
                      </span>
                    </div>
                  </div>

                  {/* Open Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/groups/${group.id}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105"
                  >
                    Otvori grupu
                    <ArrowRight size={20} weight="bold" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleGroupCreated}
        />
      )}
    </div>
  )
}
