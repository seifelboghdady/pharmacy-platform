import { Link, useLocation } from 'react-router'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/context/NotificationsContext'

const pageInfo = {
  '/dashboard':              { title: 'Dashboard',      subtitle: 'Welcome back' },
  '/dashboard/inventory':    { title: 'Inventory',      subtitle: 'Manage your medicine stock' },
  '/dashboard/inventory/add':{ title: 'Add Medicine',   subtitle: 'Add new medicine to inventory' },
  '/dashboard/orders':       { title: 'Orders',         subtitle: 'Manage purchase orders' },
  '/dashboard/dispense':     { title: 'Dispense',       subtitle: 'Process prescription dispensing' },
  '/dashboard/notifications':{ title: 'Notifications',  subtitle: 'Stay up to date' },
  '/dashboard/ai-insights':  { title: 'AI Insights',    subtitle: 'Smart analytics powered by AI' },
  '/dashboard/settings':     { title: 'Settings',       subtitle: 'Manage your preferences' },
  '/dashboard/profile':      { title: 'Profile',        subtitle: 'Your account details' },
}

export default function TopBar({ profileData = {} }) {
  const location = useLocation()
  const { unreadCount } = useNotifications()

  const info = pageInfo[location.pathname] || { title: 'PharmaCare', subtitle: '' }

  const displaySubtitle = location.pathname === '/dashboard' && profileData.name
    ? `Welcome back, ${profileData.name.split(' ')[0]}`
    : info.subtitle

  return (
    <div className="pharma-topbar">
      <div>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A202C', margin: 0 }}>{info.title}</h1>
        {displaySubtitle && (
          <p style={{ fontSize: '0.75rem', color: '#718096', margin: 0 }}>{displaySubtitle}</p>
        )}
      </div>
      <div className="d-flex align-items-center gap-3">
        {/* Bell Icon */}
        <Link to="/dashboard/notifications" className="position-relative text-decoration-none d-flex align-items-center" style={{ color: '#4A5568' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
              style={{ background: '#EF4444', fontSize: '0.55rem', padding: '2px 5px' }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Dynamic Profile Image or Initials */}
        <Link to="/dashboard/profile" className="text-decoration-none">
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt="Profile"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #1565C0',
                cursor: 'pointer',
              }}
            />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1565C0 0%, #00ACC1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {profileData.name
                ? profileData.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                : 'AH'}
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}
