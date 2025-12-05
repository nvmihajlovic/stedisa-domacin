"use client"

import { useState } from "react"
import { X } from "phosphor-react"

type CreateGroupModalProps = {
  onClose: () => void
  onSuccess: () => void
}

type GroupType = "PERMANENT" | "TEMPORARY"
type DurationType = "DAYS_7" | "DAYS_10" | "DAYS_15" | "DAYS_30" | "YEAR_1" | "CUSTOM"

export default function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<GroupType>("PERMANENT")
  const [durationType, setDurationType] = useState<DurationType>("DAYS_7")
  const [customEndDate, setCustomEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError("Naziv grupe je obavezan")
      return
    }

    if (name.length < 3) {
      setError("Naziv mora imati najmanje 3 karaktera")
      return
    }

    if (type === "TEMPORARY" && durationType === "CUSTOM" && !customEndDate) {
      setError("Za custom trajanje morate izabrati datum")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        type
      }

      if (type === "TEMPORARY") {
        payload.durationType = durationType
        if (durationType === "CUSTOM") {
          payload.customEndDate = customEndDate
        }
      }

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        setError(data.error || "Greška pri kreiranju grupe")
      }
    } catch (err) {
      setError("Greška pri kreiranju grupe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Kreiraj novu grupu
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Naziv grupe *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite naziv grupe"
              maxLength={50}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 karaktera
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opis (opciono)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kratak opis grupe"
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 karaktera
            </p>
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tip grupe *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("PERMANENT")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  type === "PERMANENT"
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
                disabled={loading}
              >
                Stalna
              </button>
              <button
                type="button"
                onClick={() => setType("TEMPORARY")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  type === "TEMPORARY"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
                disabled={loading}
              >
                Privremena
              </button>
            </div>
          </div>

          {/* Duration Type - Only for Temporary */}
          {type === "TEMPORARY" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trajanje *
                </label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as DurationType)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                >
                  <option value="DAYS_7">7 dana</option>
                  <option value="DAYS_10">10 dana</option>
                  <option value="DAYS_15">15 dana</option>
                  <option value="DAYS_30">30 dana (1 mesec)</option>
                  <option value="YEAR_1">1 godina</option>
                  <option value="CUSTOM">Custom (izaberi datum)</option>
                </select>
              </div>

              {/* Custom End Date - Only for CUSTOM duration */}
              {durationType === "CUSTOM" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Datum isteka *
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              disabled={loading}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Kreiranje..." : "Kreiraj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
