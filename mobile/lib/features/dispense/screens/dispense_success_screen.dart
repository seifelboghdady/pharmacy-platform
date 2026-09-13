import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../shared/models/medicine_model.dart';
import '../../dashboard/screens/dashboard_screen.dart';

class DispenseSuccessScreen extends StatelessWidget {
  final MedicineModel medicine;
  final int quantity;

  const DispenseSuccessScreen({
    super.key,
    required this.medicine,
    required this.quantity,
  });

  @override
  Widget build(BuildContext context) {
    final total = medicine.price * quantity;
    final remaining = medicine.stock - quantity;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 96,
                width: 96,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Iconsax.tick_circle,
                    color: Colors.white, size: 52),
              ),
              const SizedBox(height: 24),
              const Text('Dispensed Successfully!',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(medicine.name,
                  style: const TextStyle(color: AppColors.textGrey)),
              const SizedBox(height: 28),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _Row(label: 'Quantity', value: '$quantity boxes'),
                    _Row(
                        label: 'Total Price',
                        value: '${total.toStringAsFixed(0)} EGP'),
                    _Row(
                        label: 'Remaining Stock',
                        value: '$remaining boxes'),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              PrimaryButton(
                label: 'Done',
                onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const DashboardScreen()),
                  (route) => false,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textGrey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
