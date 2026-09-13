import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, Form, Pagination, Spinner } from "react-bootstrap";
import { useNotifications } from "@/context/NotificationsContext";

const API_URL = "https://pharmteck.up.railway.app/api";

const PAGE_SIZE = 5;

const statusBadge = {
  Active: "badge-success",
  Low: "badge-warning",
  Expired: "badge-danger",
};

const getMedicineStatus = (medicine) => {
  const today = new Date();
  const expiryDate = new Date(medicine.expiryDate);

  if (expiryDate < today) {
    return "Expired";
  }

  if (medicine.stockQuantity < 20) {
    return "Low";
  }

  return "Active";
};

const formatMedicine = (medicine) => ({
  id: medicine._id,
  name: medicine.medicineCatalog?.name || "Unknown Medicine",
  category: medicine.medicineCatalog?.category || "N/A",
  qty: medicine.stockQuantity,
  price: Number(medicine.price ?? 0).toFixed(2),
  expiry: medicine.expiryDate?.split("T")[0] || "N/A",
  status: getMedicineStatus(medicine),
});

export default function Inventory() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/medicines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load medicines.");
        }

        const formattedMedicines = (data.medicines || []).map(formatMedicine);

        setMedicines(formattedMedicines);
      } catch (error) {
        setError(error.message || "Unable to load medicines.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    const med = medicines.find((m) => m.id === id);

    if (!window.confirm("Are you sure you want to delete this medicine?")) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        throw new Error(data.message || "Failed to delete medicine.");
      }

      setMedicines((prev) => prev.filter((m) => m.id !== id));

      if (addNotification) {
        addNotification({
          type: "danger",
          title: "Medicine Deleted",
          message: `${med?.name || "Medicine"} has been removed from inventory.`,
        });
      }
    } catch (error) {
      setError(error.message || "Unable to delete medicine.");
    }
  };

  const filtered = medicines.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || m.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goPage = (p) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const summary = [
    {
      label: "Total",
      val: medicines.length,
      color: "#1565C0",
      bg: "#EFF6FF",
    },
    {
      label: "Active",
      val: medicines.filter((m) => m.status === "Active").length,
      color: "#16A34A",
      bg: "#DCFCE7",
    },
    {
      label: "Low",
      val: medicines.filter((m) => m.status === "Low").length,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "Expired",
      val: medicines.filter((m) => m.status === "Expired").length,
      color: "#EF4444",
      bg: "#FFF1F2",
    },
  ];

  return (
    <div>
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {summary.map((s) => (
          <div
            key={s.label}
            className="kpi-card d-flex align-items-center gap-3 p-3 bg-white shadow-sm"
            style={{
              flex: "1 1 140px",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              {s.val}
            </div>

            <span
              style={{
                fontSize: "0.8rem",
                color: "#4A5568",
                fontWeight: 500,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div
          className="d-flex flex-wrap align-items-center gap-2 p-3"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <div
            className="position-relative"
            style={{ maxWidth: 220, flex: "1 1 160px" }}
          >
            <svg
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#718096",
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <Form.Control
              size="sm"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                paddingLeft: 30,
                borderRadius: 10,
                fontSize: "0.8rem",
              }}
            />
          </div>

          <div className="d-flex gap-1 flex-wrap">
            {["All", "Active", "Low", "Expired"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className="btn btn-sm"
                style={{
                  borderRadius: 8,
                  fontSize: "0.75rem",
                  background: filter === f ? "#1565C0" : "#F8FAFC",
                  color: filter === f ? "#fff" : "#4A5568",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <Link
            to="/dashboard/inventory/add"
            className="btn btn-primary btn-sm ms-auto"
            style={{
              borderRadius: 10,
              fontSize: "0.8rem",
            }}
          >
            + Add Medicine
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {[
                  "Medicine Name",
                  "Category",
                  "Qty",
                  "Unit Price (EGP)",
                  "Expiry Date",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <Spinner size="sm" className="me-2" />
                    Loading medicines...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-5"
                    style={{
                      color: "#dc3545",
                      fontSize: "0.875rem",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-5"
                    style={{
                      color: "#718096",
                      fontSize: "0.875rem",
                    }}
                  >
                    No medicines found.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m.id || m.name}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>

                    <td style={{ color: "#718096" }}>{m.category}</td>

                    <td
                      style={{
                        fontWeight: 600,
                        color: m.qty < 20 ? "#EF4444" : "#1A202C",
                      }}
                    >
                      {m.qty}
                    </td>

                    <td style={{ color: "#718096" }}>{m.price} EGP</td>

                    <td style={{ color: "#718096" }}>{m.expiry}</td>

                    <td>
                      <span
                        className={`badge ${
                          statusBadge[m.status] || "badge-secondary"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {m.status}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/inventory/edit/${m.id}`)
                          }
                          className="btn btn-sm"
                          style={{
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: "#EFF6FF",
                            color: "#1565C0",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Edit"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn btn-sm"
                          style={{
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: "#FFF1F2",
                            color: "#EF4444",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Delete"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
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

        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ borderTop: "1px solid #E2E8F0" }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#718096",
            }}
          >
            Showing {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>

          <Pagination size="sm" className="mb-0">
            <Pagination.Prev
              onClick={() => goPage(page - 1)}
              disabled={page === 1}
              style={{ cursor: "pointer" }}
            />

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item
                key={p}
                active={p === page}
                onClick={() => goPage(p)}
                style={{ cursor: "pointer" }}
              >
                {p}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => goPage(page + 1)}
              disabled={page === totalPages}
              style={{ cursor: "pointer" }}
            />
          </Pagination>
        </div>
      </Card>
    </div>
  );
}
