import '../../core/network/api_service.dart';
import '../models/medicine_model.dart';

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
      if (name != null && name.isNotEmpty) 'name': name,
      if (barcode != null && barcode.isNotEmpty) 'barcode': barcode,
      if (category != null && category.isNotEmpty) 'category': category,
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    final res = await _api.get('/api/medicines', query: query);
    final List medicinesJson;
    if (res is Map<String, dynamic> && res['medicines'] is List) {
      medicinesJson = res['medicines'];
    } else if (res is List) {
      medicinesJson = res;
    } else {
      throw Exception('Invalid medicines response format');
    }

    return medicinesJson
        .map((e) => MedicineModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<MedicineModel?> findByBarcode(String barcode) async {
    final results = await fetchMedicines(barcode: barcode);
    return results.isEmpty ? null : results.first;
  }

  Future<dynamic> addMedicine({
    required String medicineCatalog,
    required num price,
    required int stockQuantity,
    required String expiryDate,
    required String supplier,
  }) {
    return _api.post('/api/medicines', {
      'medicineCatalog': medicineCatalog,
      'price': price,
      'stockQuantity': stockQuantity,
      'expiryDate': expiryDate,
      'supplier': supplier,
    });
  }
}
