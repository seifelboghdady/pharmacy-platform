import '../../../core/network/api_service.dart';

/// Data layer for the auth feature.
/// Wraps `POST /api/auth/register` and `POST /api/users/login`.
class AuthRepository {
  AuthRepository({ApiService? api}) : _api = api ?? ApiService.instance;
  final ApiService _api;

  /// Registers a new pharmacy owner. Returns the raw JSON response
  /// (guaranteed to contain a `token`).
  Future<Map<String, dynamic>> registerOwner({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String pharmacyName,
    String role = 'owner',
  }) async {
    final res = await _api.post(
      '/api/auth/register',
      {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'pharmacyName': pharmacyName,
        'role': role,
      },
      auth: false,
    );
    return res is Map<String, dynamic> ? res : {};
  }


  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _api.post(
      '/api/users/login',
      {'email': email, 'password': password},
      auth: false,
    );
    return res is Map<String, dynamic> ? res : {};
  }

  Future<void> saveSession(String token) => _api.saveToken(token);

  Future<void> logout() => _api.clearToken();
}
