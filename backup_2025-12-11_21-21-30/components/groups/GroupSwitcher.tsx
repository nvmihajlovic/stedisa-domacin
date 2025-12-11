"use client"

import { useEffect, useState } from "react"
import { Users, CaretDown, Check } from "phosphor-react"

interface Group {
  id: string
  name: string
  type: "PERMANENT" | "TEMPORARY"
}

interface GroupSwitcherProps {
  currentGroupId?: string | null
  onGroupChange?: () => void
}

export default function GroupSwitcher({ currentGroupId, onGroupChange }: GroupSwitcherProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [currentGroupId])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      if (res.ok) {
        const data = await res.json()
        setGroups(data)
        
        // Find active group
        if (currentGroupId) {
          const active = data.find((g: Group) => g.id === currentGroupId)
          setActiveGroup(active || null)
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const switchGroup = async (groupId: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/switch-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId })
      })

      if (res.ok) {
        const selected = groups.find(g => g.id === groupId)
        setActiveGroup(selected || null)
        setIsOpen(false)
        
        // Notify parent to refresh
        if (onGroupChange) {
          onGroupChange()
        }
      }
    } catch (error) {
      console.error("Error switching group:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:opacity-80 transition-all duration-300 min-w-[220px]"
        style={{
          background: "linear-gradient(135deg, rgba(166, 77, 255, 0.15) 0%, rgba(77, 178, 255, 0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Users size={20} className="text-purple-400" weight="duotone" />
        <div className="flex-1 text-left">
          <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            {groups.length > 0 ? `${groups.length} ${groups.length === 1 ? "grupa" : groups.length < 5 ? "grupe" : "grupa"}` : "Aktivna grupa"}
          </div>
          <div className="text-sm font-semibold text-white">
            {activeGroup ? activeGroup.name : groups.length === 0 ? "Nema grupa" : "Izaberite grupu"}
          </div>
        </div>
        <CaretDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden border"
            style={{
              background: "#1a1b23",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => switchGroup(group.id)}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                style={{
                  background: activeGroup?.id === group.id ? "rgba(166, 77, 255, 0.1)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (activeGroup?.id !== group.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeGroup?.id !== group.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{group.name}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {group.type === "PERMANENT" ? "Stalna" : "Privremena"}
                  </div>
                </div>
                {activeGroup?.id === group.id && (
                  <Check size={20} className="text-green-400" weight="bold" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
