import '../../../core/network/api_service.dart';
import '../../../shared/models/user_model.dart';

class UsersRepository {
  UsersRepository({ApiService? api}) : _api = api ?? ApiService.instance;
  final ApiService _api;

  Future<List<UserModel>> getUsers() async {
    final response = await _api.get('/api/users');
    final data = response is Map<String, dynamic> ? response['data'] ?? response : response;
    List items = const [];
    if (data is List) items = data;
    if (data is Map<String, dynamic> && data['users'] is List) items = data['users'];
    return items.whereType<Map>().map((e) => UserModel.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<UserModel> addEmployee({
    required String name, required String email, required String password,
    required String phone, required String pharmacyName,
  }) async {
    final response = await _api.post('/api/users', {
      'name': name.trim(), 'email': email.trim(), 'password': password,
      'pharmacyName': pharmacyName.trim(), 'phone': phone.trim(),
    });
    final data = response is Map<String, dynamic> ? response['data'] ?? response : response;
    if (data is Map<String, dynamic>) {
      final user = data['user'] ?? data;
      if (user is Map) return UserModel.fromJson(Map<String, dynamic>.from(user));
    }
    return UserModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {});
  }
}
