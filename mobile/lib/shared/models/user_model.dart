class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String pharmacyName;
  final String role; // 'owner' | 'employee'

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.pharmacyName,
    required this.role,
  });

  bool get isOwner => role == 'owner';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // The API may return the user fields flat or nested under "user".
    final data = json['user'] is Map ? json['user'] as Map : json;
    return UserModel(
      id: (data['_id'] ?? data['id'] ?? '').toString(),
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      phone: data['phone'] ?? '',
      pharmacyName: data['pharmacyName'] ?? '',
      role: data['role'] ?? 'owner',
    );
  }
}
