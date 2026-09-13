/// Represents a pharmacy-inventory medicine (GET /api/medicines item).
/// The catalog fields (name, category, manufacturer, activeIngredient,
/// barcode) come from the populated `medicineCatalog` reference; the
/// stock fields (price, stockQuantity, expiryDate, supplier) belong to
/// the pharmacy's own inventory record.
class MedicineModel {
  final String id; // Pharmacy Medicine (inventory) _id
  final String catalogId; // medicineCatalog _id
  final String name;
  final String category;
  final String activeIngredient;
  final String manufacturer;
  final String barcode;
  final int stock;
  final double price;
  final String expiryDate;
  final String supplier;

  const MedicineModel({
    required this.id,
    this.catalogId = '',
    required this.name,
    this.category = '',
    this.activeIngredient = '',
    this.manufacturer = '',
    this.barcode = '',
    required this.stock,
    required this.price,
    required this.expiryDate,
    this.supplier = '',
  });

  bool get isOutOfStock => stock <= 0;
  bool get isLowStock => stock > 0 && stock <= 5;

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    final catalog = json['medicineCatalog'];
    final catalogMap = catalog is Map ? catalog : const {};
    return MedicineModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      catalogId: catalog is Map
          ? (catalog['_id'] ?? '').toString()
          : (catalog ?? '').toString(),
      name: catalogMap['name'] ?? json['name'] ?? '',
      category: catalogMap['category'] ?? '',
      activeIngredient: catalogMap['activeIngredient'] ?? '',
      manufacturer: catalogMap['manufacturer'] ?? '',
      barcode: catalogMap['barcode'] ?? '',
      stock: json['stockQuantity'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
      expiryDate: json['expiryDate'] ?? '',
      supplier: json['supplier'] ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'medicineCatalog': catalogId,
        'price': price,
        'stockQuantity': stock,
        'expiryDate': expiryDate,
        'supplier': supplier,
      };
}
