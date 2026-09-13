import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Modal,
  Pagination,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { Eye, Check, Search } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

const API_URL = "https://pharmteck.up.railway.app/api";

const PAGE_SIZE = 5;

const statusBadge = {
  Pending: "badge-warning",
  Received: "badge-success",
  Cancelled: "badge-danger",
};

const suppliers = [
  "EgyPharma",
  "MedCo",
  "NutriPharma",
  "NovoPharma",
  "AllerMed",
  "CardioPharma",
  "Pharco Distribution",
];

const formatOrder = (order) => {
  const item = order.items?.[0];

  return {
    id: order._id,
    medicine: item?.medicineName || "Unknown Medicine",
    barcode: item?.barcode || "N/A",
    supplier: order.supplier || "N/A",
    qty: item?.quantity || 0,
    total: order.total ?? "N/A",
    date: order.createdAt
      ? new Date(order.createdAt).toISOString().split("T")[0]
      : "N/A",
    status:
      order.status === "received"
        ? "Received"
        : order.status === "cancelled"
          ? "Cancelled"
          : "Pending",
    raw: order,
  };
};

export default function Orders() {
  const { addNotification } = useNotifications();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [newOrder, setNew] = useState({
    medicine: "",
    barcode: "",
    supplier: "",
    qty: "",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      const ordersData = Array.isArray(data) ? data : data.orders || [];

      setOrders(ordersData.map(formatOrder));
    } catch (error) {
      setError(error.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePlaceOrder = async () => {
    const medicineName = newOrder.medicine.trim();
    const barcode = newOrder.barcode.trim();
    const supplier = newOrder.supplier.trim();
    const quantity = Number(newOrder.qty);

    if (!medicineName || !barcode || !supplier || !quantity) {
      setError("Please fill in all order fields.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier,
          items: [
            {
              medicineName,
              barcode,
              quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order.");
      }

      const createdOrder = data.order || data;

      setOrders((prev) => [formatOrder(createdOrder), ...prev]);

      if (addNotification) {
        addNotification({
          type: "info",
          title: "New Order Placed",
          message: `Purchase order for ${medicineName} has been placed with ${supplier}.`,
        });
      }

      setNew({
        medicine: "",
        barcode: "",
        supplier: "",
        qty: "",
      });

      setModal(false);
    } catch (error) {
      setError(error.message || "Unable to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    const targetOrder = orders.find((o) => o.id === id);

    if (!targetOrder) {
      return;
    }

    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "received",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      const updatedOrder = data.order || data;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? formatOrder(updatedOrder) : order,
        ),
      );

      if (addNotification) {
        addNotification({
          type: "success",
          title: "Order Received",
          message: `Order for ${targetOrder.medicine} has been received and added to inventory.`,
        });
      }
    } catch (error) {
      setError(error.message || "Unable to update order status.");
    }
  };

  const handleCancel = async (id) => {
    const targetOrder = orders.find((o) => o.id === id);

    if (!targetOrder) {
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order.");
      }

      const updatedOrder = data.order || data;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? formatOrder(updatedOrder) : order,
        ),
      );

      if (addNotification) {
        addNotification({
          type: "danger",
          title: "Order Cancelled",
          message: `Order for ${targetOrder.medicine} has been cancelled.`,
        });
      }
    } catch (error) {
      setError(error.message || "Unable to cancel order.");
    }
  };

  const handleViewOrder = async (order) => {
    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load order details.");
      }

      const orderData = data.order || data;

      setSelectedOrder(formatOrder(orderData));
    } catch (error) {
      setError(error.message || "Unable to load order details.");
    }
  };

  const filtered = orders.filter((o) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      o.medicine.toLowerCase().includes(searchValue) ||
      o.id.toLowerCase().includes(searchValue) ||
      o.barcode.toLowerCase().includes(searchValue);

    const matchesFilter = filter === "All" || o.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pg = Math.min(page, totalPages);

  const rows = filtered.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);

  const goPage = (p) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const stats = [
    {
      label: "Total",
      val: orders.length,
      color: "#1565C0",
      bg: "#EFF6FF",
    },
    {
      label: "Received",
      val: orders.filter((o) => o.status === "Received").length,
      color: "#16A34A",
      bg: "#DCFCE7",
    },
    {
      label: "Pending",
      val: orders.filter((o) => o.status === "Pending").length,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "Cancelled",
      val: orders.filter((o) => o.status === "Cancelled").length,
      color: "#DC2626",
      bg: "#FEE2E2",
    },
  ];

  return (
    <div>
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {stats.map((s) => (
          <div
            key={s.label}
            className="kpi-card d-flex align-items-center gap-3"
            style={{ flex: "1 1 140px" }}
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
            style={{
              maxWidth: 220,
              flex: "1 1 160px",
            }}
          >
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#718096",
              }}
              size={14}
            />

            <Form.Control
              size="sm"
              placeholder="Search orders..."
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
            {["All", "Received", "Pending", "Cancelled"].map((f) => (
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

          <Button
            variant="primary"
            size="sm"
            className="ms-auto"
            style={{
              borderRadius: 10,
              fontSize: "0.8rem",
            }}
            onClick={() => {
              setError("");
              setModal(true);
            }}
          >
            + New Order
          </Button>
        </div>

        {error && (
          <div
            className="mx-3 mt-3 p-3"
            style={{
              background: "#FFF1F2",
              color: "#DC2626",
              borderRadius: 10,
              fontSize: "0.8rem",
            }}
          >
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table pharma-table mb-0">
            <thead>
              <tr>
                {[
                  "Order ID",
                  "Medicine",
                  "Supplier",
                  "Qty",
                  "Total (EGP)",
                  "Date",
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
                  <td colSpan={8} className="text-center py-5">
                    <Spinner size="sm" className="me-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-5"
                    style={{
                      color: "#718096",
                      fontSize: "0.875rem",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
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

                    <td style={{ color: "#718096" }}>{o.supplier}</td>

                    <td style={{ color: "#718096" }}>{o.qty}</td>

                    <td style={{ fontWeight: 600 }}>
                      {o.total === "N/A" ? "N/A" : `${o.total} EGP`}
                    </td>

                    <td style={{ color: "#718096" }}>{o.date}</td>

                    <td>
                      <span
                        className={
                          "badge " +
                          (statusBadge[o.status] || "badge-secondary")
                        }
                        style={{ fontSize: "0.7rem" }}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm"
                          style={{
                            padding: "4px 8px",
                            borderRadius: 8,
                            background: "#EFF6FF",
                            color: "#1565C0",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="View Details"
                          onClick={() => handleViewOrder(o)}
                        >
                          <Eye size={14} />
                        </button>

                        {o.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 8,
                                background: "#DCFCE7",
                                color: "#16A34A",
                                border: "none",
                                cursor: "pointer",
                              }}
                              title="Receive Order"
                              onClick={() => handleApprove(o.id)}
                            >
                              <Check size={14} />
                            </button>

                            <button
                              className="btn btn-sm"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 8,
                                background: "#FEE2E2",
                                color: "#DC2626",
                                border: "none",
                                cursor: "pointer",
                              }}
                              title="Cancel Order"
                              onClick={() => handleCancel(o.id)}
                            >
                              ×
                            </button>
                          </>
                        )}
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
          style={{
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#718096",
            }}
          >
            Showing {rows.length ? (pg - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(pg * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>

          <Pagination size="sm" className="mb-0">
            <Pagination.Prev
              onClick={() => goPage(pg - 1)}
              disabled={pg === 1}
              style={{ cursor: "pointer" }}
            />

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item
                key={p}
                active={p === pg}
                onClick={() => goPage(p)}
                style={{ cursor: "pointer" }}
              >
                {p}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => goPage(pg + 1)}
              disabled={pg === totalPages}
              style={{ cursor: "pointer" }}
            />
          </Pagination>
        </div>
      </Card>

      <Modal show={showModal} onHide={() => setModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            New Purchase Order
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1.5rem" }}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Medicine Name
              </Form.Label>

              <Form.Control
                placeholder="e.g. Paracetamol 500mg"
                value={newOrder.medicine}
                onChange={(e) =>
                  setNew((prev) => ({
                    ...prev,
                    medicine: e.target.value,
                  }))
                }
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Col>

            <Col xs={12}>
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Barcode
              </Form.Label>

              <Form.Control
                placeholder="e.g. 628100000003"
                value={newOrder.barcode}
                onChange={(e) =>
                  setNew((prev) => ({
                    ...prev,
                    barcode: e.target.value,
                  }))
                }
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Col>

            <Col xs={12}>
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Supplier
              </Form.Label>

              <Form.Select
                value={newOrder.supplier}
                onChange={(e) =>
                  setNew((prev) => ({
                    ...prev,
                    supplier: e.target.value,
                  }))
                }
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              >
                <option value="">Select supplier</option>

                {suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12}>
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Quantity
              </Form.Label>

              <Form.Control
                type="number"
                min="1"
                placeholder="0"
                value={newOrder.qty}
                onChange={(e) =>
                  setNew((prev) => ({
                    ...prev,
                    qty: e.target.value,
                  }))
                }
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Col>
          </Row>

          <div
            className="mt-3 p-3"
            style={{
              background: "#EFF6FF",
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "#1565C0",
                fontWeight: 600,
              }}
            >
              Quantity: {Number(newOrder.qty) || 0}
            </span>
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <Button
            variant="outline-secondary"
            style={{ borderRadius: 10 }}
            onClick={() => setModal(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            style={{ borderRadius: 10 }}
            onClick={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Placing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={Boolean(selectedOrder)}
        onHide={() => setSelectedOrder(null)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Order Details - {selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1.5rem" }}>
          {selectedOrder && (
            <div
              className="d-flex flex-column gap-2"
              style={{ fontSize: "0.875rem" }}
            >
              <div>
                <strong>Medicine:</strong> {selectedOrder.medicine}
              </div>

              <div>
                <strong>Barcode:</strong> {selectedOrder.barcode}
              </div>

              <div>
                <strong>Supplier:</strong> {selectedOrder.supplier}
              </div>

              <div>
                <strong>Quantity:</strong> {selectedOrder.qty}
              </div>

              <div>
                <strong>Date:</strong> {selectedOrder.date}
              </div>

              <div>
                <strong>Status: </strong>

                <span
                  className={
                    "badge " +
                    (statusBadge[selectedOrder.status] || "badge-secondary")
                  }
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            style={{ borderRadius: 10 }}
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
