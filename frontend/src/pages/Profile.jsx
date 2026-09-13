import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router'
import { Card, Row, Col, Button, Form, Badge } from 'react-bootstrap'
import { Camera, Mail, Phone, MapPin, Check, X } from 'lucide-react'

const activityLog = [
  { action: 'Added new medicine', detail: 'Paracetamol 500mg — 200 units', time: 'Today, 09:14', type: 'success' },
  { action: 'Approved order', detail: 'ORD-002 from MedCo', time: 'Today, 08:32', type: 'info' },
  { action: 'Dispensed medicine', detail: 'Patient: Ahmed Hassan — DSP-001', time: 'Yesterday, 16:45', type: 'success' },
  { action: 'Updated inventory', detail: 'Omeprazole 20mg stock corrected', time: 'Yesterday, 14:20', type: 'warning' },
  { action: 'Generated report', detail: 'Monthly revenue — June 2025', time: '2 days ago, 11:00', type: 'info' },
  { action: 'Login', detail: 'Successful login from Cairo, EG', time: '2 days ago, 08:05', type: 'success' },
]

const typeColor = { success: '#16A34A', info: '#2563EB', warning: '#D97706', danger: '#EF4444' }

const permissions = [
  { label: 'Inventory Management', granted: true },
  { label: 'Order Processing', granted: true },
  { label: 'Patient Dispensation', granted: true },
  { label: 'Financial Reports', granted: true },
  { label: 'User Management', granted: false },
  { label: 'System Configuration', granted: false },
]

export default function Profile() {
  const { profileData, setProfileData } = useOutletContext()
  const [editing, setEditing] = useState(false)
  const imageInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileData({ ...profileData, avatar: imageUrl })
    }
  }

  const updateField = (key, val) => {
    setProfileData({ ...profileData, [key]: val })
  }

  return (
    <Row className="g-4">
      <Col lg={4}>
        <Card className="border-0 shadow-sm text-center mb-4" style={{ borderRadius: 16 }}>
          <Card.Body style={{ padding: '2rem 1.25rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    objectFit: 'cover', margin: '0 auto', display: 'block',
                    border: '2px solid #1565C0',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#1565C0,#0D47A1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 auto',
                  }}
                >
                  {profileData.name
                    ? profileData.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'AH'}
                </div>
              )}

              <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button
                onClick={() => imageInputRef.current && imageInputRef.current.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
                  borderRadius: '50%', background: '#1565C0', border: '2px solid #fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff',
                }}
                title="Change photo"
              >
                <Camera size={13} />
              </button>
            </div>
            {editing ? (
              <>
                <Form.Control value={profileData.name} onChange={(e) => updateField('name', e.target.value)} className="text-center mb-2" style={{ fontWeight: 700, borderRadius: 10, fontSize: '0.9rem' }} />
                <Form.Control value={profileData.title} onChange={(e) => updateField('title', e.target.value)} className="text-center mb-3" style={{ borderRadius: 10, fontSize: '0.8rem', color: '#718096' }} />
                <Form.Control as="textarea" rows={3} value={profileData.bio} onChange={(e) => updateField('bio', e.target.value)} style={{ borderRadius: 10, fontSize: '0.75rem', resize: 'none' }} />
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1A202C' }}>{profileData.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: 2 }}>{profileData.title}</div>
                <Badge bg="primary" style={{ marginTop: 8, fontSize: '0.65rem', borderRadius: 99, padding: '4px 10px' }}>
                  Admin
                </Badge>
                <p style={{ fontSize: '0.75rem', color: '#4A5568', marginTop: '0.75rem', lineHeight: 1.6 }}>{profileData.bio}</p>
              </>
            )}
            <Button variant={editing ? 'primary' : 'outline-primary'} size="sm" className="w-100 mt-2" style={{ borderRadius: 10, fontSize: '0.8rem' }} onClick={() => setEditing(!editing)}>
              {editing ? 'Save Profile' : 'Edit Profile'}
            </Button>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '0.75rem 1.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A202C' }}>Contact Info</span>
          </Card.Header>
          <Card.Body style={{ padding: '1rem 1.25rem' }}>
            {[
              { icon: <Mail size={14} />, val: profileData.email },
              { icon: <Phone size={14} />, val: profileData.phone },
              { icon: <MapPin size={14} />, val: profileData.pharmacy },
            ].map((c, i) => (
              <div key={i} className="d-flex align-items-center gap-2 mb-2">
                <span style={{ color: '#718096' }}>{c.icon}</span>
                <span style={{ fontSize: '0.78rem', color: '#4A5568' }}>{c.val}</span>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>

      <Col lg={8}>
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
          <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Role & Permissions</div>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>Current access level: Administrator</div>
          </Card.Header>
          <Card.Body style={{ padding: '1.25rem' }}>
            <Row className="g-2">
              {permissions.map((p) => (
                <Col xs={6} key={p.label}>
                  <div className="d-flex align-items-center gap-2 p-2" style={{ background: p.granted ? '#DCFCE7' : '#F8FAFC', borderRadius: 10, border: '1px solid', borderColor: p.granted ? '#BBF7D0' : '#E2E8F0' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.granted ? '#16A34A' : '#CBD5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.granted ? <Check size={10} color="#fff" strokeWidth={3} /> : <X size={10} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: p.granted ? '#166534' : '#718096' }}>{p.label}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
        <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Recent Activity</div>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>Last 6 actions on your account</div>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            {activityLog.map((a, i) => (
              <div key={i} className="d-flex align-items-start gap-3 px-4 py-3" style={{ borderBottom: i < activityLog.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[a.type], flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1A202C' }}>{a.action}</div>
                  <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: 2 }}>{a.detail}</div>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#718096', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
