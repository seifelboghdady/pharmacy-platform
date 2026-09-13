import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useNotifications } from "@/context/NotificationsContext";

const API_URL = "https://pharmteck.up.railway.app/api";

const categories = [
  "Analgesic",
  "Antibiotic",
  "Supplement",
  "GI",
  "Antidiabetic",
  "Lipid-lowering",
  "Antihypertensive",
  "Antihistamine",
  "Cardiovascular",
  "Dermatology",
  "Other",
];

const units = [
  "Tablet",
  "Capsule",
  "Syrup (ml)",
  "Injection (vial)",
  "Cream (g)",
  "Drops",
];

export default function AddMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useNotifications();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    activeIngredient: "",
    manufacturer: "",
    category: "Analgesic",
    strength: "",
    unit: "Tablet",
    quantity: "0",
    minStock: "20",
    price: "0",
    expiry: "",
    supplier: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingMedicine, setLoadingMedicine] = useState(isEditMode);

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchMedicine = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        addNotification?.({
          type: "danger",
          title: "Authentication Error",
          message: "Please login again.",
        });

        navigate("/login");
        return;
      }

      try {
        setLoadingMedicine(true);

        const response = await fetch(`${API_URL}/medicines/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to load medicine.",
          );
        }

        const medicine = data?.medicine || data;

        const catalog = medicine?.medicineCatalog || {};

        setForm((prev) => ({
          ...prev,
          name: catalog.name || "",
          barcode: catalog.barcode || "",
          activeIngredient: catalog.activeIngredient || "",
          manufacturer: catalog.manufacturer || "",
          category: catalog.category || "Analgesic",
          strength: catalog.strength || "",
          unit: catalog.dosageForm || "Tablet",
          quantity: String(medicine.stockQuantity ?? 0),
          price: String(medicine.price ?? 0),
          expiry: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "",
          supplier: medicine.supplier || "",
        }));
      } catch (error) {
        addNotification?.({
          type: "danger",
          title: "Failed to Load Medicine",
          message: error.message || "Something went wrong.",
        });

        navigate("/dashboard/inventory");
      } finally {
        setLoadingMedicine(false);
      }
    };

    fetchMedicine();
  }, [id, isEditMode, navigate, addNotification]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      addNotification?.({
        type: "danger",
        title: "Authentication Error",
        message: "Please login again.",
      });

      navigate("/login");
      return;
    }

    if (
      !form.name.trim() ||
      !form.barcode.trim() ||
      !form.activeIngredient.trim() ||
      !form.manufacturer.trim() ||
      !form.strength.trim() ||
      !form.expiry
    ) {
      addNotification?.({
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all required medicine fields.",
      });

      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const response = await fetch(`${API_URL}/medicines/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: Number(form.price) || 0,
            stockQuantity: Number(form.quantity) || 0,
            expiryDate: form.expiry,
            supplier: form.supplier.trim(),
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || data?.error || "Failed to update medicine.",
          );
        }

        addNotification?.({
          type: "success",
          title: "Medicine Updated",
          message: `${form.name.trim()} has been updated successfully.`,
        });

        navigate("/dashboard/inventory");
        return;
      }

      const catalogResponse = await fetch(`${API_URL}/medicine-catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          barcode: form.barcode.trim(),
          activeIngredient: form.activeIngredient.trim(),
          manufacturer: form.manufacturer.trim(),
          category: form.category,
          dosageForm: form.unit,
          strength: form.strength.trim(),
        }),
      });

      const catalogData = await catalogResponse.json().catch(() => null);

      if (!catalogResponse.ok) {
        throw new Error(
          catalogData?.message ||
            catalogData?.error ||
            "Failed to create medicine catalog.",
        );
      }

      const catalogId =
        catalogData?.medicine?._id ||
        catalogData?._id ||
        catalogData?.medicineCatalog?._id ||
        catalogData?.data?._id;

      if (!catalogId) {
        throw new Error(
          "Medicine catalog was created but its ID was not returned.",
        );
      }

      const inventoryResponse = await fetch(`${API_URL}/medicines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineCatalog: catalogId,
          price: Number(form.price) || 0,
          stockQuantity: Number(form.quantity) || 0,
          expiryDate: form.expiry,
          supplier: form.supplier.trim(),
        }),
      });

      const inventoryData = await inventoryResponse.json().catch(() => null);

      if (!inventoryResponse.ok) {
        throw new Error(
          inventoryData?.message ||
            inventoryData?.error ||
            "Failed to add medicine to inventory.",
        );
      }

      const qtyNum = Number(form.quantity) || 0;
      const minAlert = Number(form.minStock) || 20;
      const today = new Date().toISOString().split("T")[0];

      let status = "Active";

      if (form.expiry < today) {
        status = "Expired";
      } else if (qtyNum <= minAlert) {
        status = "Low";
      }

      addNotification?.({
        type: "success",
        title: "Medicine Added",
        message: `${form.name.trim()} has been added to inventory successfully.`,
      });

      if (status === "Low") {
        addNotification?.({
          type: "warning",
          title: "Low Stock Alert",
          message: `${form.name.trim()} was added with low stock quantity (${qtyNum}).`,
        });
      }

      if (status === "Expired") {
        addNotification?.({
          type: "danger",
          title: "Expired Medicine",
          message: `${form.name.trim()} was added with an expired date.`,
        });
      }

      navigate("/dashboard/inventory");
    } catch (error) {
      addNotification?.({
        type: "danger",
        title: isEditMode
          ? "Failed to Update Medicine"
          : "Failed to Add Medicine",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingMedicine) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <Spinner size="sm" className="me-2" />
        Loading medicine...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <nav style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
        <Link
          to="/dashboard/inventory"
          style={{
            color: "#1565C0",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Inventory
        </Link>

        <span style={{ color: "#718096", margin: "0 6px" }}>/</span>

        <span style={{ color: "#718096" }}>
          {isEditMode ? "Edit Medicine" : "Add Medicine"}
        </span>
      </nav>

      <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <Card.Header
          style={{
            background: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            borderRadius: "16px 16px 0 0",
            padding: "1rem 1.25rem",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "#EFF6FF",
                color: "#1565C0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {isEditMode ? (
                  <>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1-1-4Z" />
                  </>
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#1A202C",
                  fontSize: "0.9rem",
                }}
              >
                {isEditMode ? "Edit Medicine" : "New Medicine"}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#718096",
                }}
              >
                {isEditMode
                  ? "Update the medicine details below"
                  : "Fill in the medicine details below"}
              </div>
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: "1.5rem" }}>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Medicine Name *
              </Form.Label>

              <Form.Control
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Panadol Extra"
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Barcode *
                </Form.Label>

                <Form.Control
                  value={form.barcode}
                  onChange={set("barcode")}
                  placeholder="e.g. 628100000003"
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>

              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Manufacturer *
                </Form.Label>

                <Form.Control
                  value={form.manufacturer}
                  onChange={set("manufacturer")}
                  placeholder="e.g. GSK"
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Active Ingredient *
              </Form.Label>

              <Form.Control
                value={form.activeIngredient}
                onChange={set("activeIngredient")}
                placeholder="e.g. Paracetamol + Caffeine"
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Category *
                </Form.Label>

                <Form.Select
                  value={form.category}
                  onChange={set("category")}
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Unit Type
                </Form.Label>

                <Form.Select
                  value={form.unit}
                  onChange={set("unit")}
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Strength *
              </Form.Label>

              <Form.Control
                value={form.strength}
                onChange={set("strength")}
                placeholder="e.g. 500mg"
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Quantity in Stock *
                </Form.Label>

                <Form.Control
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={set("quantity")}
                  placeholder="0"
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>

              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Min Stock Alert
                </Form.Label>

                <Form.Control
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={set("minStock")}
                  placeholder="20"
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Unit Price (EGP) *
                </Form.Label>

                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  placeholder="0.00"
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>

              <Col xs={6}>
                <Form.Label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  Expiry Date *
                </Form.Label>

                <Form.Control
                  type="date"
                  value={form.expiry}
                  onChange={set("expiry")}
                  style={{
                    borderRadius: 10,
                    fontSize: "0.875rem",
                  }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#4A5568",
                }}
              >
                Supplier Name
              </Form.Label>

              <Form.Control
                value={form.supplier}
                onChange={set("supplier")}
                placeholder="e.g. ABC Pharma"
                style={{
                  borderRadius: 10,
                  fontSize: "0.875rem",
                }}
              />
            </Form.Group>

            <div className="d-flex gap-3">
              <Button
                type="button"
                variant="outline-secondary"
                className="flex-fill"
                style={{ borderRadius: 10 }}
                onClick={() => navigate("/dashboard/inventory")}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                className="flex-fill"
                style={{ borderRadius: 10 }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                    ? "Update Medicine"
                    : "Save Medicine"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
