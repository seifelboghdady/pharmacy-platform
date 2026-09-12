import { useState, useEffect } from 'react'
import { Card, Form, Button, Row, Col, Modal } from 'react-bootstrap'
import { X } from 'lucide-react'
import { useNotifications } from '@/context/NotificationsContext'

const initialMedicines = [
  { name: 'Paracetamol 500mg', stock: 450, price: 5.00 },
  { name: 'Amoxicillin 250mg', stock: 120, price: 14.50 },
  { name: 'Ibuprofen 400mg', stock: 310, price: 6.00 },
  { name: 'Omeprazole 20mg', stock: 8, price: 12.00 },
  { name: 'Cetirizine 10mg', stock: 500, price: 2.50 },
  { name: 'Metronidazole 400mg', stock: 85, price: 8.00 },
]

const initialRecentDispenses = [
  { id: 'DSP-001', patient: 'Ahmed Hassan', medicines: 'Paracetamol 500mg × 30', time: '09:15', total: '150 EGP', status: 'Completed' },
  { id: 'DSP-002', patient: 'Sara Ibrahim', medicines: 'Amoxicillin 250mg × 14', time: '10:02', total: '203 EGP', status: 'Completed' },
  { id: 'DSP-003', patient: 'Mohamed Ali', medicines: 'Ibuprofen 400mg × 20', time: '11:30', total: '120 EGP', status: 'Processing' },
  { id: 'DSP-004', patient: 'Fatma Khaled', medicines: 'Cetirizine 10mg × 30', time: '13:15', total: '75 EGP', status: 'Completed' },
]

export default function Dispense() {
  const { addNotification } = useNotifications()
  const [patient, setPatient] = useState('')
  const [prescrip, setPrescrip] = useState('')
  const [items, setItems] = useState([])
  const [showModal, setModal] = useState(false)
  const [selMed, setSelMed] = useState('')
  const [qty, setQty] = useState(1)

  const [medsList, setMedsList] = useState(initialMedicines)
  const [dispenses, setDispenses] = useState([])

  useEffect(() => {
    const savedDisp = localStorage.getItem('pharma_dispenses')
    if (savedDisp) {
      setDispenses(JSON.parse(savedDisp))
    } else {
      setDispenses(initialRecentDispenses)
      localStorage.setItem('pharma_dispenses', JSON.stringify(initialRecentDispenses))
    }

    const savedMeds = localStorage.getItem('pharma_stock')
    if (savedMeds) {
      setMedsList(JSON.parse(savedMeds))
    } else {
      localStorage.setItem('pharma_stock', JSON.stringify(initialMedicines))
    }
  }, [])

  const addItem = () => {
    const med = medsList.find((m) => m.name === selMed)
    if (!selMed || !qty) return
    const existing = items.find((i) => i.name === med.name)
    if (existing) {
      setItems(items.map((i) => (i.name === med.name ? { ...i, qty: i.qty + Number(qty) } : i)))
    } else {
      setItems([...items, { name: med.name, qty: Number(qty), price: med.price }])
    }
    setSelMed('')
    setQty(1)
    setModal(false)
  }

  const removeItem = (name) => setItems(items.filter((i) => i.name !== name))
  const total = items.reduce((s, i) => s + i.qty * i.price, 0)

  const handleDispense = () => {
    if (!patient || items.length === 0) return

    const now = new Date()
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')

    const medSummary = items.map((i) => i.name + ' × ' + i.qty).join(', ')
    const nextId = 'DSP-' + String(dispenses.length + 1).padStart(3, '0')

    const newDispenseObj = {
      id: nextId,
      patient: patient,
      medicines: medSummary,
      time: timeStr,
      total: total.toFixed(2) + ' EGP',
      status: 'Completed',
    }

    const updatedDispenses = [newDispenseObj, ...dispenses]
    setDispenses(updatedDispenses)
    localStorage.setItem('pharma_dispenses', JSON.stringify(updatedDispenses))

    const updatedMeds = medsList.map((m) => {
      const itemFound = items.find((i) => i.name === m.name)
      if (itemFound) {
        return { ...m, stock: Math.max(0, m.stock - itemFound.qty) }
      }
      return m
    })
    setMedsList(updatedMeds)
    localStorage.setItem('pharma_stock', JSON.stringify(updatedMeds))

    if (addNotification) {
      addNotification({
        type: 'info',
        title: 'Medicine Dispensed',
        message: `Dispensed ${items.length} item(s) to ${patient} (Total: ${total.toFixed(2)} EGP).`
      })
    }
  setPatient('')
    setPrescrip('')
    setItems([])
  }

  return (
    <div>
      <Row className="g-4">
        {/* Left – Dispense form */}
        <Col xl={7}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A202C' }}>New Dispensation</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>Fill in patient and prescription details</div>
            </Card.Header>
            <Card.Body style={{ padding: '1.25rem' }}>
              {/* Step 1 – Patient */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                    1
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A202C' }}>Patient Information</span>
                </div>
                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Control placeholder="Patient name" value={patient} onChange={(e) => setPatient(e.target.value)} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                  </Col>
                  <Col xs={6}>
                    <Form.Control placeholder="Prescription / ID no." value={prescrip} onChange={(e) => setPrescrip(e.target.value)} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
                  </Col>
                </Row>
              </div>

              {/* Step 2 – Medicines */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                      2
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1A202C' }}>Medicines to Dispense</span>
                  </div>
                  <button className="btn btn-sm btn-primary" style={{ borderRadius: 8, fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setModal(true)}>
                    + Add Medicine
                  </button>
                </div>

                {items.length === 0 ? (
                  <div style={{ border: '2px dashed #E2E8F0', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.875rem' }}>
                    No medicines added yet. Click "+ Add Medicine" to begin.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                    <table className="table mb-0" style={{ fontSize: '0.8rem' }}>
                      <thead style={{ background: '#F8FAFC' }}>
                        <tr>
                          {['Medicine', 'Qty', 'Unit Price', 'Total', ''].map((h) => (
                            <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#718096', fontSize: '0.75rem' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.name}>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{item.name}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#718096' }}>{item.qty}</td>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#718096' }}>{item.price.toFixed(2)} EGP</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#1565C0' }}>{(item.qty * item.price).toFixed(2)} EGP</td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <button onClick={() => removeItem(item.name)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total + Submit */}
              {items.length > 0 && (
                <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontWeight: 600, color: '#1565C0', fontSize: '0.9rem' }}>Total Amount</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1565C0' }}>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" className="flex-1" style={{ borderRadius: 10 }} onClick={() => { setItems([]); setPatient(''); setPrescrip('') }}>
                  Clear
                </Button>
                <Button variant="primary" className="flex-1" style={{ borderRadius: 10 }} disabled={!patient || items.length === 0} onClick={handleDispense}>
                  Dispense & Print Label
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right – Recent + stock */}
        <Col xl={5}>
          <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '0.75rem 1.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A202C' }}>Today's Dispensations</span>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              {dispenses.map((d) => (
                <div
                  key={d.id}
                  style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1A202C' }}>{d.patient}</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096', marginTop: 1 }}>{d.medicines}</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1565C0' }}>{d.total}</div>
                      <div style={{ fontSize: '0.65rem', color: '#718096' }}>{d.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
          {/* Quick stock check */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '0.75rem 1.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A202C' }}>Quick Stock Check</span>
            </Card.Header>
            <Card.Body style={{ padding: '0.75rem 1.25rem' }}>
              {medsList.map((m) => (
                <div key={m.name} className="d-flex align-items-center justify-content-between mb-2">
                  <span style={{ fontSize: '0.75rem', color: '#4A5568', flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: m.stock < 20 ? '#EF4444' : m.stock < 50 ? '#D97706' : '#16A34A' }}>
                    {m.stock} units
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Medicine Modal */}
      <Modal show={showModal} onHide={() => setModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add Medicine</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.25rem' }}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Select Medicine</Form.Label>
            <Form.Select value={selMed} onChange={(e) => setSelMed(e.target.value)} style={{ borderRadius: 10, fontSize: '0.875rem' }}>
              <option value="">Choose medicine…</option>
              {medsList.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} (Stock: {m.stock})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Quantity</Form.Label>
            <Form.Control type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #E2E8F0' }}>
          <Button variant="outline-secondary" style={{ borderRadius: 10 }} onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" style={{ borderRadius: 10 }} onClick={addItem} disabled={!selMed || !qty}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
