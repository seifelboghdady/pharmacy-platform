import { useState } from 'react'
import { Link } from 'react-router'
import { Row, Col, Card } from 'react-bootstrap'

const generateDynamicYearlyData = () => {
  const db = {}
  const yearFactors = {
    '2026': 1.0,
    '2025': 0.85,
    '2024': 0.60,
    '2023': 0.78,
    '2022': 0.45,
    '2021': 0.65,
    '2020': 0.35,
    '2019': 0.55,
    '2018': 0.40,
    '2017': 0.50,
    '2016': 0.25
  }
  const monthBase = [12000, 9000, 15000, 11000, 18000, 14000, 21000, 16000, 24000, 19000, 23000, 26000]

  Object.keys(yearFactors).forEach(yr => {
    const factor = yearFactors[yr]
    const barData = monthBase.map((val, idx) => {
      const monthVariation = 0.85 + ((idx * 7) % 5) * 0.07
      return Math.round(val * factor * monthVariation)
    })

    const totalRev = barData.reduce((acc, curr) => acc + curr, 0)

    db[yr] = {
      revenue: `${totalRev.toLocaleString()} EGP`,
      orders: Math.round(1420 * factor).toLocaleString(),
      medicines: Math.round(2150 * (0.6 + factor * 0.4)).toLocaleString(),
      lowStock: Math.round(15 + (1 - factor) * 20),
      barData
    }
  })

  return db
}

const yearlyDatabase = generateDynamicYearlyData()
const GLOBAL_MAX_REVENUE = Math.max(...yearlyDatabase['2026'].barData)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const recentOrders = [
  { id: 'ORD-001', medicine: 'Paracetamol 500mg', qty: 50, total: '250 EGP', status: 'Completed' },
  { id: 'ORD-002', medicine: 'Amoxicillin 250mg', qty: 30, total: '420 EGP', status: 'Pending' },
  { id: 'ORD-003', medicine: 'Vitamin C 1000mg', qty: 100, total: '180 EGP', status: 'Completed' },
  { id: 'ORD-004', medicine: 'Ibuprofen 400mg', qty: 60, total: '310 EGP', status: 'Processing' },
  { id: 'ORD-005', medicine: 'Omeprazole 20mg', qty: 45, total: '540 EGP', status: 'Completed' },
]

const statusBadge = {
  Completed: 'badge-success',
  Pending: 'badge-warning',
  Processing: 'badge-info',
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState('2026')
  const activeData = yearlyDatabase[selectedYear] || yearlyDatabase['2026']

  const kpis = [
    { label: 'Total Revenue', value: activeData.revenue, change: '+12.5%', up: true, color: '#1565C0', bg: '#EFF6FF', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
    { label: 'Total Orders', value: activeData.orders, change: '+8.3%', up: true, color: '#00ACC1', bg: '#ECFEFF', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg> },
    { label: 'Medicines', value: activeData.medicines, change: '-2.1%', up: false, color: '#7C3AED', bg: '#F5F3FF', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
    { label: 'Low Stock', value: activeData.lowStock, change: '+3', up: false, color: '#EF4444', bg: '#FFF1F2', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
  ]
return (
    <div>
      {/* KPIs */}
      <Row className="g-3 mb-4">
        {kpis.map((k) => (
          <Col key={k.label} xs={6} xl={3}>
            <div className="kpi-card shadow-sm p-3 bg-white" style={{ borderRadius: 16 }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {k.icon}
                </div>
                <span className="badge" style={{ background: k.up ? '#DCFCE7' : '#FFF1F2', color: k.up ? '#16A34A' : '#EF4444', fontSize: '0.7rem' }}>
                  {k.change}
                </span>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1A202C' }}>{k.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: 2 }}>{k.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="g-3 mb-4">
        {/* Revenue bar chart */}
        <Col xl={8}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
            <Card.Body style={{ padding: '1.25rem' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Monthly Revenue</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>{`EGP — ${selectedYear}`}</div>
                </div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto', fontSize: '0.75rem', cursor: 'pointer' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Object.keys(yearlyDatabase).reverse().map((yr) => (
                    <option key={yr} value={yr}>
                      {yr === '2026' ? '2026 (This Year)' : yr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex align-items-end gap-1" style={{ height: 150 }}>
                {activeData.barData.map((v, i) => (
                  <div key={i} className="d-flex flex-column align-items-center gap-1" style={{ flex: 1 }}>
                    <div
                      className="chart-bar w-100"
                      title={`${v.toLocaleString()} EGP`}
                      style={{
                        height: `${Math.max((v / GLOBAL_MAX_REVENUE) * 130, 5)}px`,
                        background: i === 11 ? 'linear-gradient(180deg, #1565C0 0%, #00ACC1 100%)' : '#BFDBFE',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.4s ease'
                      }}
                    />
                    <span style={{ fontSize: '0.55rem', color: '#718096' }}>{months[i]}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Donut chart */}
        <Col xl={4}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
            <Card.Body style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Stock Status</div>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '1rem' }}>Inventory overview</div>
              <div className="d-flex justify-content-center mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#F1F5F9" strokeWidth="16" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#1565C0" strokeWidth="16" strokeDasharray={`${0.72 * 301.6} ${301.6}`} strokeDashoffset="75.4" strokeLinecap="round" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray={`${0.18 * 301.6} ${301.6}`} strokeDashoffset={`${-(0.72 * 301.6) + 75.4}`} strokeLinecap="round" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#EF4444" strokeWidth="16" strokeDasharray={`${0.10 * 301.6} ${301.6}`} strokeDashoffset={`${-(0.90 * 301.6) + 75.4}`} strokeLinecap="round" />
                  <text x="60" y="56" textAnchor="middle" fill="#1A202C" fontSize="18" fontWeight="700">72%</text>
                  <text x="60" y="70" textAnchor="middle" fill="#718096" fontSize="9">Healthy</text>
                </svg>
              </div>
              {[
                { label: 'Healthy', count: '1,326', pct: '72%', color: '#1565C0' },
                { label: 'Low Stock', count: '331', pct: '18%', color: '#F59E0B' },
                { label: 'Expired', count: '185', pct: '10%', color: '#EF4444' },
              ].map((s) => (
                <div key={s.label} className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: '0.75rem', color: '#4A5568' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: '#1A202C' }}>{s.count}</span>
                    <span style={{ color: '#718096', marginLeft: 6 }}>{s.pct}</span>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <Card.Header className="bg-white d-flex align-items-center justify-content-between" style={{ borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Recent Orders</span>
          <Link to="/dashboard/orders" style={{ fontSize: '0.8rem', color: '#1565C0', cursor: 'pointer', textDecoration: 'none' }}>View All →</Link>
        </Card.Header>
        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {['Order ID', 'Medicine', 'Quantity', 'Total', 'Status'].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ color: '#1565C0', fontWeight: 600 }}>{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.medicine}</td>
                  <td style={{ color: '#718096' }}>{o.qty}</td>
                  <td style={{ fontWeight: 600 }}>{o.total}</td>
                  <td>
                    <span className={`badge ${statusBadge[o.status] || 'badge-secondary'}`} style={{ fontSize: '0.7rem', padding: '0.3em 0.7em' }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}