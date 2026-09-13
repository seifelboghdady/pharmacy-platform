import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class StepProgress extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const StepProgress({
    super.key,
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'Step $currentStep of $totalSteps',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 13),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Row(
            children: List.generate(totalSteps, (i) {
              final active = i < currentStep;
              return Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  height: 5,
                  decoration: BoxDecoration(
                    color: active ? AppColors.success : AppColors.border,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}
