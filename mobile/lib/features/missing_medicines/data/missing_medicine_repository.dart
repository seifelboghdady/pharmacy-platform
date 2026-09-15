import '../../../core/network/api_service.dart';

class MissingMedicineRepository {
  MissingMedicineRepository({
    ApiService? api,
  }) : _api = api ?? ApiService.instance;

  final ApiService _api;

  Future<dynamic> addShortage({
    required String medicineName,
    required String barcode,
    required int requiredQuantity,
    String? notes,
  }) async {
    return _api.post(
      '/api/missing-medicines',
      {
        'medicineName': medicineName,
        'barcode': barcode,
        'requiredQuantity': requiredQuantity,
        if (notes != null && notes.trim().isNotEmpty)
          'notes': notes.trim(),
      },
    );
  }
}