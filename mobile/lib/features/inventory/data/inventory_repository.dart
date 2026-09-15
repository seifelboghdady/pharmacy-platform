import '../../../core/network/api_service.dart';
import '../../../shared/models/medicine_catalog_model.dart';
import '../../missing_medicines/data/medicine_catalog_repository.dart';

class InventoryRepository {
  InventoryRepository({ApiService? api}) : _api = api ?? ApiService.instance;

  final ApiService _api;

  Future<dynamic> addToInventory({
    required String catalogId,
    required double price,
    required int stockQuantity,
    required String expiryDate,
    String supplier = '',
  }) {
    return _api.post(
      '/api/medicines',
      {
        'medicineCatalog': catalogId,
        'price': price,
        'stockQuantity': stockQuantity,
        'expiryDate': expiryDate,
        'supplier': supplier,
      },
    );
  }

  Future<MedicineCatalogModel> ensureCatalogMedicine({
    required String name,
    String barcode = '',
  }) async {
    final catalogRepository = MedicineCatalogRepository(api: _api);

    final existing = barcode.trim().isNotEmpty
        ? await catalogRepository.search(barcode: barcode)
        : await catalogRepository.search(name: name);

    if (existing.isNotEmpty) return existing.first;

    return catalogRepository.create(
      name: name,
      barcode: barcode,
    );
  }
}
