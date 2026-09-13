import '../../../core/network/api_service.dart';

/// Data layer for the dispense feature.
/// Wraps `POST /api/dispensing-transactions`.
class DispenseRepository {
  DispenseRepository({ApiService? api}) : _api = api ?? ApiService.instance;
  final ApiService _api;

  Future<void> dispense({
    required String medicineId,
    required int quantity,
  }) {
    return _api.post('/api/dispensing-transactions', {
      'medicine': medicineId,
      'quantity': quantity,
    });
  }
}
