'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, CheckCircle, WarningCircle, Spinner } from '@phosphor-icons/react'

interface OCRResult {
  rawText: string
  amount?: number
  date?: Date
  vendor?: string
  confidence: number
  items?: string[]
  suggestedCategory?: string
}

interface OCRUploadProps {
  onSuccess: (result: OCRResult) => void
  onCancel?: () => void
}

export default function OCRUpload({ onSuccess, onCancel }: OCRUploadProps) {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Molimo izaberite sliku (JPG, PNG, WebP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Slika je prevelika. Maksimalna veličina je 10MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setImage(base64)
      setError(null)
      processImage(base64)
    }
    reader.readAsDataURL(file)
  }

  // Process image with OCR
  const processImage = async (base64Image: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'OCR failed')
      }

      setResult(data.data)
      
      // Auto-accept if confidence is high
      if (data.data.confidence > 0.7) {
        setTimeout(() => {
          onSuccess(data.data)
        }, 1500)
      }
    } catch (err: any) {
      console.error('OCR Error:', err)
      setError(err.message || 'Greška pri OCR procesiranju')
    } finally {
      setLoading(false)
    }
  }

  // Manual correction
  const handleManualEdit = (field: string, value: any) => {
    if (!result) return
    setResult({ ...result, [field]: value })
  }

  // Accept and return result
  const handleAccept = () => {
    if (result) {
      onSuccess(result)
    }
  }

  // Reset
  const handleReset = () => {
    setImage(null)
    setResult(null)
    setError(null)
    setShowRawText(false)
  }

  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{
        background: 'linear-gradient(135deg, rgba(159, 112, 255, 0.05), rgba(76, 139, 234, 0.05))',
        border: '1px solid rgba(159, 112, 255, 0.2)',
      }}
    >
      {/* Close button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <X size={20} />
        </button>
      )}

      <h3
        className="text-xl font-bold mb-4"
        style={{ color: '#9F70FF', fontFamily: '"Inter", sans-serif' }}
      >
        📸 OCR Skeniranje Računa
      </h3>

      {/* Upload buttons */}
      {!image && (
        <div className="flex gap-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #9F70FF, #7B4FD8)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(159, 112, 255, 0.3)',
            }}
          >
            <Camera size={24} weight="bold" />
            Slikaj Račun
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(159, 112, 255, 0.3)',
              color: '#9F70FF',
            }}
          >
            <Upload size={24} weight="bold" />
            Upload Sliku
          </button>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Loading state */}
      {loading && (
        <div className="mt-6 text-center">
          <Spinner size={48} className="animate-spin mx-auto mb-4" style={{ color: '#9F70FF' }} />
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Analiziram račun...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="mt-6 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <WarningCircle size={24} weight="fill" style={{ color: '#EF4444' }} />
          <div>
            <p className="font-semibold" style={{ color: '#EF4444' }}>Greška</p>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Image preview */}
      {image && !loading && (
        <div className="mt-6">
          <img
            src={image}
            alt="Receipt preview"
            className="w-full rounded-xl mb-4"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          <button
            onClick={handleReset}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Izaberi drugu sliku
          </button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          {/* Confidence indicator */}
          <div className="flex items-center gap-3">
            {result.confidence > 0.7 ? (
              <CheckCircle size={24} weight="fill" style={{ color: '#10B981' }} />
            ) : (
              <WarningCircle size={24} weight="fill" style={{ color: '#F59E0B' }} />
            )}
            <div>
              <p className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {result.confidence > 0.7 ? 'Visoka preciznost' : 'Srednja preciznost'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {(result.confidence * 100).toFixed(0)}% sigurnost
              </p>
            </div>
          </div>

          {/* Extracted fields */}
          <div className="space-y-3">
            {/* Amount */}
            {result.amount && (
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Iznos
                </label>
                <input
                  type="number"
                  value={result.amount}
                  onChange={(e) => handleManualEdit('amount', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            )}

            {/* Vendor */}
            {result.vendor && (
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Prodavnica
                </label>
                <input
                  type="text"
                  value={result.vendor}
                  onChange={(e) => handleManualEdit('vendor', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            )}

            {/* Date */}
            {result.date && (
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Datum
                </label>
                <input
                  type="date"
                  value={new Date(result.date).toISOString().split('T')[0]}
                  onChange={(e) => handleManualEdit('date', new Date(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Raw text toggle */}
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showRawText ? 'Sakrij' : 'Prikaži'} originalni tekst
          </button>

          {showRawText && (
            <pre
              className="p-4 rounded-lg text-xs overflow-auto"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                maxHeight: '200px',
              }}
            >
              {result.rawText}
            </pre>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAccept}
              className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
              }}
            >
              ✓ Prihvati
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      {!image && !loading && (
        <div className="mt-6 text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          <p>💡 Saveti za najbolje rezultate:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>Držite račun ravan i dobro osvetljen</li>
            <li>Izbegavajte senke i refleksije</li>
            <li>Fotografišite ceo račun, ne samo deo</li>
            <li>Podržani formati: JPG, PNG, WebP (max 10MB)</li>
          </ul>
        </div>
      )}
    </div>
  )
}
