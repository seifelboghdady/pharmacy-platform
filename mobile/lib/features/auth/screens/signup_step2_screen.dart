import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/step_progress.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../../dashboard/screens/dashboard_screen.dart';

/// Step 2 of sign-up. The Pharmteck register endpoint only needs
/// `pharmacyName` in addition to what step 1 already collected, so this
/// screen only asks for that field.
class SignUpStep2Screen extends StatefulWidget {
  const SignUpStep2Screen({super.key});

  @override
  State<SignUpStep2Screen> createState() => _SignUpStep2ScreenState();
}

class _SignUpStep2ScreenState extends State<SignUpStep2Screen> {
  final _pharmacyNameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pharmacy Information')),
      body: SafeArea(
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state.status == AuthStatus.authenticated) {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(
                  builder: (_) => DashboardScreen(
                    pharmacistName: state.user?.name ?? '',
                  ),
                ),
                (route) => false,
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
                  const StepProgress(currentStep: 2, totalSteps: 2),
                  const SizedBox(height: 28),
                  AppTextField(
                    label: 'Pharmacy Name',
                    hint: 'Enter pharmacy name',
                    controller: _pharmacyNameController,
                  ),
                  const SizedBox(height: 28),
                  PrimaryButton(
                    label: 'Sign Up',
                    isLoading: state.status == AuthStatus.loading,
                    onPressed: () => context.read<AuthCubit>().signUpStep2(
                          pharmacyName: _pharmacyNameController.text,
                        ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
