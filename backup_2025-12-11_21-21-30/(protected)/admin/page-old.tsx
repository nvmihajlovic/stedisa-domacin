"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, User, UserMinus, Receipt, TrendUp, UsersThree, Trash, Lock, LockOpen } from "phosphor-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  emailVerified: boolean
  createdAt: string
  _count: {
    expenses: number
    incomes: number
    groupMemberships: number
    ownedGroups: number
  }
}

interface Stats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  totalExpenses: number
  totalIncomes: number
  totalGroups: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [blockReason, setBlockReason] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats")
      ])

      if (usersRes.status === 403 || statsRes.status === 403) {
        router.push("/dashboard")
        return
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    if (!blockReason.trim()) {
      alert("Unesite razlog blokiranja")
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: blockReason })
      })

      if (res.ok) {
        fetchData()
        setSelectedUser(null)
        setBlockReason("")
        alert("Korisnik uspešno blokiran")
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      alert("Greška pri blokiranju korisnika")
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: "POST"
      })

      if (res.ok) {
        fetchData()
        alert("Korisnik uspešno odblokiran")
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      alert("Greška pri odblokiranju korisnika")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchData()
        setShowDeleteConfirm(false)
        setSelectedUser(null)
        alert("Korisnik uspešno obrisan")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Greška pri brisanju korisnika")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0D11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">
            Upravljanje korisnicima i sistemom
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} className="text-blue-400" />
                <span className="text-gray-400 text-sm">Ukupno</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <User size={24} className="text-green-400" weight="fill" />
                <span className="text-gray-400 text-sm">Aktivni</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <UserMinus size={24} className="text-red-400" />
                <span className="text-gray-400 text-sm">Blokirani</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.blockedUsers}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Receipt size={24} className="text-purple-400" />
                <span className="text-gray-400 text-sm">Troškovi</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalExpenses}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <TrendUp size={24} className="text-green-400" />
                <span className="text-gray-400 text-sm">Prihodi</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalIncomes}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <UsersThree size={24} className="text-orange-400" />
                <span className="text-gray-400 text-sm">Grupe</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalGroups}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Korisnici</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Korisnik</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Troškovi/Prihodi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Grupe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Datum</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        {user.role === 'admin' && (
                          <span className="text-xs text-purple-400">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status === 'active' ? 'Aktivan' : 'Blokiran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {user._count.expenses} / {user._count.incomes}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {user._count.ownedGroups + user._count.groupMemberships}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('sr-RS')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'admin' && (
                          <>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Blokiraj"
                              >
                                <Lock size={20} className="text-red-400" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Odblokiraj"
                              >
                                <LockOpen size={20} className="text-green-400" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteConfirm(true)
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Obriši"
                            >
                              <Trash size={20} className="text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Block User Modal */}
        {selectedUser && !showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1b23] rounded-2xl p-6 max-w-md w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">
                Blokiraj korisnika
              </h3>
              <p className="text-gray-400 mb-4">
                Blokirate korisnika: <span className="text-white font-semibold">{selectedUser.name}</span>
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Unesite razlog blokiranja..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setBlockReason("")
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  onClick={() => handleBlockUser(selectedUser.id)}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition-colors"
                >
                  Blokiraj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1b23] rounded-2xl p-6 max-w-md w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">
                Obriši korisnika
              </h3>
              <p className="text-gray-400 mb-4">
                Da li ste sigurni da želite da obrišete korisnika <span className="text-white font-semibold">{selectedUser.name}</span>? 
                Ova akcija je nepovratna i obrisaće sve podatke korisnika.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition-colors"
                >
                  Obriši
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
