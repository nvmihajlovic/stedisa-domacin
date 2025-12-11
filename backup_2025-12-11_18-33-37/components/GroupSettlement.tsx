'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Check, Clock, Money } from '@phosphor-icons/react'
import { showToast } from '@/lib/toast'

interface Settlement {
  from: string
  to: string
  amount: number
  fromName?: string
  toName?: string
}

interface PendingSettlement {
  id: string
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
  status: string
  createdAt: string
  note?: string | null
}

interface PreviousSettlement {
  id: string
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
  status: string
  settledAt: string
  confirmedAt?: string
  rejectedAt?: string
  note?: string | null
}

interface MemberBalance {
  userId: string
  name: string
  balance: number
  paid: number
  spent: number
}

interface SettlementData {
  balances: MemberBalance[]
  settlements: Settlement[]
  userSettlements: {
    youOwe: Settlement[]
    owesYou: Settlement[]
  }
  netBalance: number
  pendingSettlements: PendingSettlement[]
  previousSettlements: PreviousSettlement[]
}

interface GroupSettlementProps {
  groupId: string
  userId?: string  // Optional - ne koristi se u komponenti
}

export default function GroupSettlement({ groupId }: GroupSettlementProps) {
  const [data, setData] = useState<SettlementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    console.log('🔧 GroupSettlement mounted with groupId:', groupId)
    fetchSettlements(true) // Initial load sa loaderom

    // Listener za real-time updates iz drugih delova aplikacije
    const handleSettlementUpdate = (event: CustomEvent) => {
      if (event.detail?.groupId === groupId) {
        console.log('🔄 Settlement updated, refreshing data...')
        fetchSettlements(false) // Silent refresh
      }
    }

    // Polling mehanizam - osvežava podatke svakih 10 sekundi
    // Ovo omogućava da Snežana vidi promene koje je Nenad napravio
    const pollInterval = setInterval(() => {
      // Samo ako je tab aktivan (optimizacija)
      if (!document.hidden) {
        console.log('🔄 Polling settlements...')
        fetchSettlements(false) // Silent refresh, bez loadera
      }
    }, 10000) // 10 sekundi - smanjeno blinkanje

    // Osvežavanje kada korisnik vrati se na tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible, refreshing settlements...')
        fetchSettlements(false) // Silent refresh
      }
    }

    window.addEventListener('settlementUpdated', handleSettlementUpdate as EventListener)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('settlementUpdated', handleSettlementUpdate as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [groupId])

  const fetchSettlements = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true)
      }
      const response = await fetch(`/api/groups/${groupId}/settlements`)
      const text = await response.text()
      console.log('🔍 Settlements API response:', text)
      const result = text ? JSON.parse(text) : { success: false }
      console.log('📊 Parsed result:', result)
      
      if (result.success) {
        console.log('✅ Setting data:', result.data)
        console.log('   - youOwe:', result.data.userSettlements?.youOwe)
        console.log('   - owesYou:', result.data.userSettlements?.owesYou)
        
        // Transform API data to match component expectations
        const transformedData = {
          ...result.data,
          userSettlements: {
            youOwe: result.data.userSettlements.youOwe.map((item: any) => ({
              to: item.userId,
              toName: item.name,
              amount: item.amount,
              splits: item.splits
            })),
            owesYou: result.data.userSettlements.owesYou.map((item: any) => ({
              from: item.userId,
              fromName: item.name,
              amount: item.amount,
              splits: item.splits
            }))
          }
        }
        
        console.log('🔄 Transformed data:', transformedData)
        console.log('🔄 owesYou after transform:', transformedData.userSettlements.owesYou)
        setData(transformedData)
      } else {
        console.log('❌ API returned success: false')
        // Samo prikazuj error toast ako je initial load
        if (showLoader) {
          showToast('Greška pri učitavanju', 'error')
        }
      }
    } catch (error) {
      console.error('Error fetching settlements:', error)
      // Samo prikazuj error toast ako je initial load
      if (showLoader) {
        showToast('Greška pri učitavanju', 'error')
      }
    } finally {
      if (showLoader) {
        setLoading(false)
      }
      setIsInitialLoad(false)
    }
  }

  const handleSettleUp = async (fromUserId: string, amount: number, fromName: string) => {
    if (settling) return

    try {
      setSettling(fromUserId)
      
      const response = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId, // Ko plaća (Snežana)
          toUserId: 'CURRENT_USER', // Placeholder - API će koristiti authenticated user
          amount,
          note: null
        })
      })

      const text = await response.text()
      const result = text ? JSON.parse(text) : { success: false }

      if (result.success) {
        showToast(`Potvrđena uplata od ${fromName}: ${amount.toLocaleString('sr-RS')} RSD`, 'success')
        await fetchSettlements(false) // Silent refresh
        // Emit event za real-time update drugih komponenti
        window.dispatchEvent(new CustomEvent('settlementUpdated', { detail: { groupId } }))
      } else {
        showToast(result.error || 'Greška pri uplati', 'error')
      }
    } catch (error) {
      console.error('Error settling up:', error)
      showToast('Greška pri uplati', 'error')
    } finally {
      setSettling(null)
    }
  }

  const handleConfirmSettlement = async (settlementId: string, action: 'confirm' | 'reject') => {
    if (settling) return

    try {
      setSettling(settlementId)
      
      const response = await fetch(`/api/groups/${groupId}/settlements/${settlementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const text = await response.text()
      const result = text ? JSON.parse(text) : { success: false }

      if (result.success) {
        showToast(
          action === 'confirm' 
            ? 'Poravnanje je potvrđeno' 
            : 'Poravnanje je odbijeno', 
          'success'
        )
        await fetchSettlements(false) // Silent refresh
        // Emit event za real-time update drugih komponenti
        window.dispatchEvent(new CustomEvent('settlementUpdated', { detail: { groupId } }))
      } else {
        showToast(result.error || 'Greška', 'error')
      }
    } catch (error) {
      console.error('Error updating settlement:', error)
      showToast('Greška', 'error')
    } finally {
      setSettling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F70FF]"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Nije moguće učitati podatke</p>
      </div>
    )
  }

  const { userSettlements, netBalance, balances, pendingSettlements, previousSettlements } = data
  const hasDebts = userSettlements.youOwe.length > 0 || userSettlements.owesYou.length > 0
  const hasPending = pendingSettlements && pendingSettlements.length > 0

  return (
    <div className="space-y-6">
      {/* Net Balance Card */}
      <div
        className="rounded-2xl p-6 shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
        style={{
          background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Ukupan balans
            </p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: '"Inter", sans-serif' }}>
              <span
                style={{
                  color:
                    netBalance > 0
                      ? '#45D38A'
                      : netBalance < 0
                      ? '#FF6B6B'
                      : 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {netBalance > 0 ? '+' : ''}
                {netBalance.toLocaleString('sr-RS')} RSD
              </span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              {netBalance > 0
                ? 'Grupa vam duguje'
                : netBalance < 0
                ? 'Vi dugujete grupi'
                : 'Sve je poravnato'}
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background:
                netBalance > 0
                  ? 'rgba(69, 211, 138, 0.1)'
                  : netBalance < 0
                  ? 'rgba(255, 107, 107, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Money
              size={28}
              weight="duotone"
              style={{
                color:
                  netBalance > 0
                    ? '#45D38A'
                    : netBalance < 0
                    ? '#FF6B6B'
                    : 'rgba(255, 255, 255, 0.5)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Settlements */}
      {hasDebts ? (
        <div className="space-y-4">
          {/* You Owe */}
          {userSettlements.youOwe.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif' }}
              >
                Vi dugujete
              </h3>
              <div className="space-y-2">
                {userSettlements.youOwe
                  .filter(settlement => {
                    // Ne prikazuj dug ako već postoji pending settlement za njega
                    const hasPendingSettlement = pendingSettlements.some(ps => 
                      ps.to === settlement.to && Math.abs(ps.amount - settlement.amount) < 0.01
                    )
                    return !hasPendingSettlement
                  })
                  .map((settlement, idx) => {
                  // Check if there's already a pending settlement for this debt
                  const hasPendingSettlement = pendingSettlements.some(ps => 
                    ps.to === settlement.to && Math.abs(ps.amount - settlement.amount) < 0.01
                  )
                  
                  return (
                  <div
                    key={idx}
                    className="rounded-xl p-4 shadow-[0_0_25px_-10px_rgba(0,0,0,0.3)] transition-all duration-200 hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.4)]"
                    style={{
                      background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #FF6B6B, #EE5A6F)',
                            color: '#fff'
                          }}
                        >
                          {settlement.toName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            {settlement.toName}
                          </p>
                          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                            Dugujete
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className="font-bold"
                            style={{ color: '#FF6B6B', fontFamily: '"Inter", sans-serif' }}
                          >
                            {settlement.amount.toLocaleString('sr-RS')} RSD
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (settling || hasPendingSettlement) return
                            try {
                              setSettling(settlement.to)
                              const response = await fetch(`/api/groups/${groupId}/settlements`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  toUserId: settlement.to, // Current user (Snežana) plaća toUserId (Nenadu)
                                  amount: settlement.amount,
                                  note: null
                                })
                              })
                              const text = await response.text()
                              const result = text ? JSON.parse(text) : { success: false }
                              if (result.success) {
                                showToast(`Uplaćeno ${settlement.amount.toLocaleString('sr-RS')} RSD za ${settlement.toName}`, 'success')
                                await fetchSettlements(false) // Silent refresh
                                // Emit event za real-time update drugih komponenti
                                window.dispatchEvent(new CustomEvent('settlementUpdated', { detail: { groupId } }))
                              } else {
                                showToast(result.error || 'Greška pri uplati', 'error')
                              }
                            } catch (error) {
                              console.error('Error:', error)
                              showToast('Greška pri uplati', 'error')
                            } finally {
                              setSettling(null)
                            }
                          }}
                          disabled={settling === settlement.to || hasPendingSettlement}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            background:
                              settling === settlement.to || hasPendingSettlement
                                ? 'rgba(69, 211, 138, 0.3)'
                                : 'linear-gradient(135deg, #45D38A, #3BC578)',
                            color: '#fff',
                            opacity: settling === settlement.to || hasPendingSettlement ? 0.7 : 1,
                            cursor: settling === settlement.to || hasPendingSettlement ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {hasPendingSettlement ? 'Na čekanju' : settling === settlement.to ? 'Procesiranje...' : 'Uplati'}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Owes You */}
          {userSettlements.owesYou.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif' }}
              >
                Vama duguju
              </h3>
              <div className="space-y-2">
                {userSettlements.owesYou
                  .filter(settlement => {
                    // Ne prikazuj dug ako već postoji pending settlement za njega
                    const hasPendingSettlement = pendingSettlements.some(ps => 
                      ps.from === settlement.from && Math.abs(ps.amount - settlement.amount) < 0.01
                    )
                    return !hasPendingSettlement
                  })
                  .map((settlement, idx) => {
                    // Check if there's already a pending settlement for this debt
                    const hasPendingSettlement = pendingSettlements.some(ps => 
                      ps.from === settlement.from && Math.abs(ps.amount - settlement.amount) < 0.01
                    )
                    
                    return (
                  <div
                    key={idx}
                    className="rounded-xl p-4 shadow-[0_0_25px_-10px_rgba(0,0,0,0.3)]"
                    style={{
                      background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #45D38A, #3BC578)',
                            color: '#fff'
                          }}
                        >
                          {settlement.fromName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            {settlement.fromName}
                          </p>
                          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                            Vam duguje
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className="font-bold"
                            style={{ color: '#45D38A', fontFamily: '"Inter", sans-serif' }}
                          >
                            +{settlement.amount.toLocaleString('sr-RS')} RSD
                          </p>
                        </div>
                        <button
                          onClick={() => handleSettleUp(settlement.from, settlement.amount, settlement.fromName || '')}
                          disabled={settling === settlement.from || hasPendingSettlement}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background:
                              settling === settlement.from || hasPendingSettlement
                                ? 'rgba(69, 211, 138, 0.3)'
                                : 'linear-gradient(135deg, #45D38A, #3BC578)',
                            color: '#fff',
                            opacity: settling === settlement.from || hasPendingSettlement ? 0.7 : 1,
                            cursor: settling === settlement.from || hasPendingSettlement ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {hasPendingSettlement ? 'Na čekanju' : settling === settlement.from ? 'Procesiranje...' : 'Potvrdi uplatu'}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}
        </div>
      ) : !hasPending ? (
        <div
          className="rounded-2xl p-8 text-center shadow-[0_0_35px_-10px_rgba(0,0,0,0.45)]"
          style={{
            background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(69, 211, 138, 0.1)' }}
          >
            <Check size={32} weight="bold" style={{ color: '#45D38A' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: '"Inter", sans-serif' }}
          >
            Sve je poravnato!
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Trenutno nema aktivnih dugovanja u ovoj grupi.
          </p>
        </div>
      ) : null}

      {/* Pending Settlements */}
      {hasPending && (
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif' }}
          >
            Zahtevi na čekanju
          </h3>
          <div className="space-y-2">
            {pendingSettlements.map((settlement) => {
              // Determine if current user is creditor (receiving money) or debtor (paying)
              // If settlement is in owesYou, current user is creditor (toUserId)
              // If settlement is in youOwe, current user is debtor (fromUserId)
              const isCreditor = userSettlements.owesYou.some(s => 
                s.from === settlement.from && Math.abs(s.amount - settlement.amount) < 0.01
              )
              const isDebtor = userSettlements.youOwe.some(s => 
                s.to === settlement.to && Math.abs(s.amount - settlement.amount) < 0.01
              )
              
              return (
                <div
                  key={settlement.id}
                  className="rounded-xl p-4 shadow-[0_0_25px_-10px_rgba(0,0,0,0.3)]"
                  style={{
                    background: 'linear-gradient(180deg, #121421 0%, #151726 100%)',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{
                          background: 'rgba(255, 193, 7, 0.2)',
                          color: '#FFC107'
                        }}
                      >
                        <Clock size={20} weight="bold" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {settlement.fromName} → {settlement.toName}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          Na čekanju • {new Date(settlement.createdAt).toLocaleDateString('sr-RS')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className="font-bold"
                          style={{ color: '#FFC107', fontFamily: '"Inter", sans-serif' }}
                        >
                          {settlement.amount.toLocaleString('sr-RS')} RSD
                        </p>
                      </div>
                      {/* Show confirm/reject buttons for creditor */}
                      {isCreditor && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmSettlement(settlement.id, 'confirm')}
                            disabled={settling === settlement.id}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                              background:
                                settling === settlement.id
                                  ? 'rgba(69, 211, 138, 0.3)'
                                  : 'linear-gradient(135deg, #45D38A, #3BC578)',
                              color: '#fff',
                              opacity: settling === settlement.id ? 0.7 : 1,
                              cursor: settling === settlement.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Potvrdi
                          </button>
                          <button
                            onClick={() => handleConfirmSettlement(settlement.id, 'reject')}
                            disabled={settling === settlement.id}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                              background:
                                settling === settlement.id
                                  ? 'rgba(255, 107, 107, 0.3)'
                                  : 'linear-gradient(135deg, #FF6B6B, #EE5A6F)',
                              color: '#fff',
                              opacity: settling === settlement.id ? 0.7 : 1,
                              cursor: settling === settlement.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Odbij
                          </button>
                        </div>
                      )}
                      {/* Show status for debtor */}
                      {isDebtor && !isCreditor && (
                        <div
                          className="px-4 py-2 rounded-lg text-sm font-medium"
                          style={{
                            background: 'rgba(255, 193, 7, 0.2)',
                            color: '#FFC107'
                          }}
                        >
                          Poslato na poravnanje
                        </div>
                      )}
                    </div>
                  </div>
                  {settlement.note && (
                    <p
                      className="text-xs mt-2 italic"
                      style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      {settlement.note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Settlement History */}
      {previousSettlements.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm font-medium mb-3 flex items-center gap-2 transition-colors"
            style={{ color: '#9F70FF' }}
          >
            <Clock size={16} />
            {showHistory ? 'Sakrij istoriju' : 'Prikaži istoriju uplate'}
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              ({previousSettlements.length})
            </span>
          </button>

          {showHistory && (
            <div className="space-y-2">
              {previousSettlements.map((settlement) => (
                <div
                  key={settlement.id}
                  className="rounded-xl p-4"
                  style={{
                    background: settlement.status === 'REJECTED' ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: settlement.status === 'REJECTED' ? '1px solid rgba(255, 107, 107, 0.2)' : '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          {settlement.fromName}
                        </span>
                        <ArrowRight size={16} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          {settlement.toName}
                        </span>
                        {settlement.status === 'REJECTED' && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              background: 'rgba(255, 107, 107, 0.2)',
                              color: '#FF6B6B'
                            }}
                          >
                            Odbijeno
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: settlement.status === 'REJECTED' ? '#FF6B6B' : 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {settlement.amount.toLocaleString('sr-RS')} RSD
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                        {settlement.status === 'REJECTED' && settlement.rejectedAt
                          ? `Odbijeno: ${new Date(settlement.rejectedAt).toLocaleDateString('sr-RS')}`
                          : new Date(settlement.settledAt).toLocaleDateString('sr-RS')
                        }
                      </p>
                    </div>
                  </div>
                  {settlement.note && (
                    <p
                      className="text-xs mt-2 italic"
                      style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      {settlement.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Member Balances Summary */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: '"Inter", sans-serif' }}
        >
          Balans članova
        </h3>
        <div className="space-y-2">
          {balances.map((member) => (
            <div
              key={member.userId}
              className="rounded-xl p-3 flex items-center justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255,255,255,0.04)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background:
                      member.balance > 0
                        ? 'rgba(69, 211, 138, 0.15)'
                        : member.balance < 0
                        ? 'rgba(255, 107, 107, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color:
                      member.balance > 0
                        ? '#45D38A'
                        : member.balance < 0
                        ? '#FF6B6B'
                        : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {member.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-bold"
                  style={{
                    color:
                      member.balance > 0
                        ? '#45D38A'
                        : member.balance < 0
                        ? '#FF6B6B'
                        : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {member.balance > 0 ? '+' : ''}
                  {member.balance.toLocaleString('sr-RS')}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                  {member.balance > 0 ? 'Treba da primi' : member.balance < 0 ? 'Duguje' : 'OK'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
