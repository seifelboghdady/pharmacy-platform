import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../scanner/screens/qr_scanner_screen.dart';
import '../../inventory/screens/medicines_list_screen.dart';

class _Action {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  const _Action(this.icon, this.title, this.subtitle, {this.onTap});

  const _Action.plain(this.icon, this.title, this.subtitle) : onTap = null;
}

class QuickActionsScreen extends StatelessWidget {
  const QuickActionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _Action(Iconsax.scan_barcode, 'Dispense Medicine',
          'Scan QR to dispense',
          onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const QrScannerScreen()))),
      const _Action.plain(
          Iconsax.box_add, 'Add Shortage', 'Add medicine shortage'),
      const _Action.plain(
          Iconsax.add_square, 'Add Order', 'Create new order'),
      _Action(Iconsax.health, 'View Medicines', 'Browse all medicines',
          onTap: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => const MedicinesListScreen()))),
      const _Action.plain(
          Iconsax.chart_2, 'View Reports', 'See reports & analytics'),
      const _Action.plain(
          Iconsax.setting_2, 'Settings', 'App preferences'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Quick Actions')),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: actions.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, i) {
          final a = actions[i];
          return InkWell(
            onTap: a.onTap,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      color: AppColors.chipGrey,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(a.icon, color: AppColors.primary),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.title,
                            style:
                                const TextStyle(fontWeight: FontWeight.w700)),
                        Text(a.subtitle,
                            style: const TextStyle(
                                color: AppColors.textGrey, fontSize: 12.5)),
                      ],
                    ),
                  ),
                  const Icon(Iconsax.arrow_right_3, color: AppColors.textGrey),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
