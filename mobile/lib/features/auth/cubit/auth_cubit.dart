import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/network/api_service.dart';
import '../../../shared/models/user_model.dart';
import '../data/auth_repository.dart';
import 'auth_state.dart';

/// Business logic for login and owner sign-up.
/// Talks only to [AuthRepository] — never to ApiService directly.
///
/// NOTE: the API has no OTP/SMS verification endpoint, so the sign-up
/// flow goes straight from Step 2 to an authenticated session.
class AuthCubit extends Cubit<AuthState> {
  AuthCubit({AuthRepository? repository})
      : _repository = repository ?? AuthRepository(),
        super(const AuthState());

  final AuthRepository _repository;

  // Holds step-1 data until step-2 completes the registration payload.
  Map<String, String> _draft = {};

  Future<void> login(String email, String password) async {
    if (email.trim().isEmpty || password.trim().isEmpty) {
      emit(state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Please enter email and password.',
      ));
      return;
    }
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final res = await _repository.login(email: email, password: password);
      final token = res['token'] as String?;
      if (token == null || token.isEmpty) {
        throw ApiException('Invalid response from server. Please try again.');
      }
      await _repository.saveSession(token);
      final user = UserModel.fromJson(res);
      emit(state.copyWith(status: AuthStatus.authenticated, user: user));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.error,
        errorMessage: ApiService.friendlyError(e),
      ));
    }
  }

  void signUpStep1({
    required String fullName,
    required String phone,
    required String email,
    required String password,
  }) {
    _draft = {
      'name': fullName,
      'phone': phone,
      'email': email,
      'password': password,
    };
  }

  Future<void> signUpStep2({required String pharmacyName}) async {
    if (pharmacyName.trim().isEmpty) {
      emit(state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Please enter pharmacy name.',
      ));
      return;
    }
    if (_draft.isEmpty ||
        (_draft['name']?.isEmpty ?? true) ||
        (_draft['email']?.isEmpty ?? true) ||
        (_draft['password']?.isEmpty ?? true)) {
      emit(state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Missing registration data. Please go back to step 1.',
      ));
      return;
    }
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final res = await _repository.registerOwner(
        name: _draft['name']!,
        email: _draft['email']!,
        password: _draft['password']!,
        phone: _draft['phone'] ?? '',
        pharmacyName: pharmacyName,
      );
      final token = res['token'] as String?;
      if (token == null || token.isEmpty) {
        throw ApiException('Registration failed. Please try again.');
      }
      await _repository.saveSession(token);
      final user = UserModel.fromJson(res);
      emit(state.copyWith(status: AuthStatus.authenticated, user: user));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.error,
        errorMessage: ApiService.friendlyError(e),
      ));
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    emit(const AuthState());
  }
}
