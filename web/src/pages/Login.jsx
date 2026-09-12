import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Form, Button } from 'react-bootstrap'
import { PharmaLogo } from '@/components/PharmaLogo'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    setSubmitted(true)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) navigate('/dashboard')
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: null }))
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }))
    }
  }

  const fieldErr = (k) => submitted && errors[k]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div className="auth-left d-none d-md-flex" style={{ width: '42%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -80, left: -80 }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -50, right: -50 }} />
        <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
          <PharmaLogo size={80} />
          <h2 style={{ fontWeight: 800, letterSpacing: '0.08em', marginTop: '1.5rem' }}>PHARMACARE</h2>
          <p style={{ opacity: 0.6, fontSize: '0.7rem', letterSpacing: '0.2em' }}>SMART PHARMACY MANAGEMENT</p>
          <div style={{ marginTop: '3rem', maxWidth: 280 }}>
            <h4 style={{ fontWeight: 600 }}>Monitor Your Pharmacy From Anywhere</h4>
            <p style={{ opacity: 0.65, fontSize: '0.875rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
              Access your inventory, orders, and analytics from any device, anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{ flex: 1 }}>
        <div className="auth-card">
          <div className="d-flex align-items-center gap-2 d-md-none mb-4">
            <PharmaLogo size={30} />
            <span style={{ fontWeight: 700, color: '#1565C0' }}>PHARMACARE</span>
          </div>

          <h3 style={{ fontWeight: 800, color: '#1A202C' }}>Welcome Back</h3>
          <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Sign in to your PharmaCare account</p>

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@pharmacy.com"
                value={email}
                onChange={handleEmailChange}
                isInvalid={!!fieldErr('email')}
                style={{ borderRadius: 12, fontSize: '0.875rem' }}
              />
              {fieldErr('email') && (
                <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.email}
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  isInvalid={!!fieldErr('password')}
                  style={{ borderRadius: 12, fontSize: '0.875rem', paddingRight: '2.5rem' }}
                />
              {!fieldErr('password') && (
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
              </div>
              {fieldErr('password') && (
                <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.password}
                </div>
              )}
            </Form.Group>

            <div className="text-end mb-4">
              <a href="#" style={{ fontSize: '0.75rem', color: '#1565C0', cursor: 'pointer' }}>Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" className="w-100" style={{ borderRadius: 12, padding: '0.7rem', fontWeight: 600 }}>
              Sign In
            </Button>
          </Form>

          <p className="text-center mt-4" style={{ fontSize: '0.875rem', color: '#718096' }}>
            {"Don't have an account? "}
            <Link to="/register" style={{ color: '#1565C0', fontWeight: 600, cursor: 'pointer' }}>Create Account</Link>
          </p>
          <div className="text-center mt-2">
            <Link to="/" style={{ fontSize: '0.75rem', color: '#718096', cursor: 'pointer' }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
