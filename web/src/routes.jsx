import { createBrowserRouter } from 'react-router'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import DashboardRoot from '@/pages/DashboardRoot'
import Dashboard from '@/pages/Dashboard'
import Inventory from '@/pages/Inventory'
import AddMedicine from '@/pages/AddMedicine'
import Orders from '@/pages/Orders'
import Dispense from '@/pages/Dispense'
import Notifications from '@/pages/Notifications'
import AIInsights from '@/pages/AIInsights'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  {
    path: '/dashboard',
    Component: DashboardRoot,
    children: [
      { index: true, Component: Dashboard },
      { path: 'inventory', Component: Inventory },
      { path: 'inventory/add', Component: AddMedicine },
      { path: 'inventory/edit/:id', Component: AddMedicine },
      { path: 'orders', Component: Orders },
      { path: 'dispense', Component: Dispense },
      { path: 'notifications', Component: Notifications },
      { path: 'ai-insights', Component: AIInsights },
      { path: 'settings', Component: Settings },
      { path: 'profile', Component: Profile },
    ],
  },
])
