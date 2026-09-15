import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../data/missing_medicine_repository.dart';
import '../../../core/network/api_service.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/models/medicine_model.dart';

class ShortageDetailsScreen extends StatefulWidget {
  final MedicineModel medicine;

  const ShortageDetailsScreen({
    super.key,
    required this.medicine,
  });

  @override
  State<ShortageDetailsScreen> createState() =>
      _ShortageDetailsScreenState();
}

class _ShortageDetailsScreenState
    extends State<ShortageDetailsScreen> {
  int _requiredQuantity = 1;
  String _reason = 'Low Stock';

  final TextEditingController _notesController =
      TextEditingController();

  final MissingMedicineRepository _repository =
    MissingMedicineRepository();
  bool _isSubmitting = false;

  bool get _hasShortage =>
      _requiredQuantity > widget.medicine.stock;

  Future<void> _submitShortage() async {
  if (_isSubmitting) return;

  setState(() {
    _isSubmitting = true;
  });

  try {
    final notes = _notesController.text.trim();

    final combinedNotes = notes.isEmpty
        ? 'Reason: $_reason'
        : 'Reason: $_reason\n$notes';

    await _repository.addShortage(
      medicineName: widget.medicine.name,
      barcode: widget.medicine.barcode,
      requiredQuantity: _requiredQuantity,
      notes: combinedNotes,
    );

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    Navigator.of(context).pop(true);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Shortage added successfully'),
      ),
    );
  } catch (e) {
    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ApiService.friendlyError(e),
        ),
      ),
    );
  }
}

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _increaseQuantity() {
    setState(() {
      _requiredQuantity++;
    });
  }

  void _decreaseQuantity() {
    if (_requiredQuantity <= 1) return;

    setState(() {
      _requiredQuantity--;
    });
  }

  @override
  Widget build(BuildContext context) {
    final medicine = widget.medicine;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shortage Details'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Medicine',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),

              const SizedBox(height: 10),

              _MedicineCard(
                medicine: medicine,
              ),

              const SizedBox(height: 28),

              const Text(
                'Required Quantity',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),

              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.border,
                  ),
                ),
                child: Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    _QuantityButton(
                      icon: Iconsax.minus,
                      onTap: _decreaseQuantity,
                    ),

                    Text(
                      '$_requiredQuantity',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                      ),
                    ),

                    _QuantityButton(
                      icon: Iconsax.add,
                      onTap: _increaseQuantity,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              const Text(
                'Reason',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),

              const SizedBox(height: 8),

              _ReasonOption(
                title: 'Low Stock',
                value: 'Low Stock',
                groupValue: _reason,
                onChanged: (value) {
                  setState(() {
                    _reason = value!;
                  });
                },
              ),

              _ReasonOption(
                title: 'Customer Request',
                value: 'Customer Request',
                groupValue: _reason,
                onChanged: (value) {
                  setState(() {
                    _reason = value!;
                  });
                },
              ),

              _ReasonOption(
                title: 'Upcoming Demand',
                value: 'Upcoming Demand',
                groupValue: _reason,
                onChanged: (value) {
                  setState(() {
                    _reason = value!;
                  });
                },
              ),

              _ReasonOption(
                title: 'Other',
                value: 'Other',
                groupValue: _reason,
                onChanged: (value) {
                  setState(() {
                    _reason = value!;
                  });
                },
              ),

              const SizedBox(height: 20),

              const Text(
                'Notes',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),

              const SizedBox(height: 10),

              TextField(
                controller: _notesController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Add additional notes...',
                  alignLabelWithHint: true,
                ),
              ),

              if (!_hasShortage) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.chipGrey,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Iconsax.info_circle,
                            size: 20,
                            color: AppColors.textGrey,
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'The available stock is enough for this quantity. '
                              'No shortage is required.',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textGrey,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),
                  ],

              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                    onPressed: (_isSubmitting || !_hasShortage)
                        ? null
                        : _submitShortage,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            'Add Shortage',
                          ),
                  ),
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _MedicineCard extends StatelessWidget {
  final MedicineModel medicine;

  const _MedicineCard({
    required this.medicine,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.border,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.chipGrey,
              borderRadius: BorderRadius.circular(13),
            ),
            child: const Icon(
              Iconsax.health,
              color: AppColors.primary,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  medicine.name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textDark,
                  ),
                ),

                if (medicine.activeIngredient
                    .isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    medicine.activeIngredient,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textGrey,
                    ),
                  ),
                ],

                const SizedBox(height: 7),

                Text(
                  'Current Stock: ${medicine.stock}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: medicine.isOutOfStock
                        ? AppColors.danger
                        : AppColors.success,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QuantityButton({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.chipGrey,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          width: 48,
          height: 44,
          child: Icon(
            icon,
            size: 20,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }
}

class _ReasonOption extends StatelessWidget {
  final String title;
  final String value;
  final String groupValue;
  final ValueChanged<String?> onChanged;

  const _ReasonOption({
    required this.title,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return RadioListTile<String>(
      contentPadding: EdgeInsets.zero,
      dense: true,
      activeColor: AppColors.primary,
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          color: AppColors.textDark,
        ),
      ),
      value: value,
      groupValue: groupValue,
      onChanged: onChanged,
    );
  }
}