import '../../core/network/api_service.dart';
import '../models/medicine_model.dart';

/// Data layer for everything related to `GET /api/medicines`.
/// Shared across the dashboard, inventory, and scanner features so the
/// HTTP/parsing logic lives in exactly one place.
class MedicineRepository {
  MedicineRepository({ApiService? api}) : _api = api ?? ApiService.instance;
  final ApiService _api;

  Future<List<MedicineModel>> fetchMedicines({
    String? name,
    String? barcode,
    String? category,
    int? page,
    int? limit,
  }) async {
    final query = <String, dynamic>{
      if (name != null) 'name': name,
      if (barcode != null) 'barcode': barcode,
      if (category != null) 'category': category,
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };
    final res = await _api.get('/api/medicines', query: query);
    final list = (res is Map && res['data'] is List)
        ? res['data']
        : (res is List ? res : []);
    return (list as List)
        .map((e) => MedicineModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<MedicineModel?> findByBarcode(String barcode) async {
    final results = await fetchMedicines(barcode: barcode);
    return results.isEmpty ? null : results.first;
  }
}
