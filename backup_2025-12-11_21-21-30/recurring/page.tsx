'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Lightning } from '@phosphor-icons/react'
import RecurringList from '@/components/RecurringList'

export default function RecurringPage() {
  const router = useRouter()
  const [showInfo, setShowInfo] = useState(true)
  const [showTriggerModal, setShowTriggerModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [resultType, setResultType] = useState<'success' | 'error'>('success')

  const triggerCron = async () => {
    setShowTriggerModal(true)
  }

  const confirmTriggerCron = async () => {
    setShowTriggerModal(false)

    try {
      const response = await fetch('/api/cron/process-recurring', {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        setResultMessage(`Uspešno procesovano ${result.data.processed} transakcija!`)
        setResultType('success')
        setShowResultModal(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResultMessage('Greška: ' + result.error)
        setResultType('error')
        setShowResultModal(true)
      }
    } catch (error) {
      console.error('Error triggering cron:', error)
      setResultMessage('Greška pri pokretanju')
      setResultType('error')
      setShowResultModal(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #121421 0%, #0A0A0F 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 0'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4 transition-colors hover:text-white"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Nazad</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}
              >
                Recurring Transakcije
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Automatski kreirajte troškove i prihode svaki dan, nedelju, mesec ili godinu
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={triggerCron}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FFB800, #FF9500)',
                  color: '#fff'
                }}
                title="Ručno pokreni cron (samo u development modu)"
              >
                <Lightning size={18} weight="fill" />
                Test Cron
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* Info Card */}
        {showInfo && (
          <div
            className="rounded-2xl p-6 mb-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(159, 112, 255, 0.1), rgba(76, 139, 234, 0.05))',
              border: '1px solid rgba(159, 112, 255, 0.2)'
            }}
          >
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              ✕
            </button>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: '#9F70FF', fontFamily: '"Inter", sans-serif' }}
            >
              💡 Kako funkcionišu recurring transakcije?
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <li>• <strong>Automatizacija:</strong> Transakcije se kreiraju automatski na osnovu izabranog perioda</li>
              <li>• <strong>Pause/Resume:</strong> Možete pauzirati recurring transakciju bez brisanja</li>
              <li>• <strong>Cron Job:</strong> Sistem proverava svakog dana u ponoć da li ima novih transakcija</li>
              <li>• <strong>Primeri:</strong> Kirija (mesečno), Plata (mesečno), Netflix (mesečno), Gorivo (nedeljno)</li>
            </ul>
          </div>
        )}

        {/* Create New Button */}
        <div className="mb-6">
          <button
            onClick={() => console.log('Create form dolazi u sledećoj iteraciji!')}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #9F70FF, #7B4FD8)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(159, 112, 255, 0.3)'
            }}
          >
            <Plus size={20} weight="bold" />
            Dodaj Recurring Transakciju
          </button>
        </div>

        {/* List */}
        <RecurringList />

        {/* Vercel Cron Setup Instructions */}
        <div
          className="mt-8 rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: '"Inter", sans-serif' }}
          >
            ⚙️ Setup Automatskog Procesiranja
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>Da bi recurring transakcije funkcionisale automatski, potrebno je podesiti <strong>Vercel Cron Job</strong>:</p>
            
            <div className="mt-4">
              <p className="font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                1. Kreiraj <code className="px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>vercel.json</code> u root folderu:
              </p>
              <pre
                className="p-4 rounded-lg overflow-x-auto"
                style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <code style={{ color: '#9F70FF' }}>
{`{
  "crons": [{
    "path": "/api/cron/process-recurring",
    "schedule": "0 0 * * *"
  }]
}`}
                </code>
              </pre>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                2. Dodaj <code className="px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>CRON_SECRET</code> u Environment Variables:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Idi na Vercel Dashboard → Project Settings → Environment Variables</li>
                <li>Dodaj: <code>CRON_SECRET=your-secret-key-here</code></li>
                <li>Isti key dodaj i u lokalnu <code>.env</code> fajl</li>
              </ul>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                3. Schedule objašnjenje:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>"0 0 * * *"</code> = Svaki dan u ponoć (00:00)</li>
                <li><code>"0 12 * * *"</code> = Svaki dan u podne (12:00)</li>
                <li><code>"0 */6 * * *"</code> = Svakih 6 sati</li>
              </ul>
            </div>

            <p className="mt-4 text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              💡 U development modu možeš ručno pokrenuti cron job klikom na "Test Cron" dugme iznad.
            </p>
          </div>
        </div>
      </div>

      {/* Trigger Cron Confirmation Modal */}
      {showTriggerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{background: "rgba(0,0,0,0.5)"}}
          onClick={() => setShowTriggerModal(false)}
        >
          <div 
            className="rounded-2xl p-6 max-w-md w-full"
            style={{background: "#1C1B29", border: "1px solid #2E2B44"}}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: "rgba(159, 112, 255, 0.15)"}}>
                <Lightning size={32} weight="duotone" style={{color: "#9F70FF"}} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{color: "#FFFFFF"}}>Pokrenuti cron job?</h3>
                <p className="text-sm" style={{color: "#FFFFFF", opacity: 0.7}}>
                  Ovo će ručno pokrenuti kreiranje svih recurring transakcija koje su dosple. Nastaviti?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowTriggerModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all duration-300"
                  style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF"}}
                >
                  Otkaži
                </button>
                <button
                  onClick={confirmTriggerCron}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300"
                  style={{background: "linear-gradient(135deg, #9F70FF 0%, #1FBFA4 100%)", color: "#FFFFFF"}}
                >
                  Pokreni
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{background: "rgba(0,0,0,0.5)"}}
          onClick={() => setShowResultModal(false)}
        >
          <div 
            className="rounded-2xl p-6 max-w-md w-full"
            style={{background: "#1C1B29", border: "1px solid #2E2B44"}}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: resultType === 'success' ? "rgba(31, 191, 164, 0.15)" : "rgba(239, 68, 68, 0.15)"}}>
                {resultType === 'success' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#1FBFA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{color: "#FFFFFF"}}>
                  {resultType === 'success' ? 'Uspešno' : 'Greška'}
                </h3>
                <p className="text-sm" style={{color: "#FFFFFF", opacity: 0.7}}>{resultMessage}</p>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="w-full px-4 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all duration-300"
                style={{background: "linear-gradient(135deg, #9F70FF 0%, #1FBFA4 100%)", color: "#FFFFFF"}}
              >
                U redu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
