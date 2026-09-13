import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, Form, Pagination } from 'react-bootstrap'
import { useNotifications } from '@/context/NotificationsContext'

const initialMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', qty: 450, price: '5.00', expiry: '2026-06-15', status: 'Active' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', qty: 120, price: '14.50', expiry: '2025-12-01', status: 'Active' },
  { id: 3, name: 'Vitamin C 1000mg', category: 'Supplement', qty: 22, price: '1.80', expiry: '2026-03-20', status: 'Low' },
  { id: 4, name: 'Ibuprofen 400mg', category: 'Analgesic', qty: 310, price: '6.00', expiry: '2025-10-15', status: 'Active' },
  { id: 5, name: 'Omeprazole 20mg', category: 'GI', qty: 8, price: '12.00', expiry: '2025-08-30', status: 'Low' },
  { id: 6, name: 'Metformin 500mg', category: 'Antidiabetic', qty: 0, price: '3.50', expiry: '2024-11-01', status: 'Expired' },
  { id: 7, name: 'Atorvastatin 10mg', category: 'Lipid-lowering', qty: 200, price: '22.00', expiry: '2026-09-10', status: 'Active' },
  { id: 8, name: 'Losartan 50mg', category: 'Antihypertensive', qty: 15, price: '18.00', expiry: '2025-11-20', status: 'Low' },
  { id: 9, name: 'Cetirizine 10mg', category: 'Antihistamine', qty: 500, price: '2.50', expiry: '2027-01-01', status: 'Active' },
  { id: 10, name: 'Azithromycin 500mg', category: 'Antibiotic', qty: 0, price: '35.00', expiry: '2024-09-15', status: 'Expired' },
  { id: 11, name: 'Metronidazole 400mg', category: 'Antibiotic', qty: 85, price: '8.00', expiry: '2026-05-20', status: 'Active' },
  { id: 12, name: 'Chlorphenamine 4mg', category: 'Antihistamine', qty: 18, price: '3.00', expiry: '2025-09-01', status: 'Low' },
]

const PAGE_SIZE = 5

const statusBadge = {
  Active: 'badge-success',
  Low: 'badge-warning',
  Expired: 'badge-danger',
}

export default function Inventory() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('pharma_inventory')
    return saved ? JSON.parse(saved) : initialMedicines
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [currentPage, setPage] = useState(1)

  useEffect(() => {
    localStorage.setItem('pharma_inventory', JSON.stringify(medicines))
  }, [medicines])

  const handleDelete = (id) => {
  const med = medicines.find((m) => m.id === id)
  if (window.confirm('Are you sure you want to delete this medicine?')) {
    const updated = medicines.filter((m) => m.id !== id)
    setMedicines(updated)

    if (addNotification) {
      addNotification({
        type: 'danger',
        title: 'Medicine Deleted',
        message: `${med?.name || 'Medicine'} has been removed from inventory.`
      })
    }
  }
}

  const filtered = medicines.filter((m) => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'All' || m.status === filter
    return ms && mf
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)))
  const summary = [
    { label: 'Total', val: medicines.length, color: '#1565C0', bg: '#EFF6FF' },
    { label: 'Active', val: medicines.filter((m) => m.status === 'Active').length, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Low', val: medicines.filter((m) => m.status === 'Low').length, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Expired', val: medicines.filter((m) => m.status === 'Expired').length, color: '#EF4444', bg: '#FFF1F2' },
  ]

  return (
    <div>
      {/* Dynamic Summary Cards */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {summary.map((s) => (
          <div key={s.label} className="kpi-card d-flex align-items-center gap-3 p-3 bg-white shadow-sm" style={{ flex: '1 1 140px', borderRadius: 12 }}>
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
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#718096' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Form.Control
              size="sm"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ paddingLeft: 30, borderRadius: 10, fontSize: '0.8rem' }}
            />
          </div>
          <div className="d-flex gap-1 flex-wrap">
            {['All', 'Active', 'Low', 'Expired'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f)
                  setPage(1)
                }}
                className="btn btn-sm"
                style={{
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  background: filter === f ? '#1565C0' : '#F8FAFC',
                  color: filter === f ? '#fff' : '#4A5568',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <Link to="/dashboard/inventory/add" className="btn btn-primary btn-sm ms-auto" style={{ borderRadius: 10, fontSize: '0.8rem' }}>
            + Add Medicine
          </Link>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {['Medicine Name', 'Category', 'Qty', 'Unit Price (EGP)', 'Expiry Date', 'Status', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5" style={{ color: '#718096', fontSize: '0.875rem' }}>
                    No medicines found.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m.id || m.name}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ color: '#718096' }}>{m.category}</td>
                    <td style={{ fontWeight: 600, color: m.qty < 20 ? '#EF4444' : '#1A202C' }}>{m.qty}</td>
                    <td style={{ color: '#718096' }}>{m.price} EGP</td>
                    <td style={{ color: '#718096' }}>{m.expiry}</td>
                    <td>
                      <span className={`badge ${statusBadge[m.status] || 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/inventory/edit/${m.id}`)}
                          className="btn btn-sm"
                          style={{ padding: '3px 8px', borderRadius: 8, background: '#EFF6FF', color: '#1565C0', border: 'none', cursor: 'pointer' }}
                          title="Edit"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn btn-sm"
                          style={{ padding: '3px 8px', borderRadius: 8, background: '#FFF1F2', color: '#EF4444', border: 'none', cursor: 'pointer' }}
                          title="Delete"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
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
            Showing {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev onClick={() => goPage(page - 1)} disabled={page === 1} style={{ cursor: 'pointer' }} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item key={p} active={p === page} onClick={() => goPage(p)} style={{ cursor: 'pointer' }}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => goPage(page + 1)} disabled={page === totalPages} style={{ cursor: 'pointer' }} />
          </Pagination>
        </div>
      </Card>
    </div>
  )
}