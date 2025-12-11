"use client"

import { useEffect, useState } from "react"
import { Users, Clock, X } from "phosphor-react"

type GroupType = "PERMANENT" | "TEMPORARY"

interface ActiveGroup {
  id: string
  name: string
  type: GroupType
  endDate?: string | null
  isActive: boolean
}

export default function ActiveGroupIndicator() {
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    fetchActiveGroup()
  }, [])

  useEffect(() => {
    if (activeGroup?.type === "TEMPORARY" && activeGroup.endDate) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(activeGroup.endDate!)
        setTimeRemaining(remaining)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [activeGroup])

  const fetchActiveGroup = async () => {
    try {
      const res = await fetch("/api/user/active-group")
      if (res.ok) {
        const data = await res.json()
        setActiveGroup(data.activeGroup)
      }
    } catch (error) {
      console.error("Error fetching active group:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeRemaining = (endDate: string): string => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff <= 0) {
      return "Isteklo"
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (loading) {
    return null
  }

  if (!activeGroup) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
        <Users size={20} className="text-gray-400" weight="duotone" />
        <span className="text-sm text-gray-400">Nema aktivne grupe</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
      <Users size={20} className="text-purple-400" weight="duotone" />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{activeGroup.name}</span>
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
              activeGroup.type === "PERMANENT"
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
            }`}
          >
            {activeGroup.type === "PERMANENT" ? "Stalna" : "Privremena"}
          </span>
        </div>
        
        {activeGroup.type === "TEMPORARY" && timeRemaining && (
          <div className="flex items-center gap-1 mt-1">
            <Clock size={14} className="text-gray-400" weight="duotone" />
            <span className="text-xs text-gray-400">
              {timeRemaining === "Isteklo" ? (
                <span className="text-red-400">Istekla</span>
              ) : (
                <>Preostalo: {timeRemaining}</>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
