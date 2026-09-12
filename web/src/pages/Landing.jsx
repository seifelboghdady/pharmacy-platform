import { Link } from 'react-router'
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap'
import { PharmaLogo } from '@/components/PharmaLogo'
import {
  Pill,
  Receipt,
  BarChart3,
  Package,
  Bot,
  Bell
} from 'lucide-react'

const features = [
  { icon: Pill, title: 'Smart Inventory', desc: 'Track medicine stock in real-time with low-stock and expiry alerts.' },
  { icon: Receipt, title: 'Billing & Invoices', desc: 'Generate professional invoices and track revenue effortlessly.' },
  { icon: BarChart3, title: 'Expense Analytics', desc: 'Understand spending patterns with detailed financial charts.' },
  { icon: Package, title: 'Order Management', desc: 'Manage supplier orders and maintain optimal stock levels.' },
  { icon: Bot, title: 'AI Insights', desc: 'Smart predictions, drug interaction checks, and demand forecasting.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Never miss an expiry or reorder point with intelligent alerts.' },
]

const stats = [
  { val: '1,500+', label: 'Active Pharmacies' },
  { val: '20,000 EGP', label: 'Avg. Monthly Revenue' },
  { val: '20.5%', label: 'Revenue Growth' },
  { val: '50+', label: 'Partner Suppliers' },
]

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <Navbar bg="white" className="border-bottom shadow-sm px-4" sticky="top">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <PharmaLogo size={34} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1565C0', lineHeight: 1 }}>PHARMACARE</div>
            <div style={{ fontSize: '0.45rem', letterSpacing: '0.15em', color: '#00ACC1' }}>SMART PHARMACY MANAGEMENT</div>
          </div>
        </Navbar.Brand>
        
        <Nav className="mx-auto d-none d-md-flex gap-4">
          <Nav.Link href="#hero" style={{ fontSize: '0.875rem', color: '#4A5568' }}>Home</Nav.Link>
          <Nav.Link href="#features" style={{ fontSize: '0.875rem', color: '#4A5568' }}>Features</Nav.Link>
          <Nav.Link href="#stats" style={{ fontSize: '0.875rem', color: '#4A5568' }}>Stats</Nav.Link>
        </Nav>

        <div className="d-flex gap-2">
          <Button as={Link} to="/login" variant="outline-primary" size="sm">Login</Button>
          <Button as={Link} to="/register" variant="primary" size="sm">Sign Up</Button>
        </div>
      </Navbar>

      {/* Hero */}
      <div id="hero" className="hero-section py-5">
        <Container>
          <Row className="align-items-center g-5">
            <Col md={6}>
              <span className="badge text-bg-primary mb-3" style={{ background: '#EFF6FF', color: '#1565C0', fontWeight: 600, padding: '8px 12px' }}>
                #1 Pharmacy Management Platform
              </span>
              <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, color: '#1A202C' }}>
                Manage Your Pharmacy{' '}
                <span style={{ color: '#1565C0' }}>Effortlessly</span>
              </h1>
              <p style={{ color: '#4A5568', lineHeight: 1.8, marginTop: '1rem', fontSize: '1rem' }}>
                PharmaCare helps you track inventory, manage billing, monitor expenses, and grow your pharmacy business — all in one powerful platform.
              </p>
              <div className="d-flex gap-3 mt-4">
  <Button as={Link} to="/register" variant="primary" size="lg" style={{ borderRadius: 12 }}>
    Get Started Free
  </Button>
  <Button variant="outline-primary" size="lg" style={{ borderRadius: 12 }}>
    Learn More
  </Button>
</div>
            </Col>
            <Col md={6}>
              {/* Dashboard preview */}
              <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#2d3748', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  {['#fc5c65','#fed330','#26de81'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ display: 'flex', background: '#fff', height: 250 }}>
                  <div style={{ width: 50, background: '#1A2332', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 14 }}>
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: 26, height: 26, borderRadius: 8, background: i === 0 ? '#1565C0' : '#243447' }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: 16, background: '#F8FAFC' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {[
                        { label: 'Revenue', val: '14,500 EGP', color: '#1565C0' },
                        { label: 'Orders', val: '248', color: '#00ACC1' },
                        { label: 'Medicines', val: '1,842', color: '#7C3AED' },
                      ].map(c => (
                        <div key={c.label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                          <div style={{ fontSize: '0.55rem', color: '#718096' }}>{c.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, marginBottom: 8, color: '#1A202C' }}>Monthly Revenue</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
                        {[40,65,50,80,70,90,75,85,60,95,80,100].map((h, i) => (
                          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: i === 11 ? '#1565C0' : '#BFDBFE' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features */}
      <div id="features" className="py-5 bg-white">
        <Container>
          <h2 className="text-center fw-bold mb-2" style={{ color: '#1A202C' }}>Everything you need to run your pharmacy</h2>
          <p className="text-center mb-5" style={{ color: '#718096' }}>Powerful tools designed specifically for pharmacy management</p>
          <Row className="g-4">
            {features.map((f) => {
              const IconComponent = f.icon;
              return (
                <Col key={f.title} md={4}>
                  <div className="feature-card p-4 border rounded-3 shadow-sm h-100">
                    <div
                      className="d-flex align-items-center justify-content-center mb-3 rounded-circle"
                      style={{ width: 50, height: 50, background: '#EFF6FF', color: '#1565C0' }}
                    >
                      <IconComponent size={26} strokeWidth={2} />
                    </div>
                    <h5 style={{ fontWeight: 700, color: '#1A202C' }}>{f.title}</h5>
                    <p style={{ color: '#718096', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>

      {/* Stats */}
      <div id="stats" className="stats-section py-5" style={{ background: '#1565C0' }}>
        <Container>
          <Row className="g-4 text-center text-white">
            {stats.map(s => (
              <Col key={s.label} xs={6} md={3}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{s.val}</div>
                <div style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: 4 }}>{s.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA */}
      <div className="py-5 text-center bg-white">
        <Container>
          <h2 className="fw-bold mb-3" style={{ color: '#1A202C' }}>Ready to transform your pharmacy?</h2>
          <p style={{ color: '#718096', maxWidth: 500, margin: '0 auto 2rem' }}>
            Join thousands of pharmacists who trust PharmaCare to manage their business efficiently.
          </p>
          <Button as={Link} to="/register" variant="primary" size="lg" style={{ borderRadius: 12, padding: '0.75rem 2rem' }}>
            Start Free Today
          </Button>
        </Container>
      </div>

      {/* Footer */}
      <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '2rem 0' }}>
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <PharmaLogo size={26} />
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1565C0' }}>PHARMACARE</span>
            </div>
            <p style={{ color: '#718096', fontSize: '0.75rem', margin: 0 }}>© 2026 PharmaCare. All rights reserved.</p>
            <div className="d-flex gap-4">
              {['Privacy', 'Terms', 'Support'].map(l => (
                <a key={l} href="#" style={{ color: '#718096', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}>{l}</a>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
