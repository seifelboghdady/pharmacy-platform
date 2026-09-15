import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';
import '../../../shared/models/missing_medicine_model.dart';
import '../data/missing_medicine_repository.dart';
import '../../orders/screens/create_order_screen.dart';

class MissingMedicinesScreen extends StatefulWidget {
  const MissingMedicinesScreen({super.key});

  @override
  State<MissingMedicinesScreen> createState() =>
      _MissingMedicinesScreenState();
}

class _MissingMedicinesScreenState extends State<MissingMedicinesScreen> {
  final MissingMedicineRepository _repository =
      MissingMedicineRepository();

  final Set<String> _selectedMedicineIds = {};

  List<MissingMedicineModel> _medicines = [];
  bool _isLoading = true;
  String? _error;
  
  void _toggleSelection(String id) {
    setState(() {
      if (_selectedMedicineIds.contains(id)) {
        _selectedMedicineIds.remove(id);
      } else {
        _selectedMedicineIds.add(id);
      }
    });
  }
  @override
  void initState() {
    super.initState();
    _loadMissingMedicines();
  }

  Future<void> _loadMissingMedicines() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final medicines = await _repository.getMissingMedicines();

      if (!mounted) return;

      setState(() {
        _medicines = medicines;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        return AppColors.success;

      case 'cancelled':
      case 'rejected':
        return AppColors.danger;

      default:
        return AppColors.warning;
    }
  }

  String _statusText(String status) {
    if (status.isEmpty) return 'Pending';

    return status
        .replaceAll('_', ' ')
        .split(' ')
        .map(
          (word) => word.isEmpty
              ? word
              : '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}',
        )
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: const Text(
          'Missing Medicines',
          style: TextStyle(
            color: AppColors.textDark,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _loadMissingMedicines,
            child: _buildBody(),
          ),

          if (_selectedMedicineIds.isNotEmpty)
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: () {
                    final selectedMedicines = _medicines
                    .where(
                      (medicine) =>
                          _selectedMedicineIds.contains(medicine.id),
                    )
                    .toList();

                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => CreateOrderScreen(
                      medicines: selectedMedicines,
                    ),
                  ),
                );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 52),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    '${_selectedMedicineIds.length} Selected  •  Create Order',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
        ),
      );
    }

    if (_error != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 180),
          Icon(
            Iconsax.warning_2,
            size: 48,
            color: AppColors.danger,
          ),
          const SizedBox(height: 16),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: TextButton(
              onPressed: _loadMissingMedicines,
              child: const Text('Try Again'),
            ),
          ),
        ],
      );
    }

    if (_medicines.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 180),
          Icon(
            Iconsax.box_tick,
            size: 52,
            color: AppColors.textGrey,
          ),
          SizedBox(height: 16),
          Center(
            child: Text(
              'No missing medicines',
              style: TextStyle(
                color: AppColors.textDark,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          SizedBox(height: 8),
          Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'There are no shortage requests at the moment.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: _medicines.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _MissingMedicineCard(
          medicine: _medicines[index],
          statusColor: _statusColor(_medicines[index].status),
          statusText: _statusText(_medicines[index].status),
          isSelected: _selectedMedicineIds.contains(
            _medicines[index].id,
          ),
          onSelected: () {
            _toggleSelection(_medicines[index].id);
          },
        );      },
    );
    
  }
}

class _MissingMedicineCard extends StatelessWidget {
  final MissingMedicineModel medicine;
  final Color statusColor;
  final String statusText;
  final bool isSelected;
  final VoidCallback onSelected;

  const _MissingMedicineCard({
    required this.medicine,
    required this.statusColor,
    required this.statusText,
    required this.isSelected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  medicine.medicineName,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              _StatusChip(
                text: statusText,
                color: statusColor,
              ),
            ],
          ),

          if (medicine.barcode.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Barcode: ${medicine.barcode}',
              style: const TextStyle(
                color: AppColors.textGrey,
                fontSize: 12,
              ),
            ),
          ],

          const SizedBox(height: 14),

          Row(
              children: [
                GestureDetector(
                  onTap: onSelected,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.border,
                        width: 1.5,
                      ),
                    ),
                    child: isSelected
                        ? const Icon(
                            Icons.check,
                            size: 17,
                            color: Colors.white,
                          )
                        : null,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Text(
                    medicine.medicineName,
                    style: const TextStyle(
                      color: AppColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),

                _StatusChip(
                  text: statusText,
                  color: statusColor,
                ),
              ],
            ),
          if (medicine.notes.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.chipGrey,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                medicine.notes,
                style: const TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String text;
  final Color color;

  const _StatusChip({
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}