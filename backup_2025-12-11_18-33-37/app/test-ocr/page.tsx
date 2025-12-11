"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TestOCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setResult(null)
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
        rawText: data.extractedData?.rawText || data.rawText || "",
        fullResponse: data
      }

      setResult(mappedResult)
      console.log("✅ OCR Result:", mappedResult)
    } catch (err: any) {
      setError(err.message || "Greška prilikom OCR obrade")
      console.error("❌ OCR Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F17] via-[#1A1A2E] to-[#16213E] p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          ← Nazad
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">
          🧪 OCR Test - EPS Račun
        </h1>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-medium">
                Upload EPS račun (slika ili PDF)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
              {file && (
                <p className="mt-2 text-sm text-green-400">
                  ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`w-full py-4 rounded-xl font-semibold transition-all ${
                loading || !file
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#9F70FF] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-500/50"
              }`}
            >
              {loading ? "⏳ OCR u toku..." : "🔍 Pokreni OCR"}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400">❌ {error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h2 className="text-xl font-bold text-green-400 mb-4">
                    ✅ OCR Rezultat
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-white/70">Iznos:</span>
                      <span className="text-2xl font-bold text-white">
                        {result.amount ? `${result.amount.toLocaleString('sr-RS')} RSD` : "❌ Nije pronađen"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-white/70">Vendor:</span>
                      <span className="text-lg font-semibold text-white">
                        {result.vendor || "❌ Nije pronađen"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-white/70">Datum:</span>
                      <span className="text-white">
                        {result.date ? new Date(result.date).toLocaleDateString('sr-RS') : "❌ Nije pronađen"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                      <span className="text-white/70">Confidence:</span>
                      <span className="text-white">
                        {result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : "N/A"}
                      </span>
                    </div>

                    {result.suggestedCategory && (
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <span className="text-white/70">💡 Suggested Category:</span>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-2xl">{result.suggestedCategory.icon}</span>
                          <span className="text-white font-semibold">
                            {result.suggestedCategory.name}
                          </span>
                          {result.isUserPreference && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                              ⭐ Tvoj omiljeni izbor
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <details>
                    <summary className="cursor-pointer text-white/70 font-semibold mb-2">
                      📄 Raw OCR Text
                    </summary>
                    <pre className="text-xs text-white/60 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                      {result.rawText || "N/A"}
                    </pre>
                  </details>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <details>
                    <summary className="cursor-pointer text-white/70 font-semibold mb-2">
                      🔍 Full JSON Response
                    </summary>
                    <pre className="text-xs text-white/60 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                      {JSON.stringify(result.fullResponse, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
