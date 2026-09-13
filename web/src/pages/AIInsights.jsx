import { Card, Row, Col, Badge } from 'react-bootstrap'
import { Cpu, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

const forecasts = [
  { name: 'Paracetamol 500mg', current: 450, predicted: 620, trend: 'up', confidence: 94 },
  { name: 'Amoxicillin 250mg', current: 120, predicted: 95, trend: 'down', confidence: 87 },
  { name: 'Vitamin C 1000mg', current: 22, predicted: 180, trend: 'up', confidence: 91 },
  { name: 'Ibuprofen 400mg', current: 310, predicted: 340, trend: 'up', confidence: 82 },
  { name: 'Omeprazole 20mg', current: 8, predicted: 60, trend: 'up', confidence: 89 },
]

const warnings = [
  { id: 1, severity: 'high', drug1: 'Warfarin', drug2: 'Aspirin', effect: 'Increased bleeding risk — recommend monitoring INR levels.' },
  { id: 2, severity: 'medium', drug1: 'Metformin', drug2: 'Ibuprofen', effect: 'NSAIDs may reduce Metformin efficacy; advise caution.' },
  { id: 3, severity: 'low', drug1: 'Cetirizine', drug2: 'Alcohol', effect: 'Potential sedation enhancement; counsel patient.' },
  { id: 4, severity: 'high', drug1: 'Atorvastatin', drug2: 'Clarithromycin', effect: 'Severe myopathy risk — avoid co-administration.' },
]

const revenuePrediction = [
  { month: 'Jul', actual: 42000, predicted: null },
  { month: 'Aug', actual: 48000, predicted: null },
  { month: 'Sep', actual: 45000, predicted: null },
  { month: 'Oct', actual: null, predicted: 51000 },
  { month: 'Nov', actual: null, predicted: 56000 },
  { month: 'Dec', actual: null, predicted: 61000 },
]

const maxRev = 70000
const sevConfig = {
  high: { color: '#EF4444', bg: '#FFF1F2', label: 'High' },
  medium: { color: '#D97706', bg: '#FEF3C7', label: 'Medium' },
  low: { color: '#2563EB', bg: '#DBEAFE', label: 'Low' },
}

export default function AIInsights() {
  return (
    <div>
      {/* Header banner */}
      <div
        className="mb-4 p-4 d-flex align-items-center gap-3"
        style={{ background: 'linear-gradient(135deg,#1565C0 0%,#0D47A1 100%)', borderRadius: 16, color: '#fff' }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cpu size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>AI Insights Engine</div>
          <div style={{ opacity: 0.8, fontSize: '0.8rem' }}>Powered by predictive analytics — last updated today at 08:00</div>
        </div>
        <div className="ms-auto d-flex gap-2">
          <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem', fontWeight: 600 }}>
            Model v2.4
          </span>
        </div>
      </div>

      <Row className="g-4">
        {/* Demand Forecasting */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Demand Forecasting</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>Next 30-day demand predictions per medicine</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.25rem' }}>
              {forecasts.map((f) => {
                const pct = Math.round(((f.predicted - f.current) / f.current) * 100)
                const isUp = f.trend === 'up'
                return (
                  <div key={f.name} className="mb-3 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1A202C' }}>{f.name}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.7rem', color: '#718096' }}>
                          Confidence: <strong style={{ color: '#1A202C' }}>{f.confidence}%</strong>
                        </span>
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', fontWeight: 700, color: isUp ? '#16A34A' : '#EF4444' }}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(pct)}%
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: '#718096', marginBottom: 4 }}>
                          Current: {f.current} → Predicted: <strong style={{ color: isUp ? '#16A34A' : '#EF4444' }}>{f.predicted}</strong>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, position: 'relative' }}>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 99,
                              background: isUp ? '#16A34A' : '#EF4444',
                              width:` ${Math.min(100, (f.predicted / 700) * 100)}%`,
                              transition: 'width 0.6s',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue Prediction */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16, marginBottom: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Revenue Prediction</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>Actual vs predicted (EGP)</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.25rem' }}>
              <div className="d-flex align-items-end gap-2" style={{ height: 140 }}>
                {revenuePrediction.map((d) => {
                  const val = d.actual ?? d.predicted
                  const isPredicted = d.actual === null
                  const h = Math.round((val / maxRev) * 130)
                  return (
                    <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600, color: isPredicted ? '#1565C0' : '#16A34A' }}>
                        {(val / 1000).toFixed(0)}k
                      </span>
                      <div
                        style={{
                          width: '100%',
                          height: h,
                          background: isPredicted ? 'linear-gradient(180deg,#60A5FA,#1565C0)' : 'linear-gradient(180deg,#4ADE80,#16A34A)',
                          borderRadius: '6px 6px 0 0',
                          opacity: isPredicted ? 0.75 : 1,
                          border: isPredicted ? '2px dashed #1565C0' : 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.65rem', color: '#718096' }}>{d.month}</span>
                    </div>
                  )
                })}
              </div>
              <div className="d-flex gap-3 mt-2">
                  <div className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#16A34A' }} />
                  <span style={{ fontSize: '0.65rem', color: '#718096' }}>Actual</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#1565C0', opacity: 0.75, border: '2px dashed #1565C0' }} />
                  <span style={{ fontSize: '0.65rem', color: '#718096' }}>Predicted</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick stats */}
          {[
            { label: 'Accuracy Rate', val: '94.2%', sub: 'Forecast model accuracy', color: '#16A34A', bg: '#DCFCE7' },
            { label: 'Predicted Growth', val: '+18%', sub: 'vs. last quarter', color: '#1565C0', bg: '#EFF6FF' },
          ].map((s) => (
            <div key={s.label} className="kpi-card d-flex align-items-center gap-3 mb-3 p-3 bg-white shadow-sm" style={{ borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
                {s.val}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A202C' }}>{s.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#718096' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </Col>

        {/* Drug Interactions */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>Drug Interaction Warnings</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>AI-detected potential interactions in recent prescriptions</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {warnings.map((w) => {
                  const cfg = sevConfig[w.severity]
                  return (
                    <div
                      key={w.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '0.9rem 1rem',
                        background: cfg.bg,
                        borderRadius: 12,
                        border: `1px solid ${cfg.color}30`,
                        borderLeft: `3px solid ${cfg.color}`,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${cfg.color}20`,
                          color: cfg.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AlertTriangle size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A202C' }}>
                            {w.drug1} + {w.drug2}
                          </span>
                          <Badge style={{ background: cfg.color, fontSize: '0.6rem', borderRadius: 99 }}>{cfg.label} Risk</Badge>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>{w.effect}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}