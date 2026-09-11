import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/primary_button.dart';
import '../cubit/inventory_cubit.dart';
import '../cubit/inventory_state.dart';

class FilterSearchScreen extends StatefulWidget {
  const FilterSearchScreen({super.key});

  @override
  State<FilterSearchScreen> createState() => _FilterSearchScreenState();
}

class _FilterSearchScreenState extends State<FilterSearchScreen> {
  late InventoryFilter _draft;

  @override
  void initState() {
    super.initState();
    _draft = context.read<InventoryCubit>().state.filter;
  }

  @override
  Widget build(BuildContext context) {
    final medicines = context.read<InventoryCubit>().state.allMedicines;
    final categories = [
      'All',
      ...{for (final m in medicines) m.category}
    ];
    final manufacturers = [
      'All',
      ...{for (final m in medicines) m.manufacturer}
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Filters'),
        actions: [
          TextButton(
            onPressed: () {
              setState(() => _draft = const InventoryFilter());
              context.read<InventoryCubit>().clearFilters();
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Availability',
                style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            _DropdownField(
              value: _draft.availability,
              items: const ['All', 'Available', 'Out of Stock'],
              onChanged: (v) =>
                  setState(() => _draft = _draft.copyWith(availability: v)),
            ),
            const SizedBox(height: 20),
            const Text('Category', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            _DropdownField(
              value: _draft.category,
              items: categories,
              onChanged: (v) =>
                  setState(() => _draft = _draft.copyWith(category: v)),
            ),
            const SizedBox(height: 20),
            const Text('Manufacturer',
                style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            _DropdownField(
              value: _draft.manufacturer,
              items: manufacturers,
              onChanged: (v) =>
                  setState(() => _draft = _draft.copyWith(manufacturer: v)),
            ),
            const SizedBox(height: 20),
            const Text('Sort By', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            _DropdownField(
              value: _draft.sortBy,
              items: const ['Name (A-Z)', 'Name (Z-A)', 'Stock (High-Low)'],
              onChanged: (v) =>
                  setState(() => _draft = _draft.copyWith(sortBy: v)),
            ),
            const Spacer(),
            PrimaryButton(
              label: 'Apply Filters',
              onPressed: () {
                context.read<InventoryCubit>().applyFilter(_draft);
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _DropdownField extends StatelessWidget {
  final String value;
  final List<String> items;
  final ValueChanged<String> onChanged;

  const _DropdownField({
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: items.contains(value) ? value : items.first,
          isExpanded: true,
          items: items
              .toSet()
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}
