import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/medicine_card.dart';
import '../cubit/inventory_cubit.dart';
import '../cubit/inventory_state.dart';
import 'filter_search_screen.dart';

class MedicinesListScreen extends StatelessWidget {
  const MedicinesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => InventoryCubit(),
      child: const _MedicinesListView(),
    );
  }
}

class _MedicinesListView extends StatelessWidget {
  const _MedicinesListView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicines'),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.setting_4),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => BlocProvider.value(
                  value: context.read<InventoryCubit>(),
                  child: const FilterSearchScreen(),
                ),
              ),
            ),
          ),
        ],
      ),
      body: BlocBuilder<InventoryCubit, InventoryState>(
        builder: (context, state) {
          if (state.status == InventoryStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == InventoryStatus.error) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.wifi_off_rounded,
                        size: 40, color: AppColors.textGrey),
                    const SizedBox(height: 12),
                    const Text('Couldn\'t load medicines',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textGrey)),
                    const SizedBox(height: 16),
                    OutlinedButton(
                      onPressed: () =>
                          context.read<InventoryCubit>().loadMedicines(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }
          final medicines = state.filteredMedicines;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: TextField(
                  onChanged: context.read<InventoryCubit>().search,
                  decoration: const InputDecoration(
                    hintText: 'Search medicines...',
                    prefixIcon: Icon(Iconsax.search_normal_1),
                  ),
                ),
              ),
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: const [
                    _FilterChip(label: 'All', selected: true),
                    _FilterChip(label: 'Available'),
                    _FilterChip(label: 'Out of Stock'),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: medicines.isEmpty
                    ? const Center(child: Text('No medicines found'))
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                        itemCount: medicines.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, i) =>
                            MedicineCard(medicine: medicines[i]),
                      ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 1,
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

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  const _FilterChip({required this.label, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Chip(
        label: Text(label),
        backgroundColor: selected ? AppColors.primary : AppColors.chipGrey,
        labelStyle: TextStyle(
          color: selected ? Colors.white : AppColors.textDark,
          fontSize: 12.5,
        ),
        side: BorderSide.none,
      ),
    );
  }
}
