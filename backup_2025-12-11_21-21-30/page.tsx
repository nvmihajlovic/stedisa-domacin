"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Wallet, TrendUp, Shield, ChartLine, Users, Receipt, Sparkle, ArrowRight, Check, Tag, ChartPieSlice, UserPlus, ForkKnife, Car, House, FilmSlate, FirstAid, ShoppingBag, GraduationCap } from "@phosphor-icons/react"

export default function LandingPage() {
  const router = useRouter()
  const [activeSlide, setActiveSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      // Swipe left - next slide
      setActiveSlide((prev) => (prev + 1) % 4)
    }
    if (isRightSwipe) {
      // Swipe right - previous slide
      setActiveSlide((prev) => (prev - 1 + 4) % 4)
    }
  }

  // Auto-rotate carousel every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const slides = [
    {
      title: "Dashboard - Pregled finansija",
      description: "Sve vaše finansije na jednom mestu",
      content: (
        <div className="space-y-4">
          {/* Balance Card */}
          <div 
            className="rounded-2xl p-5 md:p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-in-out hover:scale-[1.02]" 
            style={{background: 'linear-gradient(180deg, #121421 0%, #151726 100%)', border: '1px solid rgba(255,255,255,0.08)'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(127, 223, 255, 0.15), 0 0 35px -10px rgba(0,0,0,0.45)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0,0,0,0.45)'}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <div className="text-sm font-medium mb-0.5" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif'}}>Ukupan bilans</div>
                <div className="text-2xl md:text-4xl font-bold" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                  127.450 <span style={{fontSize: '0.5em', opacity: 0.5}}>RSD</span>
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
              <span className="text-xs" style={{color: 'rgba(255, 255, 255, 0.4)'}}>vs prošli mesec</span>
            </div>
          </div>
          {/* Transactions */}
          <div 
            className="rounded-2xl p-5 md:p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-in-out hover:scale-[1.02]" 
            style={{background: 'linear-gradient(180deg, #121421 0%, #151726 100%)', border: '1px solid rgba(255,255,255,0.08)'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(159, 112, 255, 0.15), 0 0 35px -10px rgba(0,0,0,0.45)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0,0,0,0.45)'}
          >
            <div className="flex items-center gap-3 mb-3">
              <Receipt size={19} weight="duotone" style={{color: '#9F70FF'}} />
              <span className="font-semibold text-base" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Poslednje transakcije</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Supermarket', amount: '-4.580', color: '#FFB3E6', bg: 'rgba(255, 179, 230, 0.1)' },
                { name: 'Plata', amount: '+85.000', color: '#6FFFC4', bg: 'rgba(111, 255, 196, 0.1)' },
                { name: 'Internet', amount: '-2.200', color: '#FFB3E6', bg: 'rgba(255, 179, 230, 0.1)' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.02)'}}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: item.bg}}>
                      <Receipt size={16} weight="duotone" style={{color: item.color}} />
                    </div>
                    <span style={{color: '#FFFFFF', fontSize: '14px', fontWeight: 500}}>{item.name}</span>
                  </div>
                  <span style={{color: item.color, fontSize: '15px', fontWeight: 600}}>{item.amount} RSD</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Statistike - Detaljni izveštaji",
      description: "Grafički prikaz vaših troškova",
      content: (
        <div className="space-y-4">
          <div 
            className="rounded-2xl p-5 md:p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-in-out hover:scale-[1.02]" 
            style={{background: 'linear-gradient(180deg, #121421 0%, #151726 100%)', border: '1px solid rgba(255,255,255,0.08)'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(159, 112, 255, 0.15), 0 0 35px -10px rgba(0,0,0,0.45)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0,0,0,0.45)'}
          >
            <div className="flex items-center gap-3 mb-4">
              <ChartPieSlice size={22} weight="duotone" style={{color: '#9F70FF'}} />
              <span className="font-semibold text-lg" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Troškovi po kategorijama</span>
            </div>
            <div className="space-y-3">
              {[
                { category: 'Hrana i piće', percent: 30, amount: '27.000', color: '#EF4444' },
                { category: 'Prevoz', percent: 22, amount: '19.800', color: '#F59E0B' },
                { category: 'Stanovanje', percent: 18, amount: '16.200', color: '#3B82F6' },
                { category: 'Zabava', percent: 15, amount: '13.500', color: '#8B5CF6' },
                { category: 'Kupovina', percent: 10, amount: '9.000', color: '#EC4899' },
                { category: 'Zdravlje', percent: 5, amount: '4.500', color: '#10B981' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{background: item.color}}></div>
                      <span style={{color: '#FFFFFF', fontSize: '14px', fontWeight: 500}}>{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span style={{color: '#FFFFFF', fontSize: '14px', fontWeight: 600}}>{item.percent}%</span>
                      <span style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '6px'}}>{item.amount} RSD</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background: 'rgba(255,255,255,0.05)'}}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{width: `${item.percent}%`, background: item.color}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Grupe - Zajednički troškovi",
      description: "Pratite troškove sa više osoba",
      content: (
        <div className="space-y-4">
          <div 
            className="rounded-2xl p-5 md:p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-in-out hover:scale-[1.02]" 
            style={{background: 'linear-gradient(180deg, #121421 0%, #151726 100%)', border: '1px solid rgba(255,255,255,0.08)'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(69, 211, 138, 0.15), 0 0 35px -10px rgba(0,0,0,0.45)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0,0,0,0.45)'}
          >
            <div className="flex items-center gap-3 mb-4">
              <Users size={22} weight="duotone" style={{color: '#45D38A'}} />
              <span className="font-semibold text-lg" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Moje grupe</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Stan sa cimerom', members: 2, balance: '+2.450', color: '#6FFFC4' },
                { name: 'Porodica', members: 4, balance: '-1.200', color: '#FFB3E6' },
                { name: 'Putovanje Kopaonik', members: 5, balance: '-120.000', color: '#FFB3E6' }
              ].map((group, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(69, 211, 138, 0.12)'}}>
                        <Users size={20} weight="duotone" style={{color: '#45D38A'}} />
                      </div>
                      <div>
                        <div style={{color: '#FFFFFF', fontSize: '15px', fontWeight: 600}}>{group.name}</div>
                        <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '13px'}}>{group.members} članova</div>
                      </div>
                    </div>
                    <div style={{color: group.color, fontSize: '16px', fontWeight: 700}}>{group.balance} RSD</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{background: 'rgba(69, 211, 138, 0.1)', border: '1px solid rgba(69, 211, 138, 0.2)'}}>
              <UserPlus size={18} weight="bold" style={{color: '#45D38A'}} />
              <span style={{color: '#45D38A', fontSize: '14px', fontWeight: 600}}>Kreiraj novu grupu</span>
            </button>
          </div>
          {/* Quick Info */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold" style={{color: '#45D38A', fontFamily: '"Inter", sans-serif'}}>Grupni</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif'}}>troškovi</div>
            </div>
            <div className="w-px h-6" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{color: '#7FDFFF', fontFamily: '"Inter", sans-serif'}}>Više</div>
              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif'}}>članova</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Kategorije - Organizacija",
      description: "Organizujte troškove po kategorijama",
      content: (
        <div className="space-y-4">
          <div 
            className="rounded-2xl p-5 md:p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-in-out hover:scale-[1.02]" 
            style={{background: 'linear-gradient(180deg, #121421 0%, #151726 100%)', border: '1px solid rgba(255,255,255,0.08)'}}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 179, 230, 0.15), 0 0 35px -10px rgba(0,0,0,0.45)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 35px -10px rgba(0,0,0,0.45)'}
          >
            <div className="flex items-center gap-3 mb-4">
              <Tag size={22} weight="duotone" style={{color: '#FFB3E6'}} />
              <span className="font-semibold text-lg" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>Kategorije troškova</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Hrana', icon: ForkKnife, color: '#EF4444' },
                { name: 'Transport', icon: Car, color: '#3B82F6' },
                { name: 'Stanovanje', icon: House, color: '#8B5CF6' },
                { name: 'Zabava', icon: FilmSlate, color: '#EC4899' },
                { name: 'Zdravlje', icon: FirstAid, color: '#10B981' },
                { name: 'Kupovina', icon: ShoppingBag, color: '#F59E0B' },
                { name: 'Obrazovanje', icon: GraduationCap, color: '#3B82F6' },
                { name: 'Ostalo', icon: Tag, color: '#6B7280' }
              ].map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl transition-all hover:scale-[1.02]" style={{background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${cat.color}30`}}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: `${cat.color}20`}}>
                      <cat.icon size={20} weight="duotone" style={{color: cat.color}} />
                    </div>
                    <div style={{color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>
                      {cat.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: '#0F0F1A', filter: 'brightness(1.03)'}}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(159, 112, 255, 0.4) 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'radial-gradient(circle, rgba(69, 211, 138, 0.3) 0%, transparent 70%)', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8 blur-3xl" style={{background: 'radial-gradient(circle, rgba(127, 223, 255, 0.2) 0%, transparent 70%)'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-8 lg:px-12 lg:py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9F70FF] via-[#7FDFFF] to-[#45D38A] rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(145deg, #1E1B2A, #171421)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <Wallet size={24} weight="duotone" style={{color: '#9F70FF'}} />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E8D9FF 50%, #D3FFF2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              Domacin
            </h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base rounded-xl font-semibold transition-all duration-200 hover:scale-105"
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
              className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base rounded-xl font-semibold transition-all duration-200 hover:scale-105"
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
      <main className="relative z-10 px-4 md:px-6 py-6 md:py-12 lg:py-20 min-h-[70vh] lg:min-h-[720px] flex items-center animate-fadeIn" style={{animation: 'fadeIn 0.4s ease-out'}}>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto w-full px-0" style={{maxWidth: '1360px'}}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-6 md:space-y-8 max-w-full md:max-w-none text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full animate-pulse" style={{
                background: 'rgba(159, 112, 255, 0.1)', 
                border: '1px solid rgba(159, 112, 255, 0.2)',
                boxShadow: '0 0 20px rgba(159, 112, 255, 0.15)'
              }}>
                <Sparkle size={16} weight="fill" style={{color: '#9F70FF'}} />
                <span className="text-xs sm:text-sm font-semibold" style={{color: '#E8D9FF', fontFamily: '"Inter", sans-serif'}}>
                  Moderna finansijska kontrola
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-5 md:space-y-7">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold" style={{
                  color: '#FFFFFF',
                  fontFamily: '"Inter", sans-serif',
                  lineHeight: '1.20',
                  letterSpacing: '-0.02em',
                  fontWeight: 700
                }}>
                  Kontrolišite svoje
                  <span className="block mt-3" style={{
                    background: 'linear-gradient(135deg, #9F70FF 0%, #78E1FF 50%, #45D38A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    finansije lako
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl max-w-[90%] mx-auto md:mx-0" style={{color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif', lineHeight: '1.6', fontWeight: 400}}>
                  Domaćin je moderna aplikacija za praćenje troškova i prihoda. Pratite budžet kroz moćne vizuelizacije i pametne podsetnike - sve potpuno besplatno.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 w-full max-w-md mx-auto md:mx-0 md:flex-row md:w-auto md:max-w-none pt-3 md:pt-4">
                <button
                  onClick={() => router.push('/register')}
                  className="group relative w-full md:w-auto px-8 md:px-9 py-3.5 md:py-[15px] rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                    color: '#FFFFFF',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    boxShadow: '0 0 30px -8px rgba(159, 112, 255, 0.5), 0 8px 16px -4px rgba(159, 112, 255, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 40px -5px rgba(159, 112, 255, 0.7), 0 12px 24px -6px rgba(159, 112, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 30px -8px rgba(159, 112, 255, 0.5), 0 8px 16px -4px rgba(159, 112, 255, 0.25)';
                  }}
                >
                  <span className="relative z-10">Započni besplatno</span>
                  <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform relative z-10" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                  }}></div>
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full md:w-auto px-8 md:px-9 py-3.5 md:py-[15px] rounded-xl font-semibold transition-all duration-300"
                  style={{
                    background: 'rgba(28, 26, 46, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #2E2B44',
                    color: '#FFFFFF',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(46, 43, 68, 0.8)';
                    e.currentTarget.style.borderColor = '#3E3B54';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(28, 26, 46, 0.6)';
                    e.currentTarget.style.borderColor = '#2E2B44';
                  }}
                >
                  Prijavite se
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-8">
                {[
                  { icon: Check, text: 'Bez skrivenih troškova' },
                  { icon: Check, text: 'Besplatno za sve' },
                  { icon: Check, text: 'Sigurni podaci' },
                  { icon: Check, text: 'Automatski backup' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2.5 sm:gap-3.5 group cursor-default"
                    style={{
                      opacity: 0,
                      animation: `fadeUp 0.5s ease-out ${0.1 + idx * 0.1}s forwards`
                    }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110" 
                      style={{
                        background: 'rgba(69, 211, 138, 0.15)',
                        boxShadow: '0 0 0 0 rgba(69, 211, 138, 0.4)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 0 4px rgba(69, 211, 138, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 0 rgba(69, 211, 138, 0.4)'}
                    >
                      <item.icon size={14} weight="bold" style={{color: '#6FFFC4'}} />
                    </div>
                    <span className="transition-all duration-200 group-hover:translate-x-0.5" style={{color: 'rgba(255, 255, 255, 0.85)', fontFamily: '"Inter", sans-serif', fontSize: '14.5px', fontWeight: 500}}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Interactive Carousel */}
            <div className="relative lg:translate-y-12 mt-12 lg:mt-0 w-full max-w-md mx-auto lg:max-w-none" style={{
              opacity: 0,
              animation: 'fadeUp 0.6s ease-out 0.3s forwards'
            }}>
              {/* Slide Title & Description */}
              <div className="mb-4 text-center lg:text-left">
                <div 
                  key={activeSlide}
                  className="transition-all duration-500"
                  style={{animation: 'fadeIn 0.5s ease-out'}}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-2 transition-all duration-300" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif'}}>
                    {slides[activeSlide].title}
                  </h3>
                  <p className="text-sm md:text-base transition-all duration-300" style={{color: 'rgba(255, 255, 255, 0.6)', fontFamily: '"Inter", sans-serif'}}>
                    {slides[activeSlide].description}
                  </p>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className="transition-all duration-300 rounded-full hover:scale-110 cursor-pointer"
                    style={{
                      width: activeSlide === index ? '38px' : '8px',
                      height: activeSlide === index ? '10px' : '8px',
                      background: activeSlide === index 
                        ? 'linear-gradient(135deg, #9F70FF, #4C8BEA)' 
                        : 'rgba(255, 255, 255, 0.2)',
                      boxShadow: activeSlide === index ? '0 0 18px rgba(255, 255, 255, 0.25), 0 0 8px rgba(159, 112, 255, 0.5)' : 'none',
                      opacity: activeSlide === index ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (activeSlide !== index) {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSlide !== index) {
                        e.currentTarget.style.opacity = '0.5';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Carousel Container */}
              <div className="relative">
                {/* Slides */}
                <div 
                  className="relative overflow-hidden rounded-3xl touch-pan-y" 
                  style={{minHeight: '420px'}}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        opacity: activeSlide === index ? 1 : 0,
                        pointerEvents: activeSlide === index ? 'auto' : 'none',
                        transitionTimingFunction: 'ease-in-out'
                      }}
                    >
                      {slide.content}
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-8 mt-5 px-4">
                  <div className="text-center group cursor-default">
                    <div className="text-2xl font-bold transition-all duration-300 group-hover:scale-110" style={{color: '#9F70FF', fontFamily: '"Inter", sans-serif', fontSize: '1.625rem'}}>100%</div>
                    <div className="text-xs transition-all duration-300 group-hover:text-white/70" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif', fontSize: '0.8125rem'}}>Besplatno</div>
                  </div>
                  <div className="w-px h-8" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
                  <div className="text-center group cursor-default">
                    <div className="text-2xl font-bold transition-all duration-300 group-hover:scale-110" style={{color: '#45D38A', fontFamily: '"Inter", sans-serif', fontSize: '1.625rem'}}>∞</div>
                    <div className="text-xs transition-all duration-300 group-hover:text-white/70" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif', fontSize: '0.8125rem'}}>Transakcije</div>
                  </div>
                  <div className="w-px h-8" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
                  <div className="text-center group cursor-default">
                    <div className="text-2xl font-bold transition-all duration-300 group-hover:scale-110" style={{color: '#7FDFFF', fontFamily: '"Inter", sans-serif', fontSize: '1.625rem'}}>OCR</div>
                    <div className="text-xs transition-all duration-300 group-hover:text-white/70" style={{color: 'rgba(255, 255, 255, 0.5)', fontFamily: '"Inter", sans-serif', fontSize: '0.8125rem'}}>Skeniranje</div>
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none" style={{background: 'radial-gradient(circle, rgba(159, 112, 255, 0.5) 0%, transparent 70%)'}}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <section className="relative z-10 px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl p-6 sm:p-8 md:p-12 lg:p-14 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.05)] relative overflow-hidden group" style={{
            background: 'linear-gradient(135deg, #1A1730 0%, #1E1B3A 50%, #1A1730 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px'
          }}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(159, 112, 255, 0.08) 0%, transparent 70%)',
            }}></div>
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-5 transition-all duration-300 group-hover:scale-[1.02]" style={{color: '#FFFFFF', fontFamily: '"Inter", sans-serif', fontWeight: 700, lineHeight: '1.2'}}>
                Spremni da počnete?
              </h2>
              <p className="text-base md:text-lg mb-6 md:mb-8 max-w-full md:max-w-[580px] mx-auto transition-all duration-300" style={{color: 'rgba(255, 255, 255, 0.75)', fontFamily: '"Inter", sans-serif', fontWeight: 400, lineHeight: '1.6'}}>
                Pridružite se i preuzmite kontrolu nad svojim finansijama danas
              </p>
              <button
                onClick={() => router.push('/register')}
                className="group/btn relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-3 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #9F70FF, #4C8BEA)',
                  color: '#FFFFFF',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  boxShadow: '0 0 30px -8px rgba(159, 112, 255, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 40px -5px rgba(159, 112, 255, 0.7), 0 12px 24px -6px rgba(159, 112, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 30px -8px rgba(159, 112, 255, 0.5)';
                }}
              >
                <span className="relative z-10">Kreiraj besplatan nalog</span>
                <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}></div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}











