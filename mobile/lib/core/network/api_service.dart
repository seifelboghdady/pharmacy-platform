import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

/// Central place for talking to the Pharmteck backend.
///
/// Base URL and every endpoint below come directly from the
/// "Pharmteck-Flutter-API-Guide.pdf" the user shared.
class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  static const String baseUrl = 'https://pharmteck.up.railway.app';

  String? _token;

  Future<void> _loadToken() async {
    if (_token != null) return;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<void> saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<bool> get hasToken async {
    await _loadToken();
    return _token != null;
  }

  Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      await _loadToken();
      if (_token != null) headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final cleanQuery = query?.map((k, v) => MapEntry(k, '$v'));
    return Uri.parse('$baseUrl$path')
        .replace(queryParameters: cleanQuery?.isEmpty == true ? null : cleanQuery);
  }

  dynamic _decode(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return null;
      return jsonDecode(res.body);
    }
    String message = 'Request failed (${res.statusCode})';
    try {
      final body = jsonDecode(res.body);
      if (body is Map && body['message'] != null) message = body['message'];
    } catch (_) {}
    throw ApiException(message, res.statusCode);
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    final res = await http
        .get(_uri(path, query), headers: await _headers())
        .timeout(const Duration(seconds: 20));
    return _decode(res);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body,
      {bool auth = true}) async {
    final res = await http
        .post(
          _uri(path),
          headers: await _headers(auth: auth),
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 20));
    return _decode(res);
  }

  /// Turns any thrown exception into a short, user-friendly message.
  static String friendlyError(Object e) {
    if (e is ApiException) return e.message;
    final s = e.toString();
    if (s.contains('TimeoutException')) {
      return 'The server is taking too long to respond. Please try again.';
    }
    if (s.contains('SocketException') || s.contains('Failed host lookup')) {
      return 'No internet connection. Please check your network.';
    }
    return 'Something went wrong. Please try again.';
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final res = await http
        .patch(
          _uri(path),
          headers: await _headers(),
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 20));
    return _decode(res);
  }
}
