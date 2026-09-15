import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/models/missing_medicine_model.dart';
import '../../missing_medicines/data/missing_medicine_repository.dart';
import '../../../core/network/api_service.dart';

class CreateOrderScreen extends StatefulWidget {
  final List<MissingMedicineModel> medicines;

  const CreateOrderScreen({
    super.key,
    required this.medicines,
  });

  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  late List<MissingMedicineModel> _medicines;
  final MissingMedicineRepository _repository =
    MissingMedicineRepository();
  bool _isCreatingOrder = false;
  Future<void> _createOrder() async {
    if (_isCreatingOrder) return;

    setState(() {
      _isCreatingOrder = true;
    });

    try {
      await _repository.generateOrderFromMissing();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Purchase order created successfully'),
        ),
      );

      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ApiService.friendlyError(e)),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isCreatingOrder = false;
        });
      }
    }
  }
  @override
  void initState() {
    super.initState();
    _medicines = List.from(widget.medicines);
  }

  void _removeMedicine(String id) {
    setState(() {
      _medicines.removeWhere((medicine) => medicine.id == id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(
            Iconsax.arrow_left_2,
            color: AppColors.textDark,
          ),
        ),
        title: const Text(
          'Create Purchase Order',
          style: TextStyle(
            color: AppColors.textDark,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _medicines.isEmpty
                ? _buildEmptyState()
                : ListView(
                    padding: const EdgeInsets.fromLTRB(
                      16,
                      8,
                      16,
                      24,
                    ),
                    children: [
                      Text(
                        'Selected Medicines (${_medicines.length})',
                        style: const TextStyle(
                          color: AppColors.textDark,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 14),

                      ..._medicines.map(
                        (medicine) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _OrderMedicineCard(
                            medicine: medicine,
                            onRemove: () {
                              _removeMedicine(medicine.id);
                            },
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.chipGrey,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Iconsax.info_circle,
                              size: 20,
                              color: AppColors.textGrey,
                            ),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'The quantities are based on the shortage requests. You can review them before creating the order.',
                                style: TextStyle(
                                  color: AppColors.textGrey,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),

          if (_medicines.isNotEmpty)
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  16,
                  8,
                  16,
                  16,
                ),
                child: ElevatedButton(
                  onPressed: _isCreatingOrder ? null : _createOrder,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(
                      double.infinity,
                      52,
                    ),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isCreatingOrder
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Create Purchase Order',
                          style: TextStyle(
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

  Widget _buildEmptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Iconsax.box_remove,
              size: 48,
              color: AppColors.textGrey,
            ),
            SizedBox(height: 14),
            Text(
              'No medicines selected',
              style: TextStyle(
                color: AppColors.textDark,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderMedicineCard extends StatelessWidget {
  final MissingMedicineModel medicine;
  final VoidCallback onRemove;

  const _OrderMedicineCard({
    required this.medicine,
    required this.onRemove,
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
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  medicine.medicineName,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                if (medicine.barcode.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  Text(
                    'Barcode: ${medicine.barcode}',
                    style: const TextStyle(
                      color: AppColors.textGrey,
                      fontSize: 12,
                    ),
                  ),
                ],

                const SizedBox(height: 10),

                Row(
                  children: [
                    const Text(
                      'Required:',
                      style: TextStyle(
                        color: AppColors.textGrey,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${medicine.requiredQuantity}',
                      style: const TextStyle(
                        color: AppColors.textDark,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          IconButton(
            onPressed: onRemove,
            icon: const Icon(
              Iconsax.trash,
              size: 19,
              color: AppColors.textGrey,
            ),
          ),
        ],
      ),
    );
  }
}