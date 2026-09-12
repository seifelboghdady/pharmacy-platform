import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { AlertTriangle, XCircle, CheckCircle2, Info, Bell } from 'lucide-react'
import { useNotifications } from '@/context/NotificationsContext'

const typeConfig = {
  warning: {
    color: '#D97706',
    bg: '#FEF3C7',
    icon: <AlertTriangle size={18} />,
  },
  danger: {
    color: '#EF4444',
    bg: '#FFF1F2',
    icon: <XCircle size={18} />,
  },
  success: {
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: <CheckCircle2 size={18} />,
  },
  info: {
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: <Info size={18} />,
  },
}

export default function Notifications() {
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications()
  const [tab, setTab] = useState('All')

  const filtered = notifications.filter((n) => {
    if (tab === 'Unread') return !n.read
    if (tab === 'Alerts') return n.type === 'warning' || n.type === 'danger'
    if (tab === 'Orders') return n.title?.toLowerCase().includes('order')
    if (tab === 'System') return n.type === 'info'
    return true
  })

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap">
          {['All', 'Unread', 'Alerts', 'Orders', 'System'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: 20,
                padding: '0.3rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: tab === t ? '#1565C0' : '#fff',
                color: tab === t ? '#fff' : '#4A5568',
              }}
            >
              {t}
              {t === 'Unread' && unreadCount > 0 && (
                <span style={{ marginLeft: 6, background: '#EF4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: '0.6rem', fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline-primary" size="sm" style={{ borderRadius: 20, fontSize: '0.8rem' }} onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline-danger" size="sm" style={{ borderRadius: 20, fontSize: '0.8rem' }} onClick={clearAllNotifications}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div className="d-flex justify-content-center mb-2" style={{ color: '#94A3B8' }}>
              <Bell size={48} />
            </div>
            <div style={{ fontWeight: 600, color: '#1A202C', marginTop: '0.5rem' }}>No notifications</div>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginTop: 4 }}>You're all caught up!</div>
          </div>
        ) : (
          filtered.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.info
            return (
              <div
                key={n.id}
                onClick={() => markAsRead && markAsRead(n.id)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: 14,
                  border: n.read ? '1px solid #E2E8F0' : `1px solid ${cfg.color}40`,
                  borderLeft: n.read ? '1px solid #E2E8F0' : `3px solid ${cfg.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 12, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A202C' }}>{n.title}</span>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1565C0', display: 'inline-block', flexShrink: 0 }} />}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#718096', flexShrink: 0, whiteSpace: 'nowrap' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#4A5568', lineHeight: 1.6, margin: '4px 0 0' }}>{n.message}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}