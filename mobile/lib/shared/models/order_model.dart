class OrderItemModel {
  final String medicineName;
  final String barcode;
  final int quantity;

  const OrderItemModel({
    required this.medicineName,
    this.barcode = '',
    required this.quantity,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final nested = json['medicineCatalog'] ?? json['medicine'];
    final nestedMap = nested is Map ? Map<String, dynamic>.from(nested) : const <String, dynamic>{};

    return OrderItemModel(
      medicineName: (json['medicineName'] ?? json['name'] ?? nestedMap['name'] ?? '').toString(),
      barcode: (json['barcode'] ?? nestedMap['barcode'] ?? '').toString(),
      quantity: _parseInt(json['quantity'] ?? json['requiredQuantity']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class OrderModel {
  final String id;
  final String supplier;
  final String status;
  final String createdAt;
  final List<OrderItemModel> items;

  const OrderModel({
    required this.id,
    this.supplier = '',
    this.status = '',
    this.createdAt = '',
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] ?? json['orderItems'] ?? [];
    final items = rawItems is List
        ? rawItems
            .whereType<Map>()
            .map((item) => OrderItemModel.fromJson(
                  Map<String, dynamic>.from(item),
                ))
            .toList()
        : <OrderItemModel>[];

    return OrderModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      supplier: (json['supplier'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
      items: items,
    );
  }
}
