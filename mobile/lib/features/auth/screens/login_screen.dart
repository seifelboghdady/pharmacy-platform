import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import 'signup_step1_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(),
      child: Scaffold(
        body: SafeArea(
          child: BlocConsumer<AuthCubit, AuthState>(
            listener: (context, state) {
              if (state.status == AuthStatus.authenticated) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (_) => DashboardScreen(
                      pharmacistName: state.user?.name ?? '',
                    ),
                  ),
                );
              } else if (state.status == AuthStatus.error) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(state.errorMessage ?? 'Error')),
                );
              }
            },
            builder: (context, state) {
              return SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 40),
                    const Text('Welcome Back 👋',
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    const Text('Login to continue',
                        style: TextStyle(color: AppColors.textGrey)),
                    const SizedBox(height: 32),
                    AppTextField(
                      label: 'Email or Phone',
                      hint: 'Enter email or phone',
                      controller: _emailController,
                    ),
                    const SizedBox(height: 18),
                    AppTextField(
                      label: 'Password',
                      hint: 'Enter password',
                      controller: _passwordController,
                      obscureText: _obscure,
                      suffixIcon: IconButton(
                        icon: Icon(_obscure
                            ? Iconsax.eye_slash
                            : Iconsax.eye),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {},
                        child: const Text('Forgot Password?'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    PrimaryButton(
                      label: 'Login',
                      isLoading: state.status == AuthStatus.loading,
                      onPressed: () => context.read<AuthCubit>().login(
                            _emailController.text,
                            _passwordController.text,
                          ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: const [
                        Expanded(child: Divider(color: AppColors.border)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10),
                          child: Text('or continue with',
                              style: TextStyle(color: AppColors.textGrey)),
                        ),
                        Expanded(child: Divider(color: AppColors.border)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Google Sign-In coming soon!'),
                                ),
                              );
                            },
                            icon: const Icon(Icons.g_mobiledata, size: 24),
                            label: const Text('Google'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Apple Sign-In coming soon!'),
                                ),
                              );
                            },
                            icon: const Icon(Icons.apple),
                            label: const Text('Apple'),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const SignUpStep1Screen()),
                        ),
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(color: AppColors.textGrey),
                            children: [
                              TextSpan(text: "Don't have an account? "),
                              TextSpan(
                                text: 'Sign Up',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
