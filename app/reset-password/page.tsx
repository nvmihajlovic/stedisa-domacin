'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Nevažeći link za resetovanje. Molimo zatražite novi.',
      })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Lozinke se ne poklapaju',
      })
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Lozinka mora imati najmanje 8 karaktera',
      })
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message,
        })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Greška pri resetovanju lozinke',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Greška pri resetovanju lozinke. Pokušajte ponovo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F17] via-[#1A1A2E] to-[#16162A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              🔒
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            Resetuj lozinku
          </h1>
          <p className="text-gray-400 text-sm">
            Unesite novu lozinku za vaš nalog
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#1E1E2E]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {!token ? (
            <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-300">
              <p className="text-sm">
                Nevažeći link za resetovanje. Molimo zatražite novi.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm text-red-400 hover:text-red-300 underline mt-2 inline-block"
              >
                Zatraži novi link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nova lozinka
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Najmanje 8 karaktera"
                    required
                    className="w-full px-4 py-3 bg-[#0F0F17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Potvrdite lozinku
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ponovite lozinku"
                  required
                  className="w-full px-4 py-3 bg-[#0F0F17] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                />
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= (i + 1) * 2
                            ? password.length < 8
                              ? 'bg-red-500'
                              : password.length < 12
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {password.length < 8
                      ? 'Slaba lozinka'
                      : password.length < 12
                      ? 'Srednja lozinka'
                      : 'Jaka lozinka'}
                  </p>
                </div>
              )}

              {message && (
                <div
                  className={`p-4 rounded-xl border ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading || !password || !confirmPassword || !token
                }
                className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetujem...' : 'Resetuj lozinku'}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Nazad na prijavu
            </Link>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Vaši podaci su bezbedni i šifrovani
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0F0F17] via-[#1A1A2E] to-[#16162A] flex items-center justify-center">
          <div className="text-white">Učitavanje...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
