"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface OCRResult {
  rawText: string
  amount?: number
  date?: string
  vendor?: string
  confidence: number
  suggestedCategory?: {
    id: string
    name: string
    icon: string
    color: string
  }
  isUserPreference?: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function TestVendorLearningPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [savedMapping, setSavedMapping] = useState<any>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setOcrResult(null)
      setSavedMapping(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Molimo vas izaberite fajl pre nego što kliknete na OCR dugme")
      return
    }

    // Additional validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError("Nepodržan format. Koristite JPG, PNG, WebP ili PDF")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError("Fajl je prevelik. Maksimalna veličina je 10MB")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Fetch categories
      const categoriesRes = await fetch("/api/categories")
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData.categories || [])

      // Upload for OCR
      const formData = new FormData()
      formData.append("receipt", file)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "OCR failed")
      }

      // Map extractedData to expected format
      const mappedResult = {
        amount: data.extractedData?.amount || data.amount,
        vendor: data.extractedData?.vendorName || data.vendor,
        date: data.extractedData?.date || data.date,
        confidence: data.metadata?.confidence || data.confidence,
        suggestedCategory: data.extractedData?.suggestedCategory || data.suggestedCategory,
        isUserPreference: data.extractedData?.isUserPreference || data.isUserPreference,
        rawText: data.extractedData?.rawText || data.rawText || ""
      }

      setOcrResult(mappedResult)
      
      // Auto-select suggested category
      if (mappedResult.suggestedCategory?.id) {
        setSelectedCategoryId(mappedResult.suggestedCategory.id)
      }

      console.log("✅ OCR Result:", mappedResult)
    } catch (err: any) {
      setError(err.message || "Greška prilikom OCR obrade")
      console.error("❌ OCR Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMapping = async () => {
    if (!ocrResult?.vendor || !selectedCategoryId) {
      setError("Morate izabrati kategoriju")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/vendor-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorName: ocrResult.vendor,
          categoryId: selectedCategoryId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save mapping")
      }

      setSavedMapping(data)
      console.log("✅ Mapping saved:", data)
    } catch (err: any) {
      setError(err.message || "Greška prilikom čuvanja")
      console.error("❌ Save Error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setOcrResult(null)
    setSelectedCategoryId("")
    setSavedMapping(null)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F17] via-[#1A1A2E] to-[#16213E] p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          ← Nazad
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">
          🧪 Test: Vendor-Category Learning System
        </h1>
        <p className="text-white/60 mb-8">
          Testiranje kompletnog flow-a: OCR → Vendor Detection → Category Suggestion → Save Mapping → Retest
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Upload & OCR */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">
              📤 Step 1: Upload Račun
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2 text-sm">
                  Izaberi račun
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
                {file && (
                  <p className="mt-2 text-sm text-green-400">
                    ✓ {file.name}
                  </p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading || !file
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#9F70FF] to-[#7C3AED] text-white hover:shadow-lg"
                }`}
              >
                {loading ? "⏳ OCR u toku..." : "🔍 Pokreni OCR"}
              </button>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">❌ {error}</p>
                </div>
              )}

              {ocrResult && (
                <div className="space-y-3 mt-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h3 className="font-bold text-green-400 mb-2">✅ OCR Rezultat</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Vendor:</span>
                        <span className="text-white font-semibold">{ocrResult.vendor || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Iznos:</span>
                        <span className="text-white font-semibold">
                          {ocrResult.amount ? `${ocrResult.amount.toLocaleString('sr-RS')} RSD` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Datum:</span>
                        <span className="text-white">
                          {ocrResult.date ? new Date(ocrResult.date).toLocaleDateString('sr-RS') : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {ocrResult.suggestedCategory && (
                    <div className={`p-4 rounded-xl border ${
                      ocrResult.isUserPreference 
                        ? 'bg-yellow-500/10 border-yellow-500/20' 
                        : 'bg-purple-500/10 border-purple-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{ocrResult.suggestedCategory.icon}</span>
                        <div>
                          <h3 className={`font-bold ${
                            ocrResult.isUserPreference ? 'text-yellow-400' : 'text-purple-400'
                          }`}>
                            {ocrResult.isUserPreference ? '⭐ Tvoj omiljeni izbor' : '💡 Predložena kategorija'}
                          </h3>
                          <p className="text-white text-sm">{ocrResult.suggestedCategory.name}</p>
                        </div>
                      </div>
                      {ocrResult.isUserPreference && (
                        <p className="text-xs text-yellow-400/70 mt-2">
                          Ranije si koristio ovu kategoriju za ovog vendora
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Category Selection & Save */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">
              🎯 Step 2: Izaberi/Potvrdi Kategoriju
            </h2>

            {!ocrResult ? (
              <p className="text-white/40 text-center py-12">
                Prvo uploaduj račun
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 mb-2 text-sm">
                    Kategorija
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="">-- Izaberi kategoriju --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveMapping}
                  disabled={saving || !selectedCategoryId || !ocrResult.vendor}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    saving || !selectedCategoryId || !ocrResult.vendor
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                  }`}
                >
                  {saving ? "💾 Čuvanje..." : "💾 Sačuvaj Vendor-Category Mapping"}
                </button>

                {savedMapping && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h3 className="font-bold text-green-400 mb-2">✅ Mapping Sačuvan!</h3>
                    <div className="text-sm space-y-1 text-white/80">
                      <p>Vendor: <strong>{savedMapping.vendorName}</strong></p>
                      <p>Kategorija: <strong>{savedMapping.categoryName}</strong></p>
                      <p>Broj korišćenja: <strong>{savedMapping.usageCount}x</strong></p>
                    </div>
                    <p className="text-xs text-green-400/70 mt-3">
                      Sledeći put kada uploaduješ račun od "{ocrResult.vendor}", 
                      ova kategorija će biti automatski predložena sa "⭐ Tvoj omiljeni izbor" oznakom!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
                >
                  🔄 Reset (Testiraj ponovo)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-bold text-blue-400 mb-3">📋 Test Procedura</h3>
          <ol className="text-white/80 space-y-2 text-sm list-decimal list-inside">
            <li>Upload račun (npr. EPS, Maxi, OMV, Lidl)</li>
            <li>Proveri da li je vendor pravilno detektovan</li>
            <li>Ako je prva upotreba: predlog će biti generička kategorija ili prazno</li>
            <li>Izaberi kategoriju i klikni "Sačuvaj Mapping"</li>
            <li>Klikni "Reset" i upload-uj **isti račun ponovo**</li>
            <li>✅ Proveri da li sada vidiš "⭐ Tvoj omiljeni izbor" sa tvojom kategorijom!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
