import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/primary_button.dart';
import '../cubit/dispense_cubit.dart';
import '../cubit/dispense_state.dart';
import '../../../shared/models/medicine_model.dart';
import 'dispense_success_screen.dart';

class SelectQuantityScreen extends StatelessWidget {
  final MedicineModel medicine;
  const SelectQuantityScreen({super.key, required this.medicine});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DispenseCubit(medicine),
      child: const _SelectQuantityView(),
    );
  }
}

class _SelectQuantityView extends StatelessWidget {
  const _SelectQuantityView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text(context.read<DispenseCubit>().state.medicine.name)),
      body: SafeArea(
        child: BlocConsumer<DispenseCubit, DispenseState>(
          listener: (context, state) {
            if (state.status == DispenseStatus.error) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Failed to dispense medicine')),
              );
            } else if (state.status == DispenseStatus.success) {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(
                  builder: (_) => DispenseSuccessScreen(
                    medicine: state.medicine,
                    quantity: state.quantity,
                  ),
                ),
              );
            }
          },
          builder: (context, state) {
            final cubit = context.read<DispenseCubit>();
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(state.medicine.category,
                      style: const TextStyle(color: AppColors.textGrey)),
                  const SizedBox(height: 4),
                  Text('Available Stock: ${state.medicine.stock} boxes',
                      style: const TextStyle(
                          color: AppColors.success, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 28),
                  const Text('Select Quantity',
                      style: TextStyle(
                          fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _RoundIconButton(
                        icon: Iconsax.minus,
                        onTap: cubit.decrement,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 28),
                        child: Text('${state.quantity}',
                            style: const TextStyle(
                                fontSize: 26, fontWeight: FontWeight.w800)),
                      ),
                      _RoundIconButton(
                        icon: Iconsax.add,
                        onTap: cubit.increment,
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _SummaryRow(
                            label: 'Total Price',
                            value:
                                '${state.totalPrice.toStringAsFixed(0)} EGP'),
                        _SummaryRow(
                            label: 'Remaining Stock',
                            value: '${state.remainingStock} boxes'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    label: 'Confirm Dispense',
                    isLoading: state.status == DispenseStatus.dispensing,
                    onPressed: cubit.confirmDispense,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _RoundIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        height: 48,
        width: 48,
        decoration: BoxDecoration(
          color: AppColors.chipGrey,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Icon(icon, color: AppColors.primary),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textGrey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
