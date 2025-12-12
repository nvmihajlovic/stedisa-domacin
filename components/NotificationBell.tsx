"use client"

import { useState, useEffect } from "react"
import { Bell, Users, CreditCard, Coins, Warning, EnvelopeSimple, CheckCircle, Gift, TrendDown, TrendUp, Handshake, X, Trash } from "phosphor-react"
import { useToast } from "@/hooks/useToast"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  groupId?: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const { addToast } = useToast()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications")
      
      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : []
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      })

      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log("Deleting notification:", notificationId)
    
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE"
      })

      console.log("Delete response status:", res.status)
      
      if (res.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        addToast("Notifikacija obrisana", "success")
      } else {
        const error = await res.json()
        console.error("Delete failed:", error)
        addToast("Greška pri brisanju notifikacije", "error")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      addToast("Greška pri brisanju notifikacije", "error")
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        addToast("Sve notifikacije su označene kao pročitane", "success")
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      addToast("Greška pri označavanju notifikacija", "error")
    }
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/delete-all", {
        method: "DELETE"
      })

      if (res.ok) {
        setNotifications([])
        setUnreadCount(0)
        setShowDeleteAllConfirm(false)
        addToast("Sve notifikacije su obrisane", "success")
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error)
      addToast("Greška pri brisanju notifikacija", "error")
    }
  }

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 10 seconds (faster refresh for better UX)
    const interval = setInterval(fetchNotifications, 10000)
    
    // Listen for settlement updates to refresh notifications immediately
    const handleSettlementUpdate = () => {
      console.log('🔔 Settlement updated, refreshing notifications...')
      fetchNotifications()
    }
    
    window.addEventListener('settlementUpdated', handleSettlementUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('settlementUpdated', handleSettlementUpdate)
    }
  }, [])

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return "Upravo sad"
    if (seconds < 3600) return `Pre ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Pre ${Math.floor(seconds / 3600)} h`
    return `Pre ${Math.floor(seconds / 86400)} dana`
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 24, weight: "duotone" as const }
    
    switch (type) {
      case "GROUP_JOIN": 
        return <Users {...iconProps} style={{ color: '#4C8BEA' }} />
      case "GROUP_REMOVE":
        return <Users {...iconProps} style={{ color: '#FF6B9D' }} />
      case "EXPENSE_ADDED": 
        return <TrendDown {...iconProps} style={{ color: '#C339B5' }} />
      case "EXPENSE_UPDATED":
        return <CreditCard {...iconProps} style={{ color: '#FFB84D' }} />
      case "EXPENSE_DELETED":
        return <Trash {...iconProps} style={{ color: '#FF6B6B' }} />
      case "SETTLEMENT_REQUEST": 
        return <Coins {...iconProps} style={{ color: '#FFB84D' }} />
      case "settlement_confirmed":
        return <CheckCircle {...iconProps} style={{ color: '#10B981' }} />
      case "settlement_rejected":
        return <X {...iconProps} style={{ color: '#FF6B9D' }} />
      case "BUDGET_ALERT": 
        return <Warning {...iconProps} style={{ color: '#FF6B9D' }} />
      case "GROUP_INVITE": 
        return <EnvelopeSimple {...iconProps} style={{ color: '#9F70FF' }} />
      case "PAYMENT_RECEIVED": 
        return <CheckCircle {...iconProps} style={{ color: '#10B981' }} />
      case "INCOME_ADDED":
        return <TrendUp {...iconProps} style={{ color: '#1FBFA4' }} />
      case "SETTLEMENT_PAID":
        return <Handshake {...iconProps} style={{ color: '#10B981' }} />
      default: 
        return <Bell {...iconProps} style={{ color: '#9F70FF' }} />
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl hover:scale-105 transition-all duration-300 group"
        style={{
          background: unreadCount > 0 
            ? 'linear-gradient(135deg, rgba(159, 112, 255, 0.15), rgba(76, 139, 234, 0.15))'
            : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        title="Notifikacije"
      >
        <Bell 
          size={22} 
          weight={unreadCount > 0 ? "fill" : "bold"}
          className="transition-all duration-300"
          style={{
            color: unreadCount > 0 ? '#9F70FF' : '#E8D9FF'
          }}
        />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1.5 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #FF6B9D, #C9184A)",
              boxShadow: "0 0 20px rgba(255, 107, 157, 0.6)",
              border: "2px solid #1E1B2A"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div 
            className="absolute right-0 mt-3 w-[420px] rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
            style={{
              background: "linear-gradient(145deg, rgba(30, 27, 42, 0.98), rgba(23, 20, 33, 0.98))",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              maxHeight: "620px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1) inset"
            }}
          >
            {/* Header */}
            <div 
              className="px-6 py-4 flex items-center justify-between backdrop-blur-xl"
              style={{
                background: "linear-gradient(135deg, rgba(159, 112, 255, 0.08), rgba(76, 139, 234, 0.08))",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(159, 112, 255, 0.2), rgba(76, 139, 234, 0.2))",
                    border: "1px solid rgba(159, 112, 255, 0.3)"
                  }}
                >
                  <Bell size={20} weight="bold" style={{ color: '#9F70FF' }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
                    Notifikacije
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-xs" style={{ color: '#9F70FF' }}>
                      {unreadCount} nepročitan{unreadCount === 1 ? 'a' : 'e'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, rgba(159, 112, 255, 0.15), rgba(76, 139, 234, 0.15))",
                      color: '#9F70FF',
                      border: "1px solid rgba(159, 112, 255, 0.3)"
                    }}
                  >
                    Označi sve
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{
                      background: "rgba(255, 107, 157, 0.15)",
                      border: "1px solid rgba(255, 107, 157, 0.3)"
                    }}
                    title="Obriši sve notifikacije"
                  >
                    <Trash size={16} weight="bold" style={{ color: '#FF6B9D' }} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <X size={18} weight="bold" style={{ color: '#E8D9FF' }} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[520px] custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/50 text-sm">Učitavanje notifikacija...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "linear-gradient(135deg, rgba(159, 112, 255, 0.1), rgba(76, 139, 234, 0.1))",
                      border: "1px solid rgba(159, 112, 255, 0.2)"
                    }}
                  >
                    <Bell size={36} weight="duotone" style={{ color: 'rgba(159, 112, 255, 0.5)' }} />
                  </div>
                  <p className="text-white/70 font-semibold mb-2">Sve je čisto!</p>
                  <p className="text-white/40 text-sm">Nemate novih notifikacija</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                      className="mb-2 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                      style={{
                        background: notification.isRead 
                          ? "rgba(255, 255, 255, 0.02)" 
                          : "linear-gradient(135deg, rgba(159, 112, 255, 0.08), rgba(76, 139, 234, 0.08))",
                        border: `1px solid ${notification.isRead ? 'rgba(255, 255, 255, 0.05)' : 'rgba(159, 112, 255, 0.2)'}`,
                        boxShadow: notification.isRead ? 'none' : '0 4px 12px rgba(159, 112, 255, 0.15)'
                      }}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-20"
                        style={{
                          background: "rgba(255, 107, 157, 0.15)",
                          border: "1px solid rgba(255, 107, 157, 0.3)"
                        }}
                        title="Obriši notifikaciju"
                      >
                        <Trash size={16} weight="bold" style={{ color: '#FF6B9D' }} />
                      </button>

                      <div className="flex items-start gap-3 relative z-10">
                        {/* Icon with gradient background */}
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: notification.type === 'BUDGET_ALERT' 
                              ? 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(201, 24, 74, 0.2))'
                              : notification.type === 'GROUP_JOIN'
                              ? 'linear-gradient(135deg, rgba(76, 139, 234, 0.2), rgba(74, 109, 211, 0.2))'
                              : notification.type === 'EXPENSE_ADDED'
                              ? 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.2))'
                              : notification.type === 'SETTLEMENT_REQUEST'
                              ? 'linear-gradient(135deg, rgba(255, 184, 77, 0.2), rgba(255, 184, 77, 0.2))'
                              : notification.type === 'PAYMENT_RECEIVED' || notification.type === 'INCOME_ADDED' || notification.type === 'SETTLEMENT_PAID'
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.2))'
                              : 'linear-gradient(135deg, rgba(159, 112, 255, 0.2), rgba(159, 112, 255, 0.2))',
                            border: `1px solid ${
                              notification.type === 'BUDGET_ALERT' || notification.type === 'EXPENSE_ADDED' ? 'rgba(255, 107, 157, 0.3)' :
                              notification.type === 'GROUP_JOIN' ? 'rgba(76, 139, 234, 0.3)' :
                              notification.type === 'SETTLEMENT_REQUEST' ? 'rgba(255, 184, 77, 0.3)' :
                              notification.type === 'PAYMENT_RECEIVED' || notification.type === 'INCOME_ADDED' || notification.type === 'SETTLEMENT_PAID' ? 'rgba(16, 185, 129, 0.3)' :
                              'rgba(159, 112, 255, 0.3)'
                            }`
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 
                              className="text-sm font-bold leading-tight"
                              style={{
                                color: notification.isRead ? 'rgba(255, 255, 255, 0.6)' : '#FFFFFF',
                                fontFamily: '"Inter", sans-serif'
                              }}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div 
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 animate-pulse"
                                style={{
                                  background: "linear-gradient(135deg, #FF6B9D, #C9184A)",
                                  boxShadow: "0 0 10px rgba(255, 107, 157, 0.6)"
                                }}
                              />
                            )}
                          </div>
                          
                          <p 
                            className="text-xs leading-relaxed mb-2"
                            style={{
                              color: notification.isRead ? 'rgba(255, 255, 255, 0.4)' : 'rgba(232, 217, 255, 0.7)'
                            }}
                          >
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[10px] px-2 py-1 rounded-lg font-medium"
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                color: 'rgba(255, 255, 255, 0.5)',
                                border: "1px solid rgba(255, 255, 255, 0.08)"
                              }}
                            >
                              {timeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowDeleteAllConfirm(false)}
          />
          
          <div 
            className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(30, 27, 42, 0.98), rgba(23, 20, 33, 0.98))",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(201, 24, 74, 0.2))",
                border: "1px solid rgba(255, 107, 157, 0.3)"
              }}
            >
              <Warning size={32} weight="duotone" style={{ color: '#FF6B9D' }} />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}>
              Obriši sve notifikacije?
            </h3>
            
            <p className="text-center mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Ova akcija će trajno obrisati sve vaše notifikacije i ne može se poništiti.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: '#E8D9FF'
                }}
              >
                Otkaži
              </button>
              
              <button
                onClick={deleteAllNotifications}
                className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FF6B9D, #C9184A)",
                  color: '#FFFFFF',
                  border: "1px solid rgba(255, 107, 157, 0.3)",
                  boxShadow: "0 4px 12px rgba(255, 107, 157, 0.3)"
                }}
              >
                Obriši sve
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(159, 112, 255, 0.3), rgba(76, 139, 234, 0.3));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(159, 112, 255, 0.5), rgba(76, 139, 234, 0.5));
        }
      `}</style>
    </div>
  )
}
