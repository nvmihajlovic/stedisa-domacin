"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  User,
  Envelope,
  Phone,
  Lock,
  Palette,
  Bell,
  Users,
  ShieldCheck,
  Trash,
  ArrowLeft,
  Check,
  X,
  Plus,
  SignOut,
  DownloadSimple,
  Database,
  FileCsv,
  CalendarBlank
} from "phosphor-react"
import { useToast } from "@/hooks/useToast"
import ModernHelpButton from "@/components/ModernHelpButton"

type UserType = {
  id: string
  name: string
  email: string
}

type Group = {
  id: string
  name: string
  description?: string
  membersCount: number
  createdAt: string
  isOwner: boolean
}

export default function ProfileClient({ user }: { user: UserType }) {
  const router = useRouter()
  const { addToast } = useToast()

  // Personal data
  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState(user.email || "")

  // Settings
  const [currency, setCurrency] = useState("RSD")
  const [dateFormat, setDateFormat] = useState("dd.MM.yyyy")
  const [notifications, setNotifications] = useState(true)
  const [recurringNotifications, setRecurringNotifications] = useState(true)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true)

  // Personalization
  const [theme, setTheme] = useState("dark")
  const [primaryColor, setPrimaryColor] = useState("purple")

  // CSV Export state
  const [csvExportType, setCsvExportType] = useState<'all' | 'expense' | 'income'>('all')
  const [csvStartDate, setCsvStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30) // 30 days ago
    return date.toISOString().split('T')[0]
  })
  const [csvEndDate, setCsvEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [fontSize, setFontSize] = useState("normal")
  const [chartType, setChartType] = useState("line")

  // Groups
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false)
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedGroupName, setSelectedGroupName] = useState<string>("")

  // Modal states
  const [newEmail, setNewEmail] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")

  // Loading states
  const [saving, setSaving] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const colorOptions = [
    { name: "purple", gradient: "linear-gradient(135deg, #A64DFF, #4DB2FF)" },
    { name: "pink", gradient: "linear-gradient(135deg, #FF6B9D, #C44569)" },
    { name: "green", gradient: "linear-gradient(135deg, #11998E, #38EF7D)" },
    { name: "blue", gradient: "linear-gradient(135deg, #4A00E0, #8E2DE2)" }
  ]

  useEffect(() => {
    // Load user preferences from localStorage
    const savedTheme = localStorage.getItem("theme") || "dark"
    const savedColor = localStorage.getItem("primaryColor") || "purple"
    const savedFontSize = localStorage.getItem("fontSize") || "normal"
    const savedChartType = localStorage.getItem("chartType") || "line"
    const savedAiAssistant = localStorage.getItem("ai_assistant_enabled")

    setTheme(savedTheme)
    setPrimaryColor(savedColor)
    setFontSize(savedFontSize)
    setChartType(savedChartType)
    if (savedAiAssistant !== null) {
      setAiAssistantEnabled(savedAiAssistant === "true")
    }

    // Fetch user profile data
    fetchUserProfile()
    fetchUserGroups()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const [profileRes, settingsRes, styleRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/profile/settings"),
        fetch("/api/profile/style")
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        setUsername(data.username || "")
        setPhone(data.phone || "")
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setCurrency(data.currency || "RSD")
        setDateFormat(data.dateFormat || "dd.MM.yyyy")
        setNotifications(data.notifications ?? true)
        setRecurringNotifications(data.recurringNotifications ?? true)
        const aiEnabled = data.aiAssistantEnabled ?? true
        setAiAssistantEnabled(aiEnabled)
        // Sync localStorage with API data
        localStorage.setItem("ai_assistant_enabled", aiEnabled.toString())
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'))
      }

      if (styleRes.ok) {
        const data = await styleRes.json()
        if (data.theme) setTheme(data.theme)
        if (data.primaryColor) setPrimaryColor(data.primaryColor)
        if (data.fontSize) setFontSize(data.fontSize)
        if (data.chartType) setChartType(data.chartType)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const fetchUserGroups = async () => {
    try {
      setLoadingGroups(true)
      const res = await fetch("/api/groups/user")
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleSavePersonalData = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, phone })
      })

      if (res.ok) {
        addToast("Lični podaci su uspešno sačuvani", "success")
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri čuvanju podataka", "error")
      }
    } catch (error) {
      addToast("Greška pri čuvanju podataka", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          dateFormat,
          notifications,
          recurringNotifications,
          aiAssistantEnabled
        })
      })

      if (res.ok) {
        const responseData = await res.json()
        // Save AI assistant preference to localStorage as well
        localStorage.setItem("ai_assistant_enabled", aiAssistantEnabled.toString())
        addToast("Podešavanja su uspešno sačuvana", "success")
        
        // Trigger a storage event to notify other tabs/components
        window.dispatchEvent(new Event('storage'))
        
        // Keep button in "saving" state for a bit longer for better UX
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri čuvanju podešavanja", "error")
      }
    } catch (error) {
      addToast("Greška pri čuvanju podešavanja", "error")
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSavePersonalization = async () => {
    // Save to localStorage
    localStorage.setItem("theme", theme)
    localStorage.setItem("primaryColor", primaryColor)
    localStorage.setItem("fontSize", fontSize)
    localStorage.setItem("chartType", chartType)

    // Save to backend
    try {
      const res = await fetch("/api/profile/style", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, primaryColor, fontSize, chartType })
      })

      if (res.ok) {
        addToast("Personalizacija je sačuvana", "success")
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri čuvanju personalizacije", "error")
      }
    } catch (error) {
      addToast("Greška pri čuvanju personalizacije", "error")
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      addToast("Unesite validnu email adresu", "error")
      return
    }

    try {
      const res = await fetch("/api/user/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail })
      })

      if (res.ok) {
        addToast("Email je uspešno promenjen", "success")
        setEmail(newEmail)
        setShowEmailModal(false)
        setNewEmail("")
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri promeni email-a", "error")
      }
    } catch (error) {
      addToast("Greška pri promeni email-a", "error")
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast("Sva polja su obavezna", "error")
      return
    }

    if (newPassword !== confirmPassword) {
      addToast("Nove lozinke se ne poklapaju", "error")
      return
    }

    if (newPassword.length < 6) {
      addToast("Nova lozinka mora imati najmanje 6 karaktera", "error")
      return
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (res.ok) {
        addToast("Lozinka je uspešno promenjena", "success")
        setShowPasswordModal(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri promeni lozinke", "error")
      }
    } catch (error) {
      addToast("Greška pri promeni lozinke", "error")
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      addToast("Unesite naziv grupe", "error")
      return
    }

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription
        })
      })

      if (res.ok) {
        addToast("Grupa je uspešno kreirana", "success")
        setShowGroupModal(false)
        setNewGroupName("")
        setNewGroupDescription("")
        fetchUserGroups()
      } else {
        const data = await res.json()
        addToast(data.error || "Greška pri kreiranju grupe", "error")
      }
    } catch (error) {
      addToast("Greška pri kreiranju grupe", "error")
    }
  }

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId)
    setSelectedGroupName(groupName)
    setShowLeaveGroupModal(true)
  }

  const confirmLeaveGroup = async () => {
    if (!selectedGroupId) return
    setShowLeaveGroupModal(false)

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/leave`, {
        method: "POST"
      })

      if (res.ok) {
        addToast("Uspešno ste napustili grupu", "success")
        fetchUserGroups()
      } else {
        addToast("Greška pri napuštanju grupe", "error")
      }
    } catch (error) {
      addToast("Greška pri napuštanju grupe", "error")
    }
    setSelectedGroupId(null)
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId)
    setSelectedGroupName(groupName)
    setShowDeleteGroupModal(true)
  }

  const confirmDeleteGroup = async () => {
    if (!selectedGroupId) return
    setShowDeleteGroupModal(false)

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        addToast("Grupa je uspešno raspuštena", "success")
        fetchUserGroups()
      } else {
        addToast("Greška pri raspuštanju grupe", "error")
      }
    } catch (error) {
      addToast("Greška pri raspuštanju grupe", "error")
    }
    setSelectedGroupId(null)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "OBRIŠI") {
      addToast("Morate upisati OBRIŠI da potvrdite", "error")
      return
    }

    try {
      const res = await fetch("/api/user", {
        method: "DELETE"
      })

      if (res.ok) {
        addToast("Nalog je trajno obrisan", "success")
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        addToast("Greška pri brisanju naloga", "error")
      }
    } catch (error) {
      addToast("Greška pri brisanju naloga", "error")
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-10 lg:px-14 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8" style={{paddingTop: '24px'}}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #A64DFF, #4DB2FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Profil
            </h1>
            <p className="text-white/50">Upravljajte svojim nalogom i podešavanjima</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernHelpButton page="profile" />
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              <span>Nazad</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEKCIJA 1: Lični podaci */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(166,77,255,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(166, 77, 255, 0.15)',
                  border: '1px solid rgba(166, 77, 255, 0.3)'
                }}
              >
                <User size={20} weight="duotone" style={{color: '#A64DFF'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Lični podaci</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Ime i prezime</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                  placeholder="Unesite ime i prezime"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Korisničko ime (opciono)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                  placeholder="Unesite nadimak"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white/40 cursor-not-allowed"
                  />
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #A64DFF, #4DB2FF)',
                      color: 'white'
                    }}
                  >
                    Promeni
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Broj telefona (opciono)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                  placeholder="+381 60 123 4567"
                />
              </div>

              <button
                onClick={handleSavePersonalData}
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                style={{
                  background: 'linear-gradient(135deg, #A64DFF, #4DB2FF)',
                  color: 'white'
                }}
              >
                {saving ? "Čuvanje..." : "Sačuvaj izmene"}
              </button>
            </div>
          </div>

          {/* SEKCIJA 2: Podešavanja naloga */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(77,178,255,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(77, 178, 255, 0.15)',
                  border: '1px solid rgba(77, 178, 255, 0.3)'
                }}
              >
                <Lock size={20} weight="duotone" style={{color: '#4DB2FF'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Podešavanja naloga</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Lozinka</label>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: 'rgba(77, 178, 255, 0.1)',
                    border: '1px solid rgba(77, 178, 255, 0.3)',
                    color: '#4DB2FF'
                  }}
                >
                  Promeni lozinku
                </button>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Format valute</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="RSD">RSD - Srpski dinar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Američki dolar</option>
                  <option value="GBP">GBP - Britanska funta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Format datuma</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="dd.MM.yyyy">DD.MM.YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  <option value="MMM dd">MMM DD</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-white font-medium">Obaveštenja</p>
                  <p className="text-white/50 text-sm">Primaj podsetiće i notifikacije</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-white font-medium">Recurring notifikacije</p>
                  <p className="text-white/50 text-sm">Notifikacije za ponavljajuće transakcije</p>
                </div>
                <button
                  onClick={() => setRecurringNotifications(!recurringNotifications)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    recurringNotifications ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                    recurringNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-white font-medium">AI finansijski asistent</p>
                  <p className="text-white/50 text-sm">Prikaži automatske finansijske savete</p>
                </div>
                <button
                  onClick={() => setAiAssistantEnabled(!aiAssistantEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    aiAssistantEnabled ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                    aiAssistantEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                style={{
                  background: 'linear-gradient(135deg, #4DB2FF, #A64DFF)',
                  color: 'white'
                }}
              >
                {savingSettings ? "Čuvanje..." : "Sačuvaj podešavanja"}
              </button>
            </div>
          </div>

          {/* SEKCIJA 3: Personalizacija */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(255,107,157,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255, 107, 157, 0.15)',
                  border: '1px solid rgba(255, 107, 157, 0.3)'
                }}
              >
                <Palette size={20} weight="duotone" style={{color: '#FF6B9D'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Personalizacija</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-3">Tema</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      theme === "dark" 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <div className="text-white font-medium">Dark</div>
                    <div className="text-white/50 text-xs">Trenutna tema</div>
                  </button>
                  <button
                    disabled
                    className="p-4 rounded-xl border-2 border-white/5 bg-black/10 opacity-40 cursor-not-allowed"
                  >
                    <div className="text-white font-medium">Light</div>
                    <div className="text-white/50 text-xs">Dolazi uskoro</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-3">Primarna boja</label>
                <div className="grid grid-cols-2 gap-3">
                  {colorOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => setPrimaryColor(option.name)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                        primaryColor === option.name
                          ? 'border-white/30 scale-105'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        background: option.gradient
                      }}
                    >
                      {primaryColor === option.name && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check size={12} weight="bold" style={{color: '#000'}} />
                        </div>
                      )}
                      <div className="text-white font-medium capitalize">{option.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-3">Veličina fonta</label>
                <div className="grid grid-cols-3 gap-3">
                  {['mala', 'normalna', 'velika'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        fontSize === size
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="text-white font-medium capitalize text-sm">{size}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-3">Tip grafikona</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'line', label: 'Line' },
                    { value: 'bar', label: 'Bar' },
                    { value: 'combined', label: 'Combined' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setChartType(type.value)}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        chartType === type.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="text-white font-medium text-sm">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSavePersonalization}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] mt-4"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #C44569)',
                  color: 'white'
                }}
              >
                Sačuvaj personalizaciju
              </button>
            </div>
          </div>

          {/* SEKCIJA 4: Grupe */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(40,234,138,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(40, 234, 138, 0.15)',
                  border: '1px solid rgba(40, 234, 138, 0.3)'
                }}
              >
                <Users size={20} weight="duotone" style={{color: '#28EA8A'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Moje grupe</h2>
            </div>

            {loadingGroups ? (
              <div className="text-center py-8 text-white/50">Učitavanje...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50 mb-4">Niste član ni jedne grupe</p>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #28EA8A, #11998E)',
                    color: 'white'
                  }}
                >
                  <Plus size={20} weight="bold" />
                  Kreiraj novu grupu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{group.name}</h3>
                        {group.description && (
                          <p className="text-white/50 text-sm mt-1">{group.description}</p>
                        )}
                      </div>
                      <div 
                        className="px-2 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          background: group.isOwner 
                            ? 'rgba(255, 179, 230, 0.15)' 
                            : 'rgba(111, 255, 196, 0.15)',
                          color: group.isOwner ? '#FFB3E6' : '#6FFFC4',
                          border: `1px solid ${group.isOwner ? 'rgba(255, 179, 230, 0.2)' : 'rgba(111, 255, 196, 0.2)'}`
                        }}
                      >
                        {group.isOwner ? 'Vlasnik' : 'Član'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                      <span>{group.membersCount} članova</span>
                      <span>•</span>
                      <span>{new Date(group.createdAt).toLocaleDateString('sr-RS')}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/groups/${group.id}`)}
                        className="flex-1 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(40, 234, 138, 0.1)',
                          border: '1px solid rgba(40, 234, 138, 0.3)',
                          color: '#28EA8A'
                        }}
                      >
                        Uđi u grupu
                      </button>
                      {group.isOwner ? (
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            background: 'rgba(228, 88, 110, 0.1)',
                            border: '1px solid rgba(228, 88, 110, 0.3)',
                            color: '#E4586E'
                          }}
                        >
                          Raspusti
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeaveGroup(group.id, group.name)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            background: 'rgba(228, 88, 110, 0.1)',
                            border: '1px solid rgba(228, 88, 110, 0.3)',
                            color: '#E4586E'
                          }}
                        >
                          Napusti
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowGroupModal(true)}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
                  style={{
                    background: 'rgba(40, 234, 138, 0.1)',
                    border: '1px solid rgba(40, 234, 138, 0.3)',
                    color: '#28EA8A'
                  }}
                >
                  <Plus size={20} weight="bold" />
                  Kreiraj novu grupu
                </button>
              </div>
            )}
          </div>

          {/* SEKCIJA 5: Bezbednost */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(111,255,196,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(111, 255, 196, 0.15)',
                  border: '1px solid rgba(111, 255, 196, 0.3)'
                }}
              >
                <ShieldCheck size={20} weight="duotone" style={{color: '#6FFFC4'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Bezbednost</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">Zadnja prijava</span>
                  <span className="text-white font-medium">Danas, 14:32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">IP adresa</span>
                  <span className="text-white font-medium">192.168.1.1</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/5 opacity-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">Aktivne sesije</span>
                  <span className="text-white font-medium">1</span>
                </div>
                <p className="text-white/40 text-xs">Dolazi uskoro</p>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/5 opacity-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">Dvofaktorska autentifikacija (2FA)</span>
                  <span className="text-white/40 text-xs">Onemogućeno</span>
                </div>
                <p className="text-white/40 text-xs">Dolazi uskoro</p>
              </div>
            </div>
          </div>

          {/* SEKCIJA 5.5: Export & Backup */}
          <div
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(94,129,244,0.25)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(94, 129, 244, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(94, 129, 244, 0.15)',
                  border: '1px solid rgba(94, 129, 244, 0.3)'
                }}
              >
                <Database size={20} weight="duotone" style={{color: '#5E81F4'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Export & Backup</h2>
            </div>

            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(94, 129, 244, 0.1)',
                border: '1px solid rgba(94, 129, 244, 0.2)'
              }}
            >
              <p className="text-white/80 text-sm mb-2">
                💾 Preuzmite kompletnu rezervnu kopiju svih vaših podataka
              </p>
              <p className="text-white/60 text-xs">
                Uključuje: troškove, prihode, kategorije, grupe, budžete i podešavanja
              </p>
            </div>

            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = '/api/export/backup'
                link.download = `domacin-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                addToast('Backup uspešno preuzet!', 'success')
              }}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #5E81F4, #4A6DD3)',
                color: '#FFFFFF'
              }}
            >
              <DownloadSimple size={20} weight="bold" />
              Preuzmi kompletan backup
            </button>

            <div className="mt-4 p-3 rounded-lg bg-black/20 border border-white/5">
              <p className="text-white/50 text-xs">
                ℹ️ Backup fajl je u JSON formatu i može se koristiti za migraciju ili restore podataka
              </p>
            </div>

            {/* CSV Export Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FileCsv size={18} weight="duotone" style={{color: '#10B981'}} />
                <h3 className="text-lg font-semibold text-white">CSV Export</h3>
              </div>

              <div className="space-y-3 mb-4">
                {/* Export Type */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Tip podataka</label>
                  <select
                    value={csvExportType}
                    onChange={(e) => setCsvExportType(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-lg text-white text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <option value="all">Sve (rashodi + prihodi)</option>
                    <option value="expense">Samo rashodi</option>
                    <option value="income">Samo prihodi</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Od datuma</label>
                    <input
                      type="date"
                      value={csvStartDate}
                      onChange={(e) => setCsvStartDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg text-white text-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Do datuma</label>
                    <input
                      type="date"
                      value={csvEndDate}
                      onChange={(e) => setCsvEndDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg text-white text-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    type: csvExportType,
                    startDate: csvStartDate,
                    endDate: csvEndDate
                  })
                  
                  const link = document.createElement('a')
                  link.href = `/api/export/csv?${params.toString()}`
                  link.download = `domaćin_export_${csvStartDate}_${csvEndDate}.csv`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  addToast('CSV export uspešno preuzet!', 'success')
                }}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF'
                }}
              >
                <FileCsv size={20} weight="bold" />
                Preuzmi CSV
              </button>

              <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/5">
                <p className="text-white/50 text-xs">
                  📊 CSV format je kompatibilan sa Excel, Google Sheets i drugim alatima
                </p>
              </div>
            </div>
          </div>

          {/* SEKCIJA 6: Brisanje naloga */}
          <div 
            className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(228,88,110,0.35)] transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, #1E1B2A, #171421)',
              border: '1px solid rgba(228, 88, 110, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(228, 88, 110, 0.15)',
                  border: '1px solid rgba(228, 88, 110, 0.3)'
                }}
              >
                <Trash size={20} weight="duotone" style={{color: '#E4586E'}} />
              </div>
              <h2 className="text-xl font-semibold text-white">Zona opasnosti</h2>
            </div>

            <div 
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(228, 88, 110, 0.1)',
                border: '1px solid rgba(228, 88, 110, 0.3)'
              }}
            >
              <p className="text-white/80 text-sm">
                ⚠️ Brisanje naloga je trajna akcija i ne može se poništiti. 
                Svi vaši podaci, transakcije i grupe će biti trajno obrisani.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'rgba(228, 88, 110, 0.2)',
                border: '1px solid rgba(228, 88, 110, 0.4)',
                color: '#E4586E'
              }}
            >
              Obriši nalog zauvek
            </button>
          </div>
        </div>

        {/* MODALI */}
        {/* Email Modal */}
        {showEmailModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <div 
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #1E1B2A, #171421)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Promeni email</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} style={{color: 'white'}} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Nova email adresa</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                  placeholder="nova@email.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleChangeEmail}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #A64DFF, #4DB2FF)',
                    color: 'white'
                  }}
                >
                  Sačuvaj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <div 
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #1E1B2A, #171421)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Promeni lozinku</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} style={{color: 'white'}} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Stara lozinka</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Nova lozinka</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Potvrdi novu lozinku</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #4DB2FF, #A64DFF)',
                    color: 'white'
                  }}
                >
                  Promeni
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Modal */}
        {showGroupModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGroupModal(false)}
          >
            <div 
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #1E1B2A, #171421)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Kreiraj grupu</h3>
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} style={{color: 'white'}} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Naziv grupe</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="Porodica, Stan, Posao..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Opis (opciono)</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                    placeholder="Kratak opis grupe..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #28EA8A, #11998E)',
                    color: 'white'
                  }}
                >
                  Kreiraj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <div 
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #1E1B2A, #171421)',
                border: '2px solid rgba(228, 88, 110, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{color: '#E4586E'}}>Obriši nalog</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} style={{color: 'white'}} />
                </button>
              </div>

              <div 
                className="p-4 rounded-xl mb-6"
                style={{
                  background: 'rgba(228, 88, 110, 0.1)',
                  border: '1px solid rgba(228, 88, 110, 0.3)'
                }}
              >
                <p className="text-white text-sm mb-3">
                  ⚠️ <strong>Ova akcija je nepovratna!</strong>
                </p>
                <p className="text-white/80 text-sm">
                  Svi vaši podaci, transakcije, grupe i kategorije će biti trajno obrisani. 
                  Nećete moći da povratite ove podatke.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">
                  Upišite <strong style={{color: '#E4586E'}}>OBRIŠI</strong> da potvrdite
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-red-500/50 focus:outline-none transition-colors"
                  placeholder="Upišite OBRIŠI"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "OBRIŠI"}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #E4586E, #C44569)',
                    color: 'white'
                  }}
                >
                  Obriši zauvek
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Group Confirmation Modal */}
        {showLeaveGroupModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{background: "rgba(0,0,0,0.5)"}}
            onClick={() => setShowLeaveGroupModal(false)}
          >
            <div 
              className="rounded-2xl p-6 max-w-md w-full"
              style={{background: "#1C1B29", border: "1px solid #2E2B44"}}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: "rgba(228, 88, 110, 0.15)"}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="#E4586E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{color: "#FFFFFF"}}>Napustiti grupu?</h3>
                  <p className="text-sm" style={{color: "#FFFFFF", opacity: 0.7}}>
                    Da li ste sigurni da želite da napustite grupu <strong>{selectedGroupName}</strong>? Vaše transakcije će ostati sačuvane.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowLeaveGroupModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all duration-300"
                    style={{background: "linear-gradient(135deg, #9F70FF 0%, #1FBFA4 100%)", color: "#FFFFFF"}}
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={confirmLeaveGroup}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300"
                    style={{background: "#E4586E", color: "#FFFFFF"}}
                  >
                    Napusti
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Group Confirmation Modal */}
        {showDeleteGroupModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{background: "rgba(0,0,0,0.5)"}}
            onClick={() => setShowDeleteGroupModal(false)}
          >
            <div 
              className="rounded-2xl p-6 max-w-md w-full"
              style={{background: "#1C1B29", border: "1px solid #2E2B44"}}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: "rgba(239, 68, 68, 0.15)"}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{color: "#FFFFFF"}}>Raspustiti grupu?</h3>
                  <p className="text-sm" style={{color: "#FFFFFF", opacity: 0.7}}>
                    Da li ste sigurni da želite da raspustite grupu <strong>{selectedGroupName}</strong>? Ova akcija je nepovratna. Svi članovi će biti uklonjeni, ali transakcije će ostati sačuvane.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowDeleteGroupModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all duration-300"
                    style={{background: "linear-gradient(135deg, #9F70FF 0%, #1FBFA4 100%)", color: "#FFFFFF"}}
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={confirmDeleteGroup}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300"
                    style={{background: "#EF4444", color: "#FFFFFF"}}
                  >
                    Raspusti
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
