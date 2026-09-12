import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { PharmaLogo } from '@/components/PharmaLogo'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', pharmacy: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.phone.trim()) e.phone = 'Phone number is required.'
    if (!form.pharmacy.trim()) e.pharmacy = 'Pharmacy name is required.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!form.confirm) e.confirm = 'Please confirm your password.'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    setSubmitted(true)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) navigate('/dashboard')
  }

  const fe = (k) => submitted && errors[k]

  const fields = [
    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Ahmed Mohamed', col: 6 },
    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@pharmacy.com', col: 6 },
    { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+20 1XX XXX XXXX', col: 6 },
    { label: 'Pharmacy Name', key: 'pharmacy', type: 'text', placeholder: 'Al-Shifa Pharmacy', col: 6 },
    { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', col: 6 },
    { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••', col: 6 },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left */}
      <div
        className="d-none d-md-flex flex-column align-items-center justify-content-center text-white"
        style={{ width: '40%', background: 'linear-gradient(160deg, #00ACC1 0%, #1565C0 50%, #0D47A1 100%)', padding: '3rem', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -80, left: -80 }} />
        <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
          <PharmaLogo size={80} />
          <h2 style={{ fontWeight: 800, letterSpacing: '0.08em', marginTop: '1.5rem' }}>PHARMACARE</h2>
          <p style={{ opacity: 0.6, fontSize: '0.7rem', letterSpacing: '0.2em' }}>SMART PHARMACY MANAGEMENT</p>
          <div style={{ marginTop: '2.5rem', maxWidth: 280 }}>
            <h4 style={{ fontWeight: 600 }}>Start Managing Your Pharmacy Today</h4>
            <p style={{ opacity: 0.65, fontSize: '0.875rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
              Join over 1,500 pharmacies already using PharmaCare.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '2rem', maxWidth: 260 }}>
            {[{v:'1,500+',l:'Pharmacies'},{v:'99.9%',l:'Uptime'},{v:'24/7',l:'Support'},{v:'Free',l:'Setup'}].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.v}</div>
                <div style={{ opacity: 0.65, fontSize: '0.7rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-right" style={{ flex: 1 }}>
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="d-flex align-items-center gap-2 d-md-none mb-4">
            <PharmaLogo size={30} />
            <span style={{ fontWeight: 700, color: '#1565C0' }}>PHARMACARE</span>
          </div>

          <h3 style={{ fontWeight: 800, color: '#1A202C' }}>Create Account</h3>
          <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Fill in your details to get started for free</p>

          <Form noValidate onSubmit={handleSubmit}>
            <Row className="g-3">
              {fields.map(f => {
                const isPassField = f.key === 'password'
                const isConfirmField = f.key === 'confirm'
                const hasIconBtn = isPassField || isConfirmField

                return (
                  <Col key={f.key} xs={12} sm={f.col}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>{f.label}</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={
                            isPassField 
                              ? (showPass ? 'text' : 'password')
                              : isConfirmField 
                              ? (showConfirm ? 'text' : 'password')
                              : f.type
                          }
                          placeholder={f.placeholder}
                          value={form[f.key]}
                          onChange={handleChange(f.key)}
                          isInvalid={!!fe(f.key)}
                          style={{
                            borderRadius: 10,
                            fontSize: '0.875rem',
                            paddingRight: hasIconBtn ? '2.5rem' : undefined
                          }}
                        />

                        {isPassField && !fe('password') && (
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'none',
                              color: '#718096',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 5
                            }}
                          >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        )}

                        {isConfirmField && !fe('confirm') && (
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'none',
                              color: '#718096',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 5
                            }}
                          >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                      </div>

                      {fe(f.key) && (
                        <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {errors[f.key]}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                )
              })}
            </Row>

            <Button type="submit" variant="primary" className="w-100 mt-4" style={{ borderRadius: 12, padding: '0.7rem', fontWeight: 600 }}>
              Create Account
            </Button>
          </Form>

          <p className="text-center mt-4" style={{ fontSize: '0.875rem', color: '#718096' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1565C0', fontWeight: 600, cursor: 'pointer' }}>Sign In</Link>
          </p>
          <div className="text-center mt-2">
            <Link to="/" style={{ fontSize: '0.75rem', color: '#718096', cursor: 'pointer' }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
