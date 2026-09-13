import { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Modal, Spinner } from "react-bootstrap";
import { X } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

const API_URL = "https://pharmteck.up.railway.app/api";

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
  stock: Number(medicine.stockQuantity || 0),
  price: Number(medicine.price || 0),
  barcode: medicine.medicineCatalog?.barcode || "",
  status: getMedicineStatus(medicine),
});

const formatTransaction = (transaction) => {
  const medicine = transaction.medicine;
  const medicineName = medicine?.medicineCatalog?.name || "Unknown Medicine";

  return {
    id: transaction._id,
    patient: "Patient",
    medicines: `${medicineName} × ${transaction.quantity}`,
    time: transaction.createdAt
      ? new Date(transaction.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    total: `${Number(transaction.totalPrice || 0).toFixed(2)} EGP`,
    status: "Completed",
  };
};

export default function Dispense() {
  const { addNotification } = useNotifications();

  const [patient, setPatient] = useState("");
  const [prescrip, setPrescrip] = useState("");
  const [items, setItems] = useState([]);

  const [showModal, setModal] = useState(false);
  const [selMed, setSelMed] = useState("");
  const [qty, setQty] = useState(1);

  const [medsList, setMedsList] = useState([]);
  const [dispenses, setDispenses] = useState([]);

  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [loadingDispenses, setLoadingDispenses] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState("");

  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);
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

      setMedsList(formattedMedicines);
    } catch (error) {
      setError(error.message || "Unable to load medicines.");
    } finally {
      setLoadingMedicines(false);
    }
  };

  const fetchDispenses = async () => {
    try {
      setLoadingDispenses(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/dispensing-transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dispensing transactions.",
        );
      }

      const transactions = Array.isArray(data) ? data : data.transactions || [];

      setDispenses(transactions.map(formatTransaction));
    } catch (error) {
      setError(error.message || "Unable to load dispensing transactions.");
    } finally {
      setLoadingDispenses(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchDispenses();
  }, []);

  const addItem = () => {
    const med = medsList.find((m) => m.id === selMed);

    if (!med || !qty) {
      return;
    }

    const quantity = Number(qty);

    if (quantity <= 0) {
      return;
    }

    const existing = items.find((item) => item.id === med.id);

    if (existing) {
      const newQuantity = existing.qty + quantity;

      if (newQuantity > med.stock) {
        setError(`Only ${med.stock} units of ${med.name} are available.`);
        return;
      }

      setItems(
        items.map((item) =>
          item.id === med.id ? { ...item, qty: newQuantity } : item,
        ),
      );
    } else {
      if (quantity > med.stock) {
        setError(`Only ${med.stock} units of ${med.name} are available.`);
        return;
      }

      setItems([
        ...items,
        {
          id: med.id,
          name: med.name,
          qty: quantity,
          price: med.price,
        },
      ]);
    }

    setError("");
    setSelMed("");
    setQty(1);
    setModal(false);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleDispense = async () => {
    if (!patient || items.length === 0 || dispensing) {
      return;
    }

    try {
      setDispensing(true);
      setError("");

      const token = localStorage.getItem("token");

      for (const item of items) {
        const response = await fetch(`${API_URL}/dispensing-transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medicine: item.id,
            quantity: item.qty,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Failed to dispense ${item.name}.`);
        }
      }

      if (addNotification) {
        addNotification({
          type: "info",
          title: "Medicine Dispensed",
          message: `Dispensed ${items.length} item(s) to ${patient}.`,
        });
      }

      setPatient("");
      setPrescrip("");
      setItems([]);

      await fetchMedicines();
      await fetchDispenses();
    } catch (error) {
      setError(error.message || "Unable to complete dispensing.");
    } finally {
      setDispensing(false);
    }
  };

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

      <Row className="g-4">
        <Col xl={7}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header
              style={{
                background: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                borderRadius: "16px 16px 0 0",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#1A202C",
                }}
              >
                New Dispensation
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#718096",
                }}
              >
                Fill in patient and prescription details
              </div>
            </Card.Header>

            <Card.Body style={{ padding: "1.25rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#1565C0",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    1
                  </div>

                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: "#1A202C",
                    }}
                  >
                    Patient Information
                  </span>
                </div>

                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Control
                      placeholder="Patient name"
                      value={patient}
                      onChange={(e) => setPatient(e.target.value)}
                      style={{
                        borderRadius: 10,
                        fontSize: "0.875rem",
                      }}
                    />
                  </Col>

                  <Col xs={6}>
                    <Form.Control
                      placeholder="Prescription / ID no."
                      value={prescrip}
                      onChange={(e) => setPrescrip(e.target.value)}
                      style={{
                        borderRadius: 10,
                        fontSize: "0.875rem",
                      }}
                    />
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#1565C0",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      2
                    </div>

                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#1A202C",
                      }}
                    >
                      Medicines to Dispense
                    </span>
                  </div>

                  <button
                    className="btn btn-sm btn-primary"
                    style={{
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                    onClick={() => setModal(true)}
                    disabled={loadingMedicines}
                  >
                    + Add Medicine
                  </button>
                </div>

                {items.length === 0 ? (
                  <div
                    style={{
                      border: "2px dashed #E2E8F0",
                      borderRadius: 12,
                      padding: "2rem",
                      textAlign: "center",
                      color: "#718096",
                      fontSize: "0.875rem",
                    }}
                  >
                    {loadingMedicines
                      ? "Loading medicines..."
                      : 'No medicines added yet. Click "+ Add Medicine" to begin.'}
                  </div>
                ) : (
                  <div
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <table
                      className="table mb-0"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <thead style={{ background: "#F8FAFC" }}>
                        <tr>
                          {["Medicine", "Qty", "Unit Price", "Total", ""].map(
                            (h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "0.6rem 0.75rem",
                                  fontWeight: 600,
                                  color: "#718096",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td
                              style={{
                                padding: "0.6rem 0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {item.name}
                            </td>

                            <td
                              style={{
                                padding: "0.6rem 0.75rem",
                                color: "#718096",
                              }}
                            >
                              {item.qty}
                            </td>

                            <td
                              style={{
                                padding: "0.6rem 0.75rem",
                                color: "#718096",
                              }}
                            >
                              {item.price.toFixed(2)} EGP
                            </td>

                            <td
                              style={{
                                padding: "0.6rem 0.75rem",
                                fontWeight: 600,
                                color: "#1565C0",
                              }}
                            >
                              {(item.qty * item.price).toFixed(2)} EGP
                            </td>

                            <td
                              style={{
                                padding: "0.6rem 0.75rem",
                              }}
                            >
                              <button
                                onClick={() => removeItem(item.id)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  color: "#EF4444",
                                  cursor: "pointer",
                                }}
                              >
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

              {items.length > 0 && (
                <div
                  style={{
                    background: "#EFF6FF",
                    borderRadius: 12,
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#1565C0",
                        fontSize: "0.9rem",
                      }}
                    >
                      Total Amount
                    </span>

                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "#1565C0",
                      }}
                    >
                      {total.toFixed(2)} EGP
                    </span>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  className="flex-1"
                  style={{ borderRadius: 10 }}
                  onClick={() => {
                    setItems([]);
                    setPatient("");
                    setPrescrip("");
                    setError("");
                  }}
                  disabled={dispensing}
                >
                  Clear
                </Button>

                <Button
                  variant="primary"
                  className="flex-1"
                  style={{ borderRadius: 10 }}
                  disabled={!patient || items.length === 0 || dispensing}
                  onClick={handleDispense}
                >
                  {dispensing ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Dispensing...
                    </>
                  ) : (
                    "Dispense & Print Label"
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card
            className="border-0 shadow-sm mb-3"
            style={{ borderRadius: 16 }}
          >
            <Card.Header
              style={{
                background: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                borderRadius: "16px 16px 0 0",
                padding: "0.75rem 1.25rem",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#1A202C",
                }}
              >
                Today's Dispensations
              </span>
            </Card.Header>

            <Card.Body style={{ padding: 0 }}>
              {loadingDispenses ? (
                <div
                  className="text-center py-4"
                  style={{
                    color: "#718096",
                    fontSize: "0.8rem",
                  }}
                >
                  <Spinner size="sm" className="me-2" />
                  Loading transactions...
                </div>
              ) : dispenses.length === 0 ? (
                <div
                  className="text-center py-4"
                  style={{
                    color: "#718096",
                    fontSize: "0.8rem",
                  }}
                >
                  No dispensing transactions yet.
                </div>
              ) : (
                dispenses.slice(0, 6).map((d) => (
                  <div
                    key={d.id}
                    style={{
                      padding: "0.75rem 1.25rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            color: "#1A202C",
                          }}
                        >
                          {d.patient}
                        </div>

                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#718096",
                            marginTop: 1,
                          }}
                        >
                          {d.medicines}
                        </div>
                      </div>

                      <div className="text-end">
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: "#1565C0",
                          }}
                        >
                          {d.total}
                        </div>

                        <div
                          style={{
                            fontSize: "0.65rem",
                            color: "#718096",
                          }}
                        >
                          {d.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Header
              style={{
                background: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                borderRadius: "16px 16px 0 0",
                padding: "0.75rem 1.25rem",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#1A202C",
                }}
              >
                Quick Stock Check
              </span>
            </Card.Header>

            <Card.Body style={{ padding: "0.75rem 1.25rem" }}>
              {loadingMedicines ? (
                <div
                  className="text-center py-3"
                  style={{
                    color: "#718096",
                    fontSize: "0.8rem",
                  }}
                >
                  <Spinner size="sm" className="me-2" />
                  Loading stock...
                </div>
              ) : medsList.length === 0 ? (
                <div
                  className="text-center py-3"
                  style={{
                    color: "#718096",
                    fontSize: "0.8rem",
                  }}
                >
                  No medicines in inventory.
                </div>
              ) : (
                medsList.map((m) => (
                  <div
                    key={m.id}
                    className="d-flex align-items-center justify-content-between mb-2"
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#4A5568",
                        flex: 1,
                      }}
                    >
                      {m.name}
                    </span>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          m.stock < 20
                            ? "#EF4444"
                            : m.stock < 50
                              ? "#D97706"
                              : "#16A34A",
                      }}
                    >
                      {m.stock} units
                    </span>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #E2E8F0" }}>
          <Modal.Title
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            Add Medicine
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1.25rem" }}>
          <Form.Group className="mb-3">
            <Form.Label
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#4A5568",
              }}
            >
              Select Medicine
            </Form.Label>

            <Form.Select
              value={selMed}
              onChange={(e) => setSelMed(e.target.value)}
              style={{
                borderRadius: 10,
                fontSize: "0.875rem",
              }}
            >
              <option value="">Choose medicine…</option>

              {medsList
                .filter((m) => m.stock > 0)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stock: {m.stock})
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
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
              max={medsList.find((m) => m.id === selMed)?.stock || undefined}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              style={{
                borderRadius: 10,
                fontSize: "0.875rem",
              }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "1px solid #E2E8F0" }}>
          <Button
            variant="outline-secondary"
            style={{ borderRadius: 10 }}
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            style={{ borderRadius: 10 }}
            onClick={addItem}
            disabled={!selMed || !qty}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
