import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/step_progress.dart';
import '../cubit/auth_cubit.dart';
import 'signup_step2_screen.dart';

class SignUpStep1Screen extends StatefulWidget {
  const SignUpStep1Screen({super.key});

  @override
  State<SignUpStep1Screen> createState() => _SignUpStep1ScreenState();
}

class _SignUpStep1ScreenState extends State<SignUpStep1Screen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(),
      child: Builder(builder: (context) {
        return Scaffold(
          appBar: AppBar(title: const Text('Create Account')),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const StepProgress(currentStep: 1, totalSteps: 2),
                  const SizedBox(height: 28),
                  AppTextField(
                    label: 'Full Name',
                    hint: 'Enter full name',
                    controller: _nameController,
                  ),
                  const SizedBox(height: 18),
                  AppTextField(
                    label: 'Phone Number',
                    hint: 'Enter phone number',
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 18),
                  AppTextField(
                    label: 'Email',
                    hint: 'Enter email address',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 18),
                  AppTextField(
                    label: 'Password',
                    hint: 'At least 6 characters',
                    controller: _passwordController,
                    obscureText: _obscure,
                    suffixIcon: IconButton(
                      icon: Icon(_obscure
                          ? Iconsax.eye_slash
                          : Iconsax.eye),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  const SizedBox(height: 28),
                  PrimaryButton(
                    label: 'Continue',
                    onPressed: () {
                      final name = _nameController.text.trim();
                      final phone = _phoneController.text.trim();
                      final email = _emailController.text.trim();
                      final password = _passwordController.text;

                      if (name.isEmpty ||
                          phone.isEmpty ||
                          email.isEmpty ||
                          password.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Please fill in all fields.'),
                          ),
                        );
                        return;
                      }
                      if (password.length < 6) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content:
                                Text('Password must be at least 6 characters.'),
                          ),
                        );
                        return;
                      }

                      context.read<AuthCubit>().signUpStep1(
                            fullName: name,
                            phone: phone,
                            email: email,
                            password: password,
                          );
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => BlocProvider.value(
                            value: context.read<AuthCubit>(),
                            child: const SignUpStep2Screen(),
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }
}
