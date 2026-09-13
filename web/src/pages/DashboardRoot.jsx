import { useState } from 'react'
import { Outlet } from 'react-router'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function DashboardRoot() {
  const [profileData, setProfileData] = useState({
    name: 'Dr. Ahmed Hassan',
    email: 'ahmed@pharmacare.eg',
    phone: '+20 100 123 4567',
    pharmacy: 'PharmaCare Central, Cairo',
    title: 'Lead Pharmacist',
    bio: 'Experienced pharmacist with over 8 years managing high-volume retail pharmacies across Cairo.',
    avatar: null,
  })

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="pharma-main">
        <TopBar profileData={profileData} />
        <div className="pharma-content">
          <Outlet context={{ profileData, setProfileData }} />
        </div>
      </div>
    </div>
  )
}
