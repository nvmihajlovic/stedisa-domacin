"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  TrendUp,
  TrendDown,
  Wallet,
  Users,
  ArrowLeft,
  SignOut
} from "phosphor-react"
import CountUp from "react-countup"
import { getIcon } from "@/lib/iconMapping"
import GroupSettlement from "@/components/GroupSettlement"

type User = {
  id: string
  name: string
  email: string
}

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface GroupMember {
  id: string
  userId: string
  name: string
  email: string
  role: "owner" | "member"
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Transaction {
  id: string
  amount: number
  description: string
  category: Category
  date: string
  user: User
  createdAt: string
}

interface GroupData {
  id: string
  name: string
  description: string | null
  owner: User
  members: GroupMember[]
  expenses: Transaction[]
  incomes: Transaction[]
  totals: {
    expenses: number
    income: number
    balance: number
  }
  counts: {
    members: number
    expenses: number
    incomes: number
  }
  userRole: {
    isOwner: boolean
    isMember: boolean
  }
  createdAt: string
}

export default function GroupClient({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const playCoinSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silence audio errors
    }
  }

  const fetchGroupData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/groups/${groupId}`)
      
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response")
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load group")
      }

      setGroup(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm(group?.userRole.isOwner ? "Da li ste sigurni da želite da raspustite grupu?" : "Da li ste sigurni da želite da napustite grupu?")) return

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to leave/dissolve group")
      }

      alert(data.message)
      router.push("/groups")
    } catch (err: any) {
      alert(err.message || "An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-10 lg:px-14 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center" style={{paddingTop: "24px"}}>Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen px-10 lg:px-14 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center" style={{paddingTop: "24px"}}>
            <p className="text-xl mb-4">{error || "Group not found"}</p>
            <button
              onClick={() => router.push("/groups")}
              className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300"
              style={{background: "#242236", border: "1px solid #2E2B44"}}
            >
              Nazad na grupe
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-10 lg:px-14 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8" style={{paddingTop: "24px"}}>
          <div>
            <button
              onClick={() => router.push("/groups")}
              className="flex items-center gap-2 mb-4 text-sm hover:opacity-70 transition-opacity"
              style={{color: "rgba(255,255,255,0.55)"}}
            >
              <ArrowLeft size={20} weight="bold" />
              Nazad na grupe
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[38px] font-bold" style={{color: "#FFFFFF", fontFamily: "\"Inter\", \"SF Pro\", \"Poppins\", sans-serif", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1}}>
                {group.name}
              </h1>
              {group.userRole.isOwner && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{background: "rgba(255, 193, 7, 0.15)", color: "#FFC107", border: "1px solid rgba(255, 193, 7, 0.2)"}}>
                  Vlasnik
                </span>
              )}
            </div>
            <p style={{color: "rgba(255,255,255,0.55)", fontFamily: "\"Inter\", sans-serif"}}>
              {group.description || "Kontrolna tabla za grupu"}
            </p>
            <p className="text-sm mt-1" style={{color: "rgba(255,255,255,0.45)", fontFamily: "\"Inter\", sans-serif"}}>
              {group.counts.members} članova • Kreirana {new Date(group.createdAt).toLocaleDateString("sr-RS")}
            </p>
          </div>
          <button
            onClick={handleLeaveGroup}
            className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all duration-300 flex items-center gap-2"
            style={{background: "#242236", border: "1px solid #2E2B44"}}
          >
            <SignOut size={20} weight="bold" />
            {group.userRole.isOwner ? "Raspusti grupu" : "Napusti grupu"}
          </button>
        </div>

        {group.counts.members === 1 ? (
          <div className="rounded-3xl p-12 text-center mb-6 md:mb-8 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: "linear-gradient(145deg, #1E1B2A, #171421)", border: "1px solid rgba(255,255,255,0.06)"}}>
            <Users size={64} weight="duotone" style={{color: "#E8D9FF", margin: '0 auto 16px'}} />
            <h3 className="text-xl font-semibold mb-2" style={{color: "#FFFFFF"}}>
              Dodajte članove da biste počeli deliti troškove
            </h3>
            <p style={{color: "rgba(255,255,255,0.55)"}}>
              Grupa trenutno nema zajedničkih transakcija. Pozovite članove da se pridruže.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
            <div className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(228,88,110,0.3)]" style={{background: "linear-gradient(145deg, #1E1B2A, #171421)", border: "1px solid rgba(255,255,255,0.06)", height: "120px"}}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-semibold" style={{color: "rgba(255,255,255,0.55)", fontFamily: "\"Inter\", sans-serif"}}>Ukupni troškovi</div>
                <TrendDown size={20} weight="duotone" style={{color: "#FFB3E6"}} />
              </div>
              <div className="text-2xl font-bold" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>
                <CountUp end={group.totals.expenses} duration={0.8} decimals={0} separator="." preserveValue onStart={playCoinSound} />
                <span style={{fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px"}}>RSD</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: "rgba(255, 179, 230, 0.15)", color: "#FFB3E6", border: "1px solid rgba(255, 179, 230, 0.2)"}}>
                {group.counts.expenses} transakcija
              </div>
            </div>
            
            <div className="rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-300 relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_40px_-8px_rgba(27,217,106,0.3)]" style={{background: "linear-gradient(145deg, #1E1B2A, #171421)", border: "1px solid rgba(255,255,255,0.06)", height: "120px"}}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-semibold" style={{color: "rgba(255,255,255,0.55)", fontFamily: "\"Inter\", sans-serif"}}>Ukupni prihodi</div>
                <TrendUp size={20} weight="duotone" style={{color: "#6FFFC4"}} />
              </div>
              <div className="text-2xl font-bold" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>
                <CountUp end={group.totals.income} duration={0.8} decimals={0} separator="." preserveValue onStart={playCoinSound} />
                <span style={{fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px"}}>RSD</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: "rgba(111, 255, 196, 0.15)", color: "#6FFFC4", border: "1px solid rgba(111, 255, 196, 0.2)"}}>
                {group.counts.incomes} transakcija
              </div>
            </div>
            
            <div className="rounded-3xl relative p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]" style={{background: "linear-gradient(145deg, #1E1B2A, #171421)", border: "1px solid rgba(255,255,255,0.06)", height: "120px"}}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-semibold" style={{color: "rgba(255,255,255,0.55)", fontFamily: "\"Inter\", sans-serif"}}>Bilans</div>
                <Wallet size={20} weight="duotone" style={{color: group.totals.balance >= 0 ? "#7FDFFF" : "#FFB3E6"}} />
              </div>
              <div className="text-2xl font-bold" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>
                <CountUp end={group.totals.balance} duration={0.8} decimals={0} separator="." preserveValue onStart={playCoinSound} />
                <span style={{fontSize: "0.65em", opacity: 0.6, fontWeight: 500, marginLeft: "4px"}}>RSD</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: group.totals.balance >= 0 ? "rgba(127, 223, 255, 0.15)" : "rgba(255, 179, 230, 0.15)", color: group.totals.balance >= 0 ? "#7FDFFF" : "#FFB3E6", border: group.totals.balance >= 0 ? "1px solid rgba(127, 223, 255, 0.2)" : "1px solid rgba(255, 179, 230, 0.2)"}}>
                {group.counts.members} članova
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <div className="p-1 rounded-3xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(166,77,255,0.35)]" style={{background: "linear-gradient(135deg, rgba(166,77,255,0.3) 0%, rgba(255,104,194,0.3) 100%)"}}>
            <div className="rounded-3xl backdrop-blur-xl p-6" style={{background: "rgba(20, 18, 38, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)"}}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <Users size={36} weight="duotone" className="mb-4" style={{color: "#E8D9FF"}} />
                  <h3 className="text-xl font-semibold mb-2" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>lanovi grupe</h3>
                  <p className="text-sm" style={{color: "#E8D9FF", opacity: 0.7}}>{group.counts.members} aktivnih članova</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {group.members.map((member) => (
                  <div key={member.id} className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]" style={{border: "1px solid rgba(255, 255, 255, 0.04)"}}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{background: "linear-gradient(135deg, #A64DFF 0%, #FF68C2 100%)", color: "#FFFFFF"}}>
                        {member.user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold truncate" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>{member.user.name}</div>
                          {member.role === "owner" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{background: "rgba(255, 193, 7, 0.15)", color: "#FFC107", border: "1px solid rgba(255, 193, 7, 0.2)"}}>
                              Vlasnik
                            </span>
                          )}
                        </div>
                        <div className="text-xs truncate" style={{color: "#E8D9FF", opacity: 0.6}}>
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {group.counts.members > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[4%] mt-6 md:mt-10 mb-6 md:mb-8">
            <div className="p-1 rounded-3xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(228,88,110,0.35)]" style={{background: "linear-gradient(135deg, rgba(228,88,110,0.3) 0%, rgba(255,179,230,0.3) 100%)"}}>
              <div className="rounded-3xl backdrop-blur-xl p-6 pb-6" style={{background: "rgba(20, 18, 38, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)"}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-1">
                    <TrendDown size={36} weight="duotone" className="mb-4" style={{color: "#FFB3E6"}} />
                    <h3 className="text-xl font-semibold mb-2" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>Rashodi grupe</h3>
                    <p className="text-sm" style={{color: "#FFB3E6", opacity: 0.7}}>Zajednički troškovi</p>
                  </div>
                </div>
                {group.expenses.length === 0 ? (
                  <p className="text-center py-8" style={{color: "#E8D9FF", opacity: 0.6}}>Nema rashoda za ovu grupu</p>
                ) : (
                <div className="flex flex-col gap-3 lg:gap-4 pb-5 mt-6">
                  <div className="text-[10px] font-bold tracking-wide" style={{color: "#FFB3E6", opacity: 0.7, fontFamily: "\"Inter\", sans-serif"}}>RASHODI</div>
                  {group.expenses.slice(0, 5).map((expense) => {
                    const IconComponent = getIcon(expense.category?.icon);
                    return (
                      <div key={expense.id} className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]" style={{border: "1px solid rgba(255, 255, 255, 0.04)"}}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: "rgba(255, 179, 230, 0.15)", border: "1px solid rgba(255, 179, 230, 0.2)", boxShadow: "0 0 15px rgba(255, 179, 230, 0.2)"}}>
                            {IconComponent ? <IconComponent size={18} weight="duotone" style={{color: "#FFB3E6"}} /> : <TrendDown size={18} weight="duotone" style={{color: "#FFB3E6"}} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>{expense.description}</div>
                            <div className="text-xs truncate" style={{color: "#FFB3E6", opacity: 0.6}}>{expense.category?.name} • {expense.user.name}</div>
                          </div>
                        </div>
                        <div className="text-base font-bold ml-3 flex-shrink-0" style={{color: "#FFB3E6"}}>-{expense.amount.toLocaleString()} RSD</div>
                      </div>
                    );
                  })}
                  {group.expenses.length > 5 && (
                    <p className="text-center text-xs mt-2" style={{color: "#FFB3E6", opacity: 0.6}}>+{group.expenses.length - 5} više rashoda</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-1 rounded-3xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_0_45px_-5px_rgba(27,217,106,0.35)]" style={{background: "linear-gradient(135deg, rgba(27,217,106,0.3) 0%, rgba(111,255,196,0.3) 100%)"}}>
            <div className="rounded-3xl backdrop-blur-xl p-6 pb-6" style={{background: "rgba(20, 18, 38, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)"}}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <TrendUp size={36} weight="duotone" className="mb-4" style={{color: "#6FFFC4"}} />
                  <h3 className="text-xl font-semibold mb-2" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>Prihodi grupe</h3>
                  <p className="text-sm" style={{color: "#6FFFC4", opacity: 0.7}}>Svi prihodi članova</p>
                </div>
              </div>
              {group.incomes.length === 0 ? (
                <p className="text-center py-8" style={{color: "#E8D9FF", opacity: 0.6}}>Nema prihoda za ovu grupu</p>
              ) : (
                <div className="flex flex-col gap-3 lg:gap-4 pb-5 mt-6">
                  <div className="text-[10px] font-bold tracking-wide" style={{color: "#6FFFC4", opacity: 0.7, fontFamily: "\"Inter\", sans-serif"}}>PRIHODI</div>
                  {group.incomes.slice(0, 5).map((income) => {
                    const IconComponent = getIcon(income.category?.icon);
                    return (
                      <div key={income.id} className="rounded-xl p-4 flex items-center justify-between bg-white/5 transition-all duration-[120ms] ease-out hover:brightness-[1.02] hover:scale-[1.01]" style={{border: "1px solid rgba(255, 255, 255, 0.04)"}}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background: "rgba(111, 255, 196, 0.15)", border: "1px solid rgba(111, 255, 196, 0.2)", boxShadow: "0 0 15px rgba(111, 255, 196, 0.2)"}}>
                            {IconComponent ? <IconComponent size={18} weight="duotone" style={{color: "#6FFFC4"}} /> : <TrendUp size={18} weight="duotone" style={{color: "#6FFFC4"}} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{color: "#FFFFFF", fontFamily: "\"Inter\", sans-serif"}}>{income.description}</div>
                            <div className="text-xs truncate" style={{color: "#6FFFC4", opacity: 0.6}}>{income.category?.name} • {income.user.name}</div>
                          </div>
                        </div>
                        <div className="text-base font-bold ml-3 flex-shrink-0" style={{color: "#6FFFC4"}}>+{income.amount.toLocaleString()} RSD</div>
                      </div>
                    );
                  })}
                  {group.incomes.length > 5 && (
                    <p className="text-center text-xs mt-2" style={{color: "#6FFFC4", opacity: 0.6}}>+{group.incomes.length - 5} više prihoda</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Settlements Section */}
        {group.counts.members > 1 && (
          <div className="mt-6 md:mt-10">
            <GroupSettlement groupId={groupId} />
          </div>
        )}
      </div>
    </div>
  )
}

