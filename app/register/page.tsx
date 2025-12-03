"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("inviteToken")
  const inviteEmail = searchParams.get("email")
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState(inviteEmail || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [isInviteRegistration, setIsInviteRegistration] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Lozinke se ne poklapaju")
      return
    }

    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          inviteToken: inviteToken || undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Greška pri registraciji")
        return
      }

      setRegisteredEmail(email)
      
      // Ako je registracija kroz pozivnicu, označi da ne treba verifikacija emaila
      if (inviteToken && data.autoJoinedGroup) {
        setIsInviteRegistration(true)
      }
      
      setSuccess(true)
    } catch (error) {
      setError("Nešto je pošlo naopako")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    // Ako je registracija kroz pozivnicu, prikaži drukčiju poruku
    if (isInviteRegistration) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{background: '#0F0F17'}}>
          <div className="w-full max-w-lg" style={{
            background: 'linear-gradient(145deg, #1A1A2E 0%, #16162A 100%)',
            border: '1px solid rgba(167, 139, 250, 0.15)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)'
          }}>
            <div className="p-8 pb-6" style={{borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-center mb-2" style={{
                color: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: '-0.02em'
              }}>
                Uspešno pridruženi grupi!
              </h1>
              <p className="text-center text-sm" style={{
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                Vaš nalog je kreiran i automatski ste dodati u grupu
              </p>
            </div>

            <div className="p-8">
              <p className="text-sm leading-relaxed mb-6 text-center" style={{
                color: 'rgba(255, 255, 255, 0.65)'
              }}>
                Pre nego što se prijavite, morate verifikovati vašu email adresu. Kliknite na link u email-u koji smo vam poslali.
              </p>

              <div className="p-4 rounded-xl mb-6" style={{
                background: 'rgba(167, 139, 250, 0.08)',
                border: '1px solid rgba(167, 139, 250, 0.2)'
              }}>
                <p className="text-xs text-center" style={{
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <strong style={{ color: '#A78BFA' }}>Napomena:</strong> Nakon verifikacije email adrese, moći ćete da se prijavite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: '#0F0F17'}}>
        <div className="w-full max-w-lg" style={{
          background: 'linear-gradient(145deg, #1A1A2E 0%, #16162A 100%)',
          border: '1px solid rgba(167, 139, 250, 0.15)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)'
        }}>
          {/* Header */}
          <div className="p-8 pb-6" style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2" style={{
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '-0.02em'
            }}>
              Registracija uspešna
            </h1>
            <p className="text-center text-sm" style={{
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              Proverite svoju email adresu
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Email info card */}
            <div className="mb-6 p-5 rounded-2xl" style={{
              background: '#151829',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                    background: 'rgba(167, 139, 250, 0.12)',
                    border: '1px solid rgba(167, 139, 250, 0.2)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-2" style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                  }}>
                    Poslali smo email na
                  </p>
                  <p className="text-base font-bold truncate" style={{
                    color: '#A78BFA'
                  }}>
                    {registeredEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-sm leading-relaxed mb-6 text-center" style={{
              color: 'rgba(255, 255, 255, 0.65)'
            }}>
              Kliknite na link za verifikaciju u email-u da biste aktivirali vaš nalog. Tek nakon verifikacije moći ćete da se prijavite.
            </p>

            {/* Steps */}
            <div className="p-5 rounded-2xl mb-6" style={{
              background: 'rgba(167, 139, 250, 0.08)',
              border: '1px solid rgba(167, 139, 250, 0.2)'
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                    background: 'rgba(167, 139, 250, 0.15)'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs font-semibold" style={{
                  color: '#A78BFA',
                  letterSpacing: '0.02em'
                }}>
                  Sledeći koraci
                </p>
              </div>
              <ol className="space-y-1.5 ml-11" style={{
                listStyleType: 'decimal',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <li className="text-xs leading-relaxed">Otvorite vaš email inbox</li>
                <li className="text-xs leading-relaxed">Pronađite email sa linkom za verifikaciju</li>
                <li className="text-xs leading-relaxed">Kliknite na link da verifikujete nalog</li>
                <li className="text-xs leading-relaxed">Nakon verifikacije bićete redirektovani na login stranicu</li>
                <li className="text-xs leading-relaxed">Link ističe za <strong style={{color: '#A78BFA'}}>7 dana</strong></li>
              </ol>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.15)'
            }}>
              <div className="flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <p className="text-xs leading-relaxed" style={{
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span className="font-semibold" style={{color: '#60A5FA'}}>Napomena:</span> Ako ne vidite email, proverite spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl" style={{background: '#242236'}}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-fintech-gradient bg-clip-text text-transparent mb-2">
            Domaćin
          </h1>
          <div className="h-1 w-20 mx-auto rounded-full" style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)'}}></div>
          <p className="mt-4" style={{color: '#A5A4B6'}}>
            {inviteToken ? 'Registracija kroz pozivnicu' : 'Kreirajte vaš nalog'}
          </p>
        </div>

        {inviteToken && (
          <div className="mb-6 p-4 rounded-xl" style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)'
          }}>
            <p className="text-sm text-center" style={{color: '#A78BFA'}}>
              📨 Pozvan ste da se pridružite grupi
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Ime i prezime</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
              placeholder="Petar Petrović"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!inviteEmail}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{
                background: inviteEmail ? '#16142A' : '#1C1A2E', 
                border: '1px solid #2E2B44',
                opacity: inviteEmail ? 0.7 : 1,
                cursor: inviteEmail ? 'not-allowed' : 'text'
              }}
              placeholder="vas@email.com"
              required
            />
            {inviteEmail && (
              <p className="text-xs mt-1" style={{color: '#A5A4B6'}}>
                Email je određen pozivnicom
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Potvrdi lozinku</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm" style={{background: 'rgba(228, 88, 110, 0.1)', border: '1px solid rgba(228, 88, 110, 0.3)', color: '#E4586E'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)'}}
          >
            {loading ? "Kreiranje..." : "Registruj se"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{color: '#A5A4B6'}}>
          Već imate nalog?{" "}
          <a 
            href={inviteToken ? `/login?inviteToken=${inviteToken}&email=${encodeURIComponent(email)}` : "/login"} 
            style={{color: '#9F70FF'}} 
            className="font-semibold"
          >
            Prijavite se
          </a>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Učitavanje...</div></div>}>
      <RegisterContent />
    </Suspense>
  )
}
