import { useState } from 'react'
import { useOutletContext } from 'react-router'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { User, Bell, Lock } from 'lucide-react'

export default function Settings() {
  const { profileData, setProfileData } = useOutletContext()
  const [profile, setProfile] = useState(profileData)

  const [errors, setErrors] = useState({})
  const [notifs, setNotifs] = useState({ lowStock: true, expiry: true, orders: true, reports: false, system: true })
  const [saved, setSaved] = useState(false)

  // Passwords State & Validation
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirmPass: '' })
  const [passErrors, setPassErrors] = useState({})
  const [passSuccess, setPassSuccess] = useState(false)

  const handleProfileChange = (key) => (e) => {
    setProfile({ ...profile, [key]: e.target.value })
  }

  const validateProfile = () => {
    let errs = {}
    if (!profile.name.trim()) errs.name = 'Full name is required'
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) errs.email = 'Valid email is required'
    if (!profile.phone.trim()) errs.phone = 'Phone number is required'
    if (!profile.pharmacy.trim()) errs.pharmacy = 'Pharmacy name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (validateProfile()) {
      setProfileData(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    let errs = {}
    if (!passwords.current) errs.current = 'Current password is required'
    if (passwords.newPass.length < 8) errs.newPass = 'Password must be at least 8 characters'
    if (passwords.newPass !== passwords.confirmPass) errs.confirmPass = 'Passwords do not match'

    setPassErrors(errs)
    if (Object.keys(errs).length === 0) {
      setPassSuccess(true)
      setPasswords({ current: '', newPass: '', confirmPass: '' })
      setTimeout(() => setPassSuccess(false), 2500)
    }
  }

  const toggleN = (k) => setNotifs({ ...notifs, [k]: !notifs[k] })

  const sections = [
    { key: 'profile', label: 'Profile Information', icon: <User size={18} /> },
    { key: 'notifications', label: 'Notification Preferences', icon: <Bell size={18} /> },
    { key: 'security', label: 'Security', icon: <Lock size={18} /> },
  ]
  const [activeSection, setSection] = useState('profile')

  return (
    <Row className="g-4">
      <Col lg={3}>
        <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Card.Body style={{ padding: '0.5rem' }}>
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 0.9rem', borderRadius: 10, border: 'none',
                  background: activeSection === s.key ? '#EFF6FF' : 'transparent',
                  color: activeSection === s.key ? '#1565C0' : '#4A5568',
                  fontWeight: activeSection === s.key ? 700 : 500,
                  fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                }}
              >
                <span style={{ color: activeSection === s.key ? '#1565C0' : '#718096' }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </Card.Body>
        </Card>
      </Col>

      <Col lg={9}>
        {activeSection === 'profile' && (
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Profile Information</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>Update your personal and pharmacy details</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.5rem' }}>
              <Form onSubmit={handleSaveProfile}>
                <Row className="g-3 mb-3">
                  <Col xs={12}>
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Full Name</Form.Label>
                    <Form.Control value={profile.name} onChange={handleProfileChange('name')} isInvalid={!!errors.name} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Email Address</Form.Label>
                    <Form.Control type="email" value={profile.email} onChange={handleProfileChange('email')} isInvalid={!!errors.email} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Col>
                  <Col md={6}>
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Phone Number</Form.Label>
                    <Form.Control value={profile.phone} onChange={handleProfileChange('phone')} isInvalid={!!errors.phone} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                  </Col>
                  <Col xs={12}>
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Pharmacy Name</Form.Label>
                    <Form.Control value={profile.pharmacy} onChange={handleProfileChange('pharmacy')} isInvalid={!!errors.pharmacy} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{errors.pharmacy}</Form.Control.Feedback>
                  </Col>
                </Row>
                <div className="d-flex gap-2 align-items-center">
                  <Button type="submit" variant="primary" style={{ borderRadius: 10 }}>Save Changes</Button>
                  {saved && <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>✓ Saved successfully</span>}
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        {activeSection === 'notifications' && (
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Notification Preferences</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>Choose which notifications to receive</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.5rem' }}>
              {[
                { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when medicines fall below minimum level' },
                { key: 'expiry', label: 'Expiry Date Warnings', desc: 'Alerts for medicines expiring within 30 days' },
                { key: 'orders', label: 'Order Status Updates', desc: 'Notifications when orders are processed or shipped' },
                { key: 'reports', label: 'Weekly Reports', desc: 'Automatic weekly performance summary emails' },
                { key: 'system', label: 'System Notifications', desc: 'App updates, maintenance windows, and system alerts' },
                ].map((n) => (
                <div key={n.key} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A202C' }}>{n.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <Form.Check type="switch" checked={notifs[n.key]} onChange={() => toggleN(n.key)} style={{ cursor: 'pointer' }} />
                </div>
              ))}
              <Button variant="primary" className="mt-3" style={{ borderRadius: 10 }} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}>
                Save Preferences
              </Button>
              {saved && <span className="ms-3" style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>✓ Saved</span>}
            </Card.Body>
          </Card>
        )}

        {activeSection === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Change Password</div>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Current Password</Form.Label>
                    <Form.Control type="password" placeholder="••••••••" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} isInvalid={!!passErrors.current} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{passErrors.current}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>New Password</Form.Label>
                    <Form.Control type="password" placeholder="Min 8 characters" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} isInvalid={!!passErrors.newPass} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{passErrors.newPass}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Confirm New Password</Form.Label>
                    <Form.Control type="password" placeholder="Re-enter new password" value={passwords.confirmPass} onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })} isInvalid={!!passErrors.confirmPass} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                    <Form.Control.Feedback type="invalid">{passErrors.confirmPass}</Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex align-items-center gap-2">
                    <Button type="submit" variant="primary" style={{ borderRadius: 10 }}>Update Password</Button>
                    {passSuccess && <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>✓ Password updated successfully</span>}
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm" style={{ borderRadius: 16, border: '1px solid #FCA5A5' }}>
              <Card.Header style={{ background: '#FFF1F2', borderBottom: '1px solid #FCA5A5', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#B91C1C' }}>Danger Zone</div>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A202C' }}>Delete Account</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: 2 }}>This action is irreversible. All data will be permanently removed.</div>
                  </div>
                  <Button variant="outline-danger" size="sm" style={{ borderRadius: 10, fontSize: '0.8rem' }}>Delete Account</Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Col>
    </Row>
  )
}
