import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Row, Col, Card, Spinner } from "react-bootstrap";

const API_URL = "https://pharmteck.up.railway.app/api";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMedicineStatus = (medicine) => {
  const today = new Date();
  const expiryDate = new Date(medicine.expiryDate);

  if (expiryDate < today) {
    return "Expired";
  }

  if (medicine.stockQuantity < 20) {
    return "Low Stock";
  }

  return "Healthy";
};

const formatOrder = (order) => {
  const firstItem = order.items?.[0];

  let status = "Pending";

  if (order.status === "received") {
    status = "Received";
  } else if (order.status === "cancelled") {
    status = "Cancelled";
  }

  return {
    id: order._id,
    medicine: firstItem?.medicineName || "Unknown Medicine",
    qty: firstItem?.quantity || 0,
    total: "N/A",
    status,
  };
};

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [medicinesResponse, ordersResponse, transactionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/medicines`, {
            headers,
          }),

          fetch(`${API_URL}/orders`, {
            headers,
          }),

          fetch(`${API_URL}/dispensing-transactions`, {
            headers,
          }),
        ]);

      const medicinesData = await medicinesResponse.json();
      const ordersData = await ordersResponse.json();
      const transactionsData = await transactionsResponse.json();

      if (!medicinesResponse.ok) {
        throw new Error(medicinesData.message || "Failed to load inventory.");
      }

      if (!ordersResponse.ok) {
        throw new Error(ordersData.message || "Failed to load orders.");
      }

      if (!transactionsResponse.ok) {
        throw new Error(
          transactionsData.message || "Failed to load dispensing transactions.",
        );
      }

      setMedicines(medicinesData.medicines || []);

      setOrders(
        Array.isArray(ordersData) ? ordersData : ordersData.orders || [],
      );

      setTransactions(
        Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData.transactions || [],
      );
    } catch (error) {
      setError(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentYear = new Date().getFullYear();

  const currentYearTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.createdAt) {
        return false;
      }

      return new Date(transaction.createdAt).getFullYear() === currentYear;
    });
  }, [transactions, currentYear]);

  const totalRevenue = useMemo(() => {
    return currentYearTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.totalPrice || 0),
      0,
    );
  }, [currentYearTransactions]);

  const totalOrders = orders.length;

  const totalMedicines = medicines.length;

  const lowStockCount = medicines.filter((medicine) => {
    return medicine.stockQuantity < 20;
  }).length;

  const stockStats = useMemo(() => {
    let healthy = 0;
    let lowStock = 0;
    let expired = 0;

    medicines.forEach((medicine) => {
      const status = getMedicineStatus(medicine);

      if (status === "Healthy") {
        healthy++;
      } else if (status === "Low Stock") {
        lowStock++;
      } else if (status === "Expired") {
        expired++;
      }
    });

    const total = medicines.length;

    return {
      healthy,
      lowStock,
      expired,
      healthyPct: total ? Math.round((healthy / total) * 100) : 0,
      lowStockPct: total ? Math.round((lowStock / total) * 100) : 0,
      expiredPct: total ? Math.round((expired / total) * 100) : 0,
    };
  }, [medicines]);

  const monthlyRevenue = useMemo(() => {
    const data = Array(12).fill(0);

    currentYearTransactions.forEach((transaction) => {
      if (!transaction.createdAt) {
        return;
      }

      const month = new Date(transaction.createdAt).getMonth();

      data[month] += Number(transaction.totalPrice || 0);
    });

    return data;
  }, [currentYearTransactions]);

  const maxRevenue = Math.max(...monthlyRevenue, 1);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        return (
          new Date(b.createdAt || b.orderDate) -
          new Date(a.createdAt || a.orderDate)
        );
      })
      .slice(0, 5)
      .map(formatOrder);
  }, [orders]);

  const kpis = [
    {
      label: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} EGP`,
      change: "Live",
      up: true,
      color: "#1565C0",
      bg: "#EFF6FF",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "Live",
      up: true,
      color: "#00ACC1",
      bg: "#ECFEFF",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
        </svg>
      ),
    },
    {
      label: "Medicines",
      value: totalMedicines.toLocaleString(),
      change: "Live",
      up: true,
      color: "#7C3AED",
      bg: "#F5F3FF",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    },
    {
      label: "Low Stock",
      value: lowStockCount.toLocaleString(),
      change: "Live",
      up: false,
      color: "#EF4444",
      bg: "#FFF1F2",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" />
        <div
          style={{
            marginTop: 12,
            color: "#718096",
            fontSize: "0.85rem",
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          className="alert alert-danger"
          style={{
            borderRadius: 10,
            fontSize: "0.8rem",
          }}
        >
          {error}
        </div>
      )}

      <Row className="g-3 mb-4">
        {kpis.map((k) => (
          <Col key={k.label} xs={6} xl={3}>
            <div
              className="kpi-card shadow-sm p-3 bg-white"
              style={{ borderRadius: 16 }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: k.bg,
                    color: k.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {k.icon}
                </div>

                <span
                  className="badge"
                  style={{
                    background: k.up ? "#DCFCE7" : "#FFF1F2",
                    color: k.up ? "#16A34A" : "#EF4444",
                    fontSize: "0.7rem",
                  }}
                >
                  {k.change}
                </span>
              </div>

              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#1A202C",
                }}
              >
                {k.value}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#718096",
                  marginTop: 2,
                }}
              >
                {k.label}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        <Col xl={8}>
          <Card
            className="border-0 shadow-sm h-100"
            style={{ borderRadius: 16 }}
          >
            <Card.Body style={{ padding: "1.25rem" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#1A202C",
                    }}
                  >
                    Monthly Revenue
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#718096",
                    }}
                  >
                    EGP — {currentYear}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#16A34A",
                    fontWeight: 600,
                  }}
                >
                  Live Data
                </span>
              </div>

              <div
                className="d-flex align-items-end gap-1"
                style={{ height: 150 }}
              >
                {monthlyRevenue.map((value, index) => (
                  <div
                    key={index}
                    className="d-flex flex-column align-items-center gap-1"
                    style={{ flex: 1 }}
                  >
                    <div
                      className="chart-bar w-100"
                      title={`${value.toLocaleString()} EGP`}
                      style={{
                        height: `${Math.max((value / maxRevenue) * 130, 5)}px`,
                        background:
                          value > 0
                            ? "linear-gradient(180deg, #1565C0 0%, #00ACC1 100%)"
                            : "#BFDBFE",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.4s ease",
                      }}
                    />

                    <span
                      style={{
                        fontSize: "0.55rem",
                        color: "#718096",
                      }}
                    >
                      {months[index]}
                    </span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card
            className="border-0 shadow-sm h-100"
            style={{ borderRadius: 16 }}
          >
            <Card.Body style={{ padding: "1.25rem" }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#1A202C",
                }}
              >
                Stock Status
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#718096",
                  marginBottom: "1rem",
                }}
              >
                Inventory overview
              </div>

              <div className="d-flex justify-content-center mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="16"
                  />

                  {stockStats.healthyPct > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#1565C0"
                      strokeWidth="16"
                      strokeDasharray={`${(
                        (stockStats.healthyPct / 100) *
                        301.6
                      ).toFixed(2)} 301.6`}
                      strokeDashoffset="75.4"
                      strokeLinecap="round"
                    />
                  )}

                  {stockStats.lowStockPct > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="16"
                      strokeDasharray={`${(
                        (stockStats.lowStockPct / 100) *
                        301.6
                      ).toFixed(2)} 301.6`}
                      strokeDashoffset={`${(
                        -((stockStats.healthyPct / 100) * 301.6) + 75.4
                      ).toFixed(2)}`}
                      strokeLinecap="round"
                    />
                  )}

                  {stockStats.expiredPct > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="16"
                      strokeDasharray={`${(
                        (stockStats.expiredPct / 100) *
                        301.6
                      ).toFixed(2)} 301.6`}
                      strokeDashoffset={`${(
                        -(
                          ((stockStats.healthyPct + stockStats.lowStockPct) /
                            100) *
                          301.6
                        ) + 75.4
                      ).toFixed(2)}`}
                      strokeLinecap="round"
                    />
                  )}

                  <text
                    x="60"
                    y="56"
                    textAnchor="middle"
                    fill="#1A202C"
                    fontSize="18"
                    fontWeight="700"
                  >
                    {stockStats.healthyPct}%
                  </text>

                  <text
                    x="60"
                    y="70"
                    textAnchor="middle"
                    fill="#718096"
                    fontSize="9"
                  >
                    Healthy
                  </text>
                </svg>
              </div>

              {[
                {
                  label: "Healthy",
                  count: stockStats.healthy,
                  pct: stockStats.healthyPct,
                  color: "#1565C0",
                },
                {
                  label: "Low Stock",
                  count: stockStats.lowStock,
                  pct: stockStats.lowStockPct,
                  color: "#F59E0B",
                },
                {
                  label: "Expired",
                  count: stockStats.expired,
                  pct: stockStats.expiredPct,
                  color: "#EF4444",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="d-flex align-items-center justify-content-between mb-1"
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: s.color,
                      }}
                    />

                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#4A5568",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.75rem" }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#1A202C",
                      }}
                    >
                      {s.count}
                    </span>

                    <span
                      style={{
                        color: "#718096",
                        marginLeft: 6,
                      }}
                    >
                      {s.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <Card.Header
          className="bg-white d-flex align-items-center justify-content-between"
          style={{
            borderRadius: "16px 16px 0 0",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "#1A202C",
            }}
          >
            Recent Orders
          </span>

          <Link
            to="/dashboard/orders"
            style={{
              fontSize: "0.8rem",
              color: "#1565C0",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            View All →
          </Link>
        </Card.Header>

        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {["Order ID", "Medicine", "Quantity", "Total", "Status"].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center"
                    style={{
                      padding: "2rem",
                      color: "#718096",
                      fontSize: "0.8rem",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td
                      style={{
                        color: "#1565C0",
                        fontWeight: 600,
                      }}
                    >
                      {o.id}
                    </td>

                    <td style={{ fontWeight: 500 }}>{o.medicine}</td>

                    <td style={{ color: "#718096" }}>{o.qty}</td>

                    <td style={{ fontWeight: 600 }}>{o.total}</td>

                    <td>
                      <span
                        className={`badge ${
                          o.status === "Received"
                            ? "badge-success"
                            : o.status === "Pending"
                              ? "badge-warning"
                              : o.status === "Cancelled"
                                ? "badge-danger"
                                : "badge-info"
                        }`}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.3em 0.7em",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
