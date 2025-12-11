"use client"

import { useRouter } from "next/navigation"
import { Wallet, TrendUp, Shield, ChartLine, Users, Receipt, Sparkle, ArrowRight, Check } from "@phosphor-icons/react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: '#0F0F1A'}}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(159, 112, 255, 0.4) 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(69, 211, 138, 0.3) 0%, transparent 70%)', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8 blur-3xl" style={{background: 'radial-gradient(circle, rgba(127, 223, 255, 0.2) 0%, transparent 70%)'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9F70FF] via-[#7FDFFF] to-[#45D38A] rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <Wallet size={24} weight="duotone" style={{color: '#9F70FF'}} />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E8D9FF 50%, #D3FFF2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              Domaćin
            </h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: '#1C1A2E',
                border: '1px solid #2E2B44',
                color: '#FFFFFF',
                fontFamily: '"Inter", sans-serif'
              }}
            >
              Prijava
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                color: '#FFFFFF',
                fontFamily: '"Inter", sans-serif',
                boxShadow: '0 0 25px -10px rgba(159, 112, 255, 0.4)'
              }}
            >
              Registracija
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - PREMIUM REDESIGN */}
      <main className="relative z-10 px-6 min-h-[80vh] lg:min-h-[720px] flex items-center animate-fadeIn" style={{animation: 'fadeIn 0.4s ease-out', paddingTop: '4rem', paddingBottom: '4rem'}}>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.2)'}}>
                <Sparkle size={16} weight="fill" style={{color: '#9F70FF'}} />
                <span className="text-sm font-semibold" style={{color: '#E8D9FF', fontFamily: '"Inter", sans-serif'}}>
                  Moderna finansijska kontrola
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-7">
                <h1 className="text-5xl lg:text-[4rem] font-bold" style={{
                  color: '#FFFFFF',
                  fontFamily: '"Inter", sans-serif',
                  lineHeight: '1.15',
                  letterSpacing: '-0.02em',
                  fontWeight: 700
                }}>
                  Kontrolišite svoje
                  <span className="block mt-3" style={{
                    background: 'linear-gradient(135deg, #9F70FF 0%, #7FDFFF 50%, #45D38A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    finansije lako
                  </span>
                </h1>
                <p className="text-xl mb-2.5" style={{color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif', lineHeight: '1.6', fontWeight: 400}}>
                  Domaćin je moderna aplikacija za praćenje troškova i prihoda. Jednostavno, intuitivno i moćno.
                </p>
                <p className="text-base" style={{color: 'rgba(255, 255, 255, 0.55)', fontFamily: '"Inter", sans-serif', lineHeight: '1.6', fontWeight: 400}}>
                  Pratite troškove, prihode i budžet kroz moćne vizuelizacije i pametne podsetnike — sve potpuno besplatno.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => router.push('/register')}
                  className="group px-9 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                    color: '#FFFFFF',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    boxShadow: '0 0 30px -8px rgba(159, 112, 255, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 40px -5px rgba(159, 112, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 30px -8px rgba(159, 112, 255, 0.5)';
                  }}
                >
                  Započni besplatno
                  <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-9 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: '#1C1A2E',
                    border: '1px solid #2E2B44',
                    color: '#FFFFFF',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: 600
                  }}
                >
                  Prijavite se
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {[
                  { icon: Check, text: 'Bez skrivenih troškova' },
                  { icon: Check, text: 'Besplatno za sve' },
                  { icon: Check, text: 'Sigurni podaci' },
                  { icon: Check, text: 'Automatski backup' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3.5 transition-opacity duration-200 hover:opacity-80 cursor-default"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'rgba(69, 211, 138, 0.15)'}}>
                      <item.icon size={14} weight="bold" style={{color: '#6FFFC4'}} />
                    </div>
                    <span style={{color: 'rgba(255, 255, 255, 0.8)', fontFamily: '"Inter", sans-serif', fontSize: '0.9375rem', fontWeight: 500}}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative lg:translate-y-12" style={{animation: 'fadeUp 0.4s ease-out 0.2s both'}}>
              <div className="relative space-y-4">
                {/* Balance Card */}
                {/* Balance Card */}
                <div
                  className="rounded-3xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-300"
                  style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 0 40px -8px rgba(127, 223, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0, 0, 0, 0.45)';
                  }}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="text-sm font-medium mb-0.5" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif', fontWeight: 500}}>
                        Ukupan bilans
                      </div>
                      <div className="text-3xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif', fontWeight: 700}}>
                        127.450 <span style={{fontSize: '0.5em', opacity: 0.5, fontWeight: 600}}>RSD</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background: 'rgba(127, 223, 255, 0.12)'}}>
                      <Wallet size={24} weight="duotone" style={{color: '#7FDFFF'}} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-lg flex items-center gap-1" style={{background: 'rgba(111, 255, 196, 0.15)', border: '1px solid rgba(111, 255, 196, 0.2)'}}>
                      <TrendUp size={13} weight="bold" style={{color: '#6FFFC4'}} />
                      <span className="text-xs font-semibold" style={{color: '#6FFFC4'}}>+12.5%</span>
                    </div>
                    <span className="text-xs" style={{color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500}}>vs prošli mesec</span>
                  </div>
                </div>

                {/* Transactions Card */}
                <div className="rounded-3xl p-5 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <Receipt size={19} weight="duotone" style={{color: '#9F70FF'}} />
                    <span className="font-semibold text-[0.9375rem]" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif', fontWeight: 600}}>Poslednje transakcije</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Supermarket', amount: '-4.580', color: '#FFB3E6', bg: 'rgba(255, 179, 230, 0.1)' },
                      { name: 'Plata', amount: '+85.000', color: '#6FFFC4', bg: 'rgba(111, 255, 196, 0.1)' },
                      { name: 'Internet', amount: '-2.200', color: '#FFB3E6', bg: 'rgba(255, 179, 230, 0.1)' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg transition-all duration-150"
                        style={{marginLeft: '-8px', marginRight: '-8px'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: item.bg}}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{background: item.color}}></div>
                          </div>
                          <span className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)', fontFamily: '"Inter", sans-serif', fontWeight: 500}}>{item.name}</span>
                        </div>
                        <span className="font-semibold text-sm" style={{color: item.color, fontFamily: '"Inter", sans-serif', fontWeight: 600}}>{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Feature Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { icon: ChartLine, label: 'Statistike', color: '#9F70FF' },
                    { icon: Shield, label: 'Sigurnost', color: '#45D38A' },
                    { icon: Users, label: 'Grupe', color: '#7FDFFF' },
                    { icon: Receipt, label: 'Kategorije', color: '#FFB3E6' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-2xl p-4 shadow-[0_0_30px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default" 
                      style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 0 35px -8px rgba(0, 0, 0, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 30px -12px rgba(0, 0, 0, 0.4)';
                      }}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5" style={{background: `${item.color}15`}}>
                          <item.icon size={22} weight="duotone" style={{color: item.color}} />
                        </div>
                        <div className="text-sm font-medium" style={{color: 'rgba(255, 255, 255, 0.9)', fontFamily: '"Inter", sans-serif', fontWeight: 600}}>{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none" style={{background: 'radial-gradient(circle, rgba(159, 112, 255, 0.5) 0%, transparent 70%)'}}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl p-12 lg:p-14 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]" style={{
            background: 'linear-gradient(145deg, #1E1B2A, #171421)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-5" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif', fontWeight: 700, lineHeight: '1.2'}}>
              Spremni da počnete?
            </h2>
            <p className="text-lg mb-8 max-w-[580px] mx-auto" style={{color: 'rgba(255, 255, 255, 0.65)', fontFamily: '"Inter", sans-serif', fontWeight: 400, lineHeight: '1.6'}}>
              Pridružite se i preuzmite kontrolu nad svojim finansijama danas
            </p>
            <button
              onClick={() => router.push('/register')}
              className="group px-10 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] inline-flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                color: '#FFFFFF',
                fontFamily: '"Inter", sans-serif',
                fontSize: '1.0625rem',
                fontWeight: 600,
                boxShadow: '0 0 30px -8px rgba(159, 112, 255, 0.5)'
              }}
            >
              Kreiraj besplatan nalog
              <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

