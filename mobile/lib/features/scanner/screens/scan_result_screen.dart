import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../shared/models/medicine_model.dart';
import '../../dispense/screens/select_quantity_screen.dart';

class ScanResultScreen extends StatelessWidget {
  final MedicineModel medicine;
  const ScanResultScreen({super.key, required this.medicine});

  @override
  Widget build(BuildContext context) {
    final outOfStock = medicine.isOutOfStock;
    return Scaffold(
      appBar: AppBar(title: Text(medicine.name)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    height: 60,
                    width: 60,
                    decoration: BoxDecoration(
                      color: AppColors.chipGrey,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Iconsax.health,
                        color: AppColors.primary, size: 30),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(medicine.name,
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w800)),
                      Text(medicine.category,
                          style:
                              const TextStyle(color: AppColors.textGrey)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _DetailRow(
                label: 'Stock Available',
                value: outOfStock ? 'Out of stock' : '${medicine.stock} boxes',
                valueColor: outOfStock ? AppColors.danger : AppColors.success,
              ),
              _DetailRow(
                  label: 'Price', value: '${medicine.price.toStringAsFixed(0)} EGP'),
              _DetailRow(label: 'Expiry Date', value: medicine.expiryDate),
              _DetailRow(label: 'Manufacturer', value: medicine.manufacturer),
              const Spacer(),
              if (outOfStock)
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.danger.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          const Icon(Iconsax.warning_2,
                              color: AppColors.danger),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'This medicine is currently out of stock.',
                              style: TextStyle(
                                  color: AppColors.danger.withOpacity(0.9)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    PrimaryButton(
                        label: 'View Alternatives', onPressed: () {}),
                  ],
                )
              else
                PrimaryButton(
                  label: 'View Full Details',
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => SelectQuantityScreen(medicine: medicine),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _DetailRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textGrey)),
          Text(value,
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: valueColor ?? AppColors.textDark)),
        ],
      ),
    );
  }
}
