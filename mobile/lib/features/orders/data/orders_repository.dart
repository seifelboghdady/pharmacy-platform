import '../../../core/network/api_service.dart';
import '../../../shared/models/order_model.dart';

class OrdersRepository {
  OrdersRepository({ApiService? api}) : _api = api ?? ApiService.instance;

  final ApiService _api;

  Future<List<OrderModel>> getOrders() async {
    final response = await _api.get('/api/orders');
    final data = response is Map<String, dynamic>
        ? response['data'] ?? response
        : response;

    List items = const [];
    if (data is List) {
      items = data;
    } else if (data is Map<String, dynamic>) {
      final raw = data['orders'] ?? data['data'];
      if (raw is List) items = raw;
    }

    return items
        .whereType<Map>()
        .map((item) => OrderModel.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<dynamic> generateFromMissing() {
    return _api.post('/api/orders/generate-from-missing', {});
  }

  Future<dynamic> updateStatus(String orderId, String status) {
    return _api.patch('/api/orders/$orderId/status', {
      'status': status,
    });
  }
}
