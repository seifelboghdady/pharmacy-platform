import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/models/medicine_model.dart';

class MedicineDetailsScreen extends StatelessWidget {
  final MedicineModel medicine;

  const MedicineDetailsScreen({super.key, required this.medicine});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Medicine Details')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.chipGrey,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Iconsax.health, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(medicine.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text(medicine.category.isEmpty ? 'Medicine' : medicine.category, style: const TextStyle(color: AppColors.textGrey)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _Info('Barcode', medicine.barcode),
          _Info('Active Ingredient', medicine.activeIngredient),
          _Info('Manufacturer', medicine.manufacturer),
          _Info('Stock', '${medicine.stock}'),
          _Info('Price', '${medicine.price.toStringAsFixed(2)} EGP'),
          _Info('Expiry Date', medicine.expiryDate),
          _Info('Supplier', medicine.supplier),
        ],
      ),
    );
  }
}

class _Info extends StatelessWidget {
  final String title;
  final String value;
  const _Info(this.title, this.value);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 118, child: Text(title, style: const TextStyle(color: AppColors.textGrey, fontSize: 12))),
          const SizedBox(width: 10),
          Expanded(child: Text(value.isEmpty ? '—' : value, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }
}
