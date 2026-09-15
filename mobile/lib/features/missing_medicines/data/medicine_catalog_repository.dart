import '../../../core/network/api_service.dart';
import '../../../shared/models/medicine_catalog_model.dart';

class MedicineCatalogRepository {
  MedicineCatalogRepository({ApiService? api}) : _api = api ?? ApiService.instance;

  final ApiService _api;

  Future<List<MedicineCatalogModel>> search({
    String? name,
    String? barcode,
  }) async {
    final response = await _api.get(
      '/api/medicine-catalog',
      query: {
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
        if (barcode != null && barcode.trim().isNotEmpty)
          'barcode': barcode.trim(),
      },
    );

    final data = response is Map<String, dynamic>
        ? response['data'] ?? response
        : response;

    List items = const [];
    if (data is List) {
      items = data;
    } else if (data is Map<String, dynamic>) {
      final raw = data['medicines'] ?? data['catalog'] ?? data['medicineCatalog'] ?? data['medicineCatalogs'] ?? data['data'];
      if (raw is List) items = raw;
    }

    return items
        .whereType<Map>()
        .map((item) => MedicineCatalogModel.fromJson(
              Map<String, dynamic>.from(item),
            ))
        .toList();
  }

  Future<MedicineCatalogModel> create({
    required String name,
    String? barcode,
    String? activeIngredient,
    String? manufacturer,
    String? category,
    String? dosageForm,
    String? strength,
  }) async {
    final response = await _api.post(
      '/api/medicine-catalog',
      MedicineCatalogModel(
        id: '',
        name: name.trim(),
        barcode: barcode?.trim() ?? '',
        activeIngredient: activeIngredient?.trim() ?? '',
        manufacturer: manufacturer?.trim() ?? '',
        category: category?.trim() ?? '',
        dosageForm: dosageForm?.trim() ?? '',
        strength: strength?.trim() ?? '',
      ).toCreateJson(),
    );

    final data = response is Map<String, dynamic>
        ? response['data'] ?? response
        : response;

    if (data is Map<String, dynamic>) {
      final catalog = data['medicineCatalog'] ?? data['medicine'] ?? data;
      if (catalog is Map<String, dynamic>) {
        return MedicineCatalogModel.fromJson(catalog);
      }
    }

    throw Exception('Invalid medicine catalog response');
  }
}
