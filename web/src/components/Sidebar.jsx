import { Link, useLocation, useNavigate } from 'react-router'
import { PharmaLogo } from './PharmaLogo'
import { useNotifications } from '@/context/NotificationsContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Pill,
  Bell,
  Sparkles,
  Settings,
  User,
  LogOut
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/dashboard/dispense', label: 'Dispense', icon: Pill },
  { to: '/dashboard/notifications', label: 'Notifications', badge: true, icon: Bell },
  { to: '/dashboard/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  const isActive = (to, end) => end ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div className="pharma-sidebar d-flex flex-column justify-content-between h-100" style={{ minHeight: '100vh' }}>
      <div>
        {/* Logo */}
        <Link to="/" className="sidebar-logo d-flex align-items-center gap-2 text-decoration-none">
          <PharmaLogo size={30} />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em' }}>PHARMACARE</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5rem', letterSpacing: '0.15em' }}>SMART PHARMACY</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="px-2 py-3">
          {navItems.map(item => {
            const active = isActive(item.to, item.end)
            const showBadge = item.badge && unreadCount > 0
            const IconComponent = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item d-flex align-items-center gap-2 mb-1 ${active ? 'active' : ''}`}
              >
                <IconComponent size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {showBadge && (
                  <span
                    className="badge rounded-pill"
                    style={{ background: '#EF4444', color: '#fff', fontSize: '0.6rem', padding: '0.2em 0.5em' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout Positioned at the Very Bottom */}
      <div className="px-2 pb-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
        <button className="sidebar-logout d-flex align-items-center gap-2 w-100" onClick={() => navigate('/')}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}
