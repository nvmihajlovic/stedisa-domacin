"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("inviteToken")
  const inviteEmail = searchParams.get("email")
  
  const [email, setEmail] = useState(inviteEmail || "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleResendVerification = async () => {
    if (!email) {
      setError("Unesite email adresu")
      return
    }

    setLoading(true)
    setResendMessage("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setResendMessage(data.message)
        setShowResendVerification(false)
      } else {
        setError(data.error || "Greška pri slanju emaila")
      }
    } catch (error) {
      setError("Greška pri slanju emaila")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Greška pri prijavi")
        // Ako je email nije verifikovan, prikaži opciju za ponovno slanje
        if (res.status === 403) {
          setShowResendVerification(true)
        }
        return
      }

      // Ako postoji pozivnica, prihvati je nakon login-a
      if (inviteToken) {
        try {
          const joinRes = await fetch("/api/group/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: inviteToken }),
          })

          if (joinRes.ok) {
            router.push("/groups")
            router.refresh()
            return
          }
        } catch (e) {
          console.error("Error joining group after login:", e)
        }
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setError("Greška pri prijavi")
    } finally {
      setLoading(false)
    }
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
            {inviteToken ? 'Prijavite se da prihvatite pozivnicu' : 'Prijavite se na vaš nalog'}
          </p>
        </div>

        {inviteToken && (
          <div className="mb-6 p-4 rounded-xl" style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)'
          }}>
            <p className="text-sm text-center" style={{color: '#A78BFA'}}>
              📨 Nakon prijave bićete automatski pridruženi grupi
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
              placeholder="vas@email.com"
              required
            />
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

          <div className="text-right">
            <a 
              href="/forgot-password" 
              style={{color: '#9F70FF'}} 
              className="text-sm font-medium hover:underline"
            >
              Zaboravili ste lozinku?
            </a>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm" style={{background: 'rgba(228, 88, 110, 0.1)', border: '1px solid rgba(228, 88, 110, 0.3)', color: '#E4586E'}}>
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="p-3 rounded-xl text-sm" style={{background: 'rgba(69, 211, 138, 0.1)', border: '1px solid rgba(69, 211, 138, 0.3)', color: '#45D38A'}}>
              {resendMessage}
            </div>
          )}

          {showResendVerification && (
            <div className="p-3 rounded-xl text-sm text-center" style={{background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#9F70FF'}}>
              <p className="mb-2">Email nije verifikovan. Niste dobili email?</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-sm font-semibold underline hover:no-underline"
                style={{color: '#9F70FF'}}
              >
                Pošalji ponovo verification email
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)'}}
          >
            {loading ? "Prijava..." : "Prijavi se"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{color: '#A5A4B6'}}>
          Nemate nalog?{" "}
          <a href="/register" style={{color: '#9F70FF'}} className="font-semibold">
            Registrujte se
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Učitavanje...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}
