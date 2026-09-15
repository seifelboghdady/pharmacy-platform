/// Represents a missing-medicine / shortage request
/// from GET /api/missing-medicines.
class MissingMedicineModel {
  final String id;
  final String medicineName;
  final String barcode;
  final int requiredQuantity;
  final String notes;
  final String status;
  final String createdAt;

  const MissingMedicineModel({
    required this.id,
    required this.medicineName,
    this.barcode = '',
    required this.requiredQuantity,
    this.notes = '',
    this.status = '',
    this.createdAt = '',
  });

  factory MissingMedicineModel.fromJson(Map<String, dynamic> json) {
    return MissingMedicineModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      medicineName: (json['medicineName'] ?? '').toString(),
      barcode: (json['barcode'] ?? '').toString(),
      requiredQuantity: _parseInt(json['requiredQuantity']),
      notes: (json['notes'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}