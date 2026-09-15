import '../../../core/network/api_service.dart';
import '../../../shared/models/missing_medicine_model.dart';

class MissingMedicineRepository {
  MissingMedicineRepository({ApiService? api})
      : _api = api ?? ApiService.instance;

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

  Future<List<MissingMedicineModel>> getMissingMedicines() async {
  
    final response = await _api.get('/api/missing-medicines');

    final data = response is Map<String, dynamic>
        ? response['data'] ?? response
        : response;

    if (data is List) {
      return data
          .map(
            (item) => MissingMedicineModel.fromJson(
              Map<String, dynamic>.from(item),
            ),
          )
          .toList();
    }

    if (data is Map<String, dynamic>) {
      final items = data['missingMedicines'] ??
          data['medicines'] ??
          data['data'];

      if (items is List) {
        return items
            .map(
              (item) => MissingMedicineModel.fromJson(
                Map<String, dynamic>.from(item),
              ),
            )
            .toList();
      }
    }

    return [];
  }

  Future<dynamic> generateOrderFromMissing() async {
    return _api.post(
      '/api/orders/generate-from-missing',
      {},
    );
  }
}
