import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../shared/models/medicine_model.dart';
import '../constants/app_colors.dart';

class MedicineCard extends StatelessWidget {
  final MedicineModel medicine;
  final VoidCallback? onTap;

  const MedicineCard({super.key, required this.medicine, this.onTap});

  @override
  Widget build(BuildContext context) {
    Color stockColor;
    String stockLabel;
    if (medicine.isOutOfStock) {
      stockColor = AppColors.danger;
      stockLabel = 'Out of Stock';
    } else if (medicine.isLowStock) {
      stockColor = AppColors.warning;
      stockLabel = 'Stock: ${medicine.stock}';
    } else {
      stockColor = AppColors.success;
      stockLabel = 'Stock: ${medicine.stock}';
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              height: 46,
              width: 46,
              decoration: BoxDecoration(
                color: AppColors.chipGrey,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Iconsax.health,
                  color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(medicine.name,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(stockLabel,
                      style: TextStyle(color: stockColor, fontSize: 12.5)),
                ],
              ),
            ),
            Text(
              '${medicine.price.toStringAsFixed(0)} EGP',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}
