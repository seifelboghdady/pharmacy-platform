import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useNotifications } from '@/context/NotificationsContext'

const categories = [
  'Analgesic',
  'Antibiotic',
  'Supplement',
  'GI',
  'Antidiabetic',
  'Lipid-lowering',
  'Antihypertensive',
  'Antihistamine',
  'Cardiovascular',
  'Dermatology',
  'Other'
]

export default function AddMedicine() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addNotification } = useNotifications()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    category: 'Analgesic',
    quantity: '0',
    unit: 'Tablet',
    price: '0',
    minStock: '20',
    expiry: '',
    supplier: '',
    description: ''
  })

  useEffect(() => {
    if (isEdit) {
      const saved = localStorage.getItem('pharma_inventory')
      if (saved) {
        const list = JSON.parse(saved)
        const med = list.find((item) => String(item.id) === String(id))
        if (med) {
          setForm({
            name: med.name || '',
            category: med.category || 'Analgesic',
            quantity: med.qty !== undefined ? String(med.qty) : '0',
            unit: med.unit || 'Tablet',
            price: med.price !== undefined ? String(med.price) : '0',
            minStock: med.minStock !== undefined ? String(med.minStock) : '20',
            expiry: med.expiry || '',
            supplier: med.supplier || '',
            description: med.description || ''
          })
        }
      }
    }
  }, [id, isEdit])

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSave = () => {
    const qtyNum = Number(form.quantity) || 0
    const minAlert = Number(form.minStock) || 20
    const today = new Date().toISOString().split('T')[0]
    const medName = form.name.trim() || 'Unnamed Medicine'

    let status = 'Active'
    if (qtyNum === 0 || (form.expiry && form.expiry < today)) {
      status = 'Expired'
    } else if (qtyNum <= minAlert) {
      status = 'Low'
    }

    const saved = localStorage.getItem('pharma_inventory')
    const currentList = saved ? JSON.parse(saved) : []

    if (isEdit) {
      const updatedList = currentList.map((item) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            name: medName,
            category: form.category || item.category,
            qty: qtyNum,
            price: parseFloat(form.price || 0).toFixed(2),
            expiry: form.expiry || item.expiry,
            status: status,
            unit: form.unit || item.unit,
            supplier: form.supplier || '',
            description: form.description || ''
          }
        }
        return item
      })
      localStorage.setItem('pharma_inventory', JSON.stringify(updatedList))

      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Medicine Updated',
          message: `${medName} details have been updated successfully.`
        })
      }
    } else {
      const newMedicine = {
        id: Date.now(),
        name: medName,
        category: form.category || 'Other',
        qty: qtyNum,
        price: parseFloat(form.price || 0).toFixed(2),
        expiry: form.expiry || today,
        status: status,
        unit: form.unit || 'Tablet',
        supplier: form.supplier || '',
        description: form.description || ''
      }
      localStorage.setItem('pharma_inventory', JSON.stringify([newMedicine, ...currentList]))

      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Medicine Added',
          message: `${medName} has been added to inventory.`
        })
        if (status === 'Low') {
          addNotification({
            type: 'warning',
            title: 'Low Stock Alert',
            message: `${medName} was added with low stock quantity (${qtyNum} units).`
          })
        } else if (status === 'Expired') {
          addNotification({
            type: 'danger',
            title: 'Expired Medicine Added',
            message: `${medName} was added with an expired date or zero quantity.`
          })
        }
      }
    }

    navigate('/dashboard/inventory')
  }

  return (
    <div style={{ maxWidth: 620 }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
        <Link to="/dashboard/inventory" style={{ color: '#1565C0', cursor: 'pointer', textDecoration: 'none' }}>
          Inventory
        </Link>
        <span style={{ color: '#718096', margin: '0 6px' }}>/</span>
        <span style={{ color: '#718096' }}>{isEdit ? 'Edit Medicine' : 'Add Medicine'}</span>
      </nav>
      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <Card.Header style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0', padding: '1rem 1.25rem' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: 12, background: '#EFF6FF', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEdit ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1A202C', fontSize: '0.9rem' }}>
                {isEdit ? 'Edit Medicine' : 'New Medicine'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                {isEdit ? 'Update details for this medicine' : 'Fill in the medicine details below'}
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Medicine Name *</Form.Label>
              <Form.Control value={form.name} onChange={set('name')} placeholder="e.g. Paracetamol 500mg" style={{ borderRadius: 10, fontSize: '0.875rem' }} />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Category *</Form.Label>
                <Form.Select value={form.category} onChange={set('category')} style={{ borderRadius: 10, fontSize: '0.875rem' }}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Unit Type</Form.Label>
                <Form.Select value={form.unit} onChange={set('unit')} style={{ borderRadius: 10, fontSize: '0.875rem' }}>
                  {['Tablet', 'Capsule', 'Syrup (ml)', 'Injection (vial)', 'Cream (g)', 'Drops'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Quantity in Stock *</Form.Label>
                <Form.Control type="number" min="0" value={form.quantity} onChange={set('quantity')} placeholder="0" style={{ borderRadius: 10, fontSize: '0.875rem' }} />
              </Col>
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Min Stock Alert</Form.Label>
                <Form.Control type="number" min="0" value={form.minStock} onChange={set('minStock')} placeholder="20" style={{ borderRadius: 10, fontSize: '0.875rem' }} />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Unit Price (EGP) *</Form.Label>
                <Form.Control type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" style={{ borderRadius: 10, fontSize: '0.875rem' }} />
              </Col>
              <Col xs={6}>
                <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Expiry Date *</Form.Label>
                <Form.Control type="date" value={form.expiry} onChange={set('expiry')} style={{ borderRadius: 10, fontSize: '0.875rem' }} />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Supplier Name</Form.Label>
              <Form.Control value={form.supplier} onChange={set('supplier')} placeholder="e.g. EgyPharma Distribution" style={{ borderRadius: 10, fontSize: '0.875rem' }} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.description} onChange={set('description')} placeholder="Any additional notes..." style={{ borderRadius: 10, fontSize: '0.875rem', resize: 'none' }} />
            </Form.Group>

            <div className="d-flex gap-3">
              <Button type="button" variant="outline-secondary" className="flex-fill" style={{ borderRadius: 10 }} onClick={() => navigate('/dashboard/inventory')}>
                Cancel
              </Button>
              <Button type="button" variant="primary" className="flex-fill" style={{ borderRadius: 10 }} onClick={handleSave}>
                {isEdit ? 'Update Medicine' : 'Save Medicine'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}