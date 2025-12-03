"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Check, X, Spinner } from "@phosphor-icons/react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Nedostaje token za verifikaciju.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Email uspešno verifikovan!")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Verifikacija nije uspela.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Došlo je do greške prilikom verifikacije.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: '#0F0F1A'}}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(159, 112, 255, 0.4) 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(69, 211, 138, 0.3) 0%, transparent 70%)', animationDelay: '1s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]" style={{
          background: 'linear-gradient(145deg, #1E1B2A, #171421)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9F70FF] via-[#7FDFFF] to-[#45D38A] rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}>
                {status === "loading" && <Spinner size={32} weight="bold" style={{color: '#7FDFFF'}} className="animate-spin" />}
                {status === "success" && <Check size={32} weight="bold" style={{color: '#6FFFC4'}} />}
                {status === "error" && <X size={32} weight="bold" style={{color: '#FFB3E6'}} />}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
              {status === "loading" && "Verifikujem email..."}
              {status === "success" && "Email verifikovan! ✓"}
              {status === "error" && "Verifikacija neuspešna"}
            </h1>
            
            <p className="text-base mb-6" style={{color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif', lineHeight: '1.6'}}>
              {message}
            </p>

            {status === "success" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{background: 'rgba(111, 255, 196, 0.15)', border: '1px solid rgba(111, 255, 196, 0.2)'}}>
                <span className="text-sm font-semibold" style={{color: '#6FFFC4', fontFamily: '"Inter", sans-serif'}}>
                  Prebacujemo vas na prijavu...
                </span>
              </div>
            )}

            {status === "error" && (
              <button
                onClick={() => router.push("/register")}
                className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                  color: '#FFFFFF',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 0 30px -8px rgba(159, 112, 255, 0.5)'
                }}
              >
                Pokušaj ponovo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Učitavanje...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
