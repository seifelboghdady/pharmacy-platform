import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../cubit/dashboard_cubit.dart';
import '../cubit/dashboard_state.dart';
import '../../scanner/screens/qr_scanner_screen.dart';
import '../../inventory/screens/medicines_list_screen.dart';
import 'quick_actions_screen.dart';

class DashboardScreen extends StatelessWidget {
  final String pharmacistName;
  const DashboardScreen({super.key, this.pharmacistName = ''});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DashboardCubit(pharmacistName: pharmacistName),
      child: const _DashboardView(),
    );
  }
}

class _DashboardView extends StatelessWidget {
  const _DashboardView();

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  static String _formattedToday() {
    final now = DateTime.now();
    final day = now.day.toString().padLeft(2, '0');
    final month = _months[now.month - 1];
    final year = now.year;
    return 'Today, $day $month $year';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<DashboardCubit, DashboardState>(
          builder: (context, state) {
            if (state.status == DashboardStatus.loading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state.status == DashboardStatus.error) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.wifi_off_rounded,
                          size: 40, color: AppColors.textGrey),
                      const SizedBox(height: 12),
                      const Text('Couldn\'t load dashboard data',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.textGrey)),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: () =>
                            context.read<DashboardCubit>().loadDashboard(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              );
            }
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Good Morning, ${state.pharmacistName} 👋',
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w700)),
                          Text(_formattedToday(),
                              style: const TextStyle(
                                  color: AppColors.textGrey, fontSize: 12.5)),
                        ],
                      ),
                      const CircleAvatar(
                        backgroundColor: AppColors.chipGrey,
                        child: Icon(Iconsax.user, color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Total Medicines',
                          value: '${state.totalMedicines}',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: 'Low Stock',
                          value: '${state.lowStock}',
                          valueColor: AppColors.warning,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _StatCard(
                    title: 'Out of Stock',
                    value: '${state.outOfStock}',
                    valueColor: AppColors.danger,
                  ),
                  const SizedBox(height: 24),
                  const Text('Quick Actions',
                      style: TextStyle(
                          fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 4,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.85,
                    children: [
                      _QuickAction(
                        icon: Iconsax.scan_barcode,
                        label: 'Dispense',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const QrScannerScreen()),
                        ),
                      ),
                      _QuickAction(
                        icon: Iconsax.box_add,
                        label: 'Add Shortage',
                        onTap: () {},
                      ),
                      _QuickAction(
                        icon: Iconsax.add_square,
                        label: 'Add Order',
                        onTap: () {},
                      ),
                      _QuickAction(
                        icon: Iconsax.health,
                        label: 'View Medicines',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const MedicinesListScreen()),
                        ),
                      ),
                      _QuickAction(
                        icon: Iconsax.chart_2,
                        label: 'View Reports',
                        onTap: () {},
                      ),
                      _QuickAction(
                        icon: Iconsax.setting_2,
                        label: 'Settings',
                        onTap: () {},
                      ),
                      _QuickAction(
                        icon: Iconsax.grid_5,
                        label: 'More',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const QuickActionsScreen()),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(icon: Icon(Iconsax.home_2), label: 'Home'),
          NavigationDestination(
              icon: Icon(Iconsax.health), label: 'Medicines'),
          NavigationDestination(
              icon: Icon(Iconsax.receipt_2_1), label: 'Orders'),
          NavigationDestination(
              icon: Icon(Iconsax.grid_5), label: 'More'),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? trend;
  final bool trendUp;
  final Color? valueColor;

  const _StatCard({
    required this.title,
    required this.value,
    this.trend,
    this.trendUp = true,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style:
                  const TextStyle(color: AppColors.textGrey, fontSize: 12.5)),
          const SizedBox(height: 6),
          Text(value,
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: valueColor ?? AppColors.textDark)),
          if (trend != null) ...[
            const SizedBox(height: 4),
            Text(trend!,
                style: TextStyle(
                    fontSize: 11,
                    color: trendUp ? AppColors.success : AppColors.danger)),
          ],
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 52,
            width: 52,
            decoration: BoxDecoration(
              color: AppColors.chipGrey,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(height: 6),
          Text(label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10.5)),
        ],
      ),
    );
  }
}
