import { useState, useEffect } from 'react'
import { Card, Button, Form, Modal, Pagination, Row, Col } from 'react-bootstrap'
import { Eye, Check, Trash2, Search } from 'lucide-react'
import { useNotifications } from '@/context/NotificationsContext'

const initialOrders = [
  { id: 'ORD-001', medicine: 'Paracetamol 500mg', supplier: 'EgyPharma', qty: 500, total: '2,500', date: '2025-06-28', status: 'Completed' },
  { id: 'ORD-002', medicine: 'Amoxicillin 250mg', supplier: 'MedCo', qty: 200, total: '2,900', date: '2025-06-26', status: 'Pending' },
  { id: 'ORD-003', medicine: 'Vitamin C 1000mg', supplier: 'NutriPharma', qty: 1000, total: '1,800', date: '2025-06-25', status: 'Processing' },
  { id: 'ORD-004', medicine: 'Ibuprofen 400mg', supplier: 'EgyPharma', qty: 400, total: '2,400', date: '2025-06-24', status: 'Completed' },
  { id: 'ORD-005', medicine: 'Omeprazole 20mg', supplier: 'MedCo', qty: 150, total: '1,800', date: '2025-06-22', status: 'Cancelled' },
  { id: 'ORD-006', medicine: 'Metformin 500mg', supplier: 'EgyPharma', qty: 300, total: '1,050', date: '2025-06-20', status: 'Completed' },
  { id: 'ORD-007', medicine: 'Atorvastatin 10mg', supplier: 'NovoPharma', qty: 100, total: '2,200', date: '2025-06-18', status: 'Processing' },
  { id: 'ORD-008', medicine: 'Cetirizine 10mg', supplier: 'AllerMed', qty: 800, total: '2,000', date: '2025-06-16', status: 'Completed' },
  { id: 'ORD-009', medicine: 'Azithromycin 500mg', supplier: 'MedCo', qty: 50, total: '1,750', date: '2025-06-14', status: 'Pending' },
  { id: 'ORD-010', medicine: 'Losartan 50mg', supplier: 'CardioPharma', qty: 200, total: '3,600', date: '2025-06-12', status: 'Completed' },
]

const PAGE_SIZE = 5

const statusBadge = {
  Completed: 'badge-success',
  Pending: 'badge-warning',
  Processing: 'badge-info',
  Cancelled: 'badge-danger',
}

const suppliers = ['EgyPharma', 'MedCo', 'NutriPharma', 'NovoPharma', 'AllerMed', 'CardioPharma']

export default function Orders() {
  const { addNotification } = useNotifications()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrder, setNew] = useState({ medicine: '', supplier: '', qty: '', price: '' })

  useEffect(() => {
    const saved = localStorage.getItem('pharma_orders')
    if (saved) {
      setOrders(JSON.parse(saved))
    } else {
      setOrders(initialOrders)
      localStorage.setItem('pharma_orders', JSON.stringify(initialOrders))
    }
  }, [])

  const updateOrdersList = (newList) => {
    setOrders(newList)
    localStorage.setItem('pharma_orders', JSON.stringify(newList))
  }

  const handlePlaceOrder = () => {
    const qtyNum = Number(newOrder.qty) || 1
    const priceNum = Number(newOrder.price) || 0
    const totalCalc = (qtyNum * priceNum).toLocaleString('en-US')

    const nextIdNum = orders.length + 1
    const orderId = 'ORD-' + String(nextIdNum).padStart(3, '0')
    const medName = newOrder.medicine || 'Unnamed Medicine'
    const suppName = newOrder.supplier || 'EgyPharma'

    const orderObj = {
      id: orderId,
      medicine: medName,
      supplier: suppName,
      qty: qtyNum,
      total: totalCalc,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }

    const updated = [orderObj, ...orders]
    updateOrdersList(updated)
    
    if (addNotification) {
      addNotification({
        type: 'info',
        title: 'New Order Placed',
        message: `Purchase order ${orderId} for ${medName} has been placed with ${suppName}.`,
      })
    }

    setNew({ medicine: '', supplier: '', qty: '', price: '' })
    setModal(false)
  }

  const handleApprove = (id) => {
    const targetOrder = orders.find((o) => o.id === id)
    const updated = orders.map((o) => (o.id === id ? { ...o, status: 'Completed' } : o))
    updateOrdersList(updated)
    if (addNotification && targetOrder) {
      addNotification({
        type: 'success',
        title: 'Order Completed',
        message: `Order ${targetOrder.id} for ${targetOrder.medicine} has been completed and added to inventory.`,
      })
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updated = orders.filter((o) => o.id !== id)
      updateOrdersList(updated)
    }
  }

  const filtered = orders.filter((o) => {
    const ms = o.medicine.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'All' || o.status === filter
    return ms && mf
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pg = Math.min(page, totalPages)
  const rows = filtered.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE)
  const goPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

  const stats = [
    { label: 'Total', val: orders.length, color: '#1565C0', bg: '#EFF6FF' },
    { label: 'Completed', val: orders.filter((o) => o.status === 'Completed').length, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Processing', val: orders.filter((o) => o.status === 'Processing').length, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Pending', val: orders.filter((o) => o.status === 'Pending').length, color: '#D97706', bg: '#FEF3C7' },
  ]

  return (
    <div>
      {/* Stats Cards */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {stats.map((s) => (
          <div key={s.label} className="kpi-card d-flex align-items-center gap-3" style={{ flex: '1 1 140px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800 }}>
              {s.val}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#4A5568', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center gap-2 p-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div className="position-relative" style={{ maxWidth: 220, flex: '1 1 160px' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#718096' }} size={14} />
            <Form.Control size="sm" placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} style={{ paddingLeft: 30, borderRadius: 10, fontSize: '0.8rem' }} />
          </div>
          <div className="d-flex gap-1 flex-wrap">
            {['All', 'Completed', 'Processing', 'Pending', 'Cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className="btn btn-sm"
                style={{ borderRadius: 8, fontSize: '0.75rem', background: filter === f ? '#1565C0' : '#F8FAFC', color: filter === f ? '#fff' : '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" className="ms-auto" style={{ borderRadius: 10, fontSize: '0.8rem' }} onClick={() => setModal(true)}>
            + New Order
          </Button>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {['Order ID', 'Medicine', 'Supplier', 'Qty', 'Total (EGP)', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5" style={{ color: '#718096', fontSize: '0.875rem' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id}>
                    <td style={{ color: '#1565C0', fontWeight: 600 }}>{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{o.medicine}</td>
                    <td style={{ color: '#718096' }}>{o.supplier}</td>
                    <td style={{ color: '#718096' }}>{o.qty}</td>
                    <td style={{ fontWeight: 600 }}>{o.total} EGP</td>
                    <td style={{ color: '#718096' }}>{o.date}</td>
                    <td>
                      <span className={'badge ' + statusBadge[o.status]} style={{ fontSize: '0.7rem' }}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm"
                          style={{ padding: '4px 8px', borderRadius: 8, background: '#EFF6FF', color: '#1565C0', border: 'none', cursor: 'pointer' }}
                          title="View Details"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <Eye size={14} />
                        </button>

                        {o.status === 'Pending' && (
                          <button
                            className="btn btn-sm"
                            style={{ padding: '4px 8px', borderRadius: 8, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer' }}
                            title="Approve Order"
                            onClick={() => handleApprove(o.id)}
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          className="btn btn-sm"
                          style={{ padding: '4px 8px', borderRadius: 8, background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}
                          title="Delete Order"
                          onClick={() => handleDelete(o.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderTop: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            Showing {rows.length ? (pg - 1) * PAGE_SIZE + 1 : 0}–{Math.min(pg * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev onClick={() => goPage(pg - 1)} disabled={pg === 1} style={{ cursor: 'pointer' }} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item key={p} active={p === pg} onClick={() => goPage(p)} style={{ cursor: 'pointer' }}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => goPage(pg + 1)} disabled={pg === totalPages} style={{ cursor: 'pointer' }} />
          </Pagination>
        </div>
      </Card>

      {/* New Order Modal */}
      <Modal show={showModal} onHide={() => setModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>New Purchase Order</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Medicine Name</Form.Label>
              <Form.Control 
                placeholder="e.g. Paracetamol 500mg" 
                value={newOrder.medicine} 
                onChange={(e) => setNew((prev) => ({ ...prev, medicine: e.target.value }))}
                style={{ borderRadius: 10, fontSize: '0.875rem' }}/>
            </Col>
            <Col xs={12}>
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Supplier</Form.Label>
              <Form.Select 
                value={newOrder.supplier}
                onChange={(e) => setNew((prev) => ({ ...prev, supplier: e.target.value }))}
                style={{ borderRadius: 10, fontSize: '0.875rem' }}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6}>
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder="0"
                value={newOrder.qty}
                onChange={(e) => setNew((prev) => ({ ...prev, qty: e.target.value }))}
                style={{ borderRadius: 10, fontSize: '0.875rem' }}
              />
            </Col>
            <Col xs={6}>
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A5568' }}>Unit Price (EGP)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newOrder.price}
                onChange={(e) => setNew((prev) => ({ ...prev, price: e.target.value }))}
                style={{ borderRadius: 10, fontSize: '0.875rem' }}
              />
            </Col>
          </Row>

          <div className="mt-3 p-3" style={{ background: '#EFF6FF', borderRadius: 10 }}>
            <span style={{ fontSize: '0.8rem', color: '#1565C0', fontWeight: 600 }}>
              Total: {((Number(newOrder.qty) || 0) * (Number(newOrder.price) || 0)).toLocaleString()} EGP
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #E2E8F0' }}>
          <Button variant="outline-secondary" style={{ borderRadius: 10 }} onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" style={{ borderRadius: 10 }} onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Order Details Modal */}
      <Modal show={Boolean(selectedOrder)} onHide={() => setSelectedOrder(null)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>Order Details - {selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {selectedOrder && (
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.875rem' }}>
              <div><strong>Medicine:</strong> {selectedOrder.medicine}</div>
              <div><strong>Supplier:</strong> {selectedOrder.supplier}</div>
              <div><strong>Quantity:</strong> {selectedOrder.qty}</div>
              <div><strong>Total Price:</strong> {selectedOrder.total} EGP</div>
              <div><strong>Date:</strong> {selectedOrder.date}</div>
              <div>
                <strong>Status: </strong>
                <span className={'badge ' + statusBadge[selectedOrder.status]}>{selectedOrder.status}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #E2E8F0' }}>
          <Button variant="secondary" size="sm" style={{ borderRadius: 10 }} onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}