import 'package:equatable/equatable.dart';

enum DashboardStatus { loading, loaded, error }

class DashboardAiInsight {
  final String medicineName;
  final double predictedDemand;
  final int reorderQuantity;
  final double expiryScore;
  final String riskLevel;
  const DashboardAiInsight({required this.medicineName, required this.predictedDemand, required this.reorderQuantity, required this.expiryScore, required this.riskLevel});
}

class DashboardState extends Equatable {
  final DashboardStatus status;
  final String pharmacistName;
  final int totalMedicines;
  final int lowStock;
  final int outOfStock;
  final DashboardAiInsight? aiInsight;

  const DashboardState({
    this.status = DashboardStatus.loading,
    this.pharmacistName = '',
    this.totalMedicines = 0,
    this.lowStock = 0,
    this.outOfStock = 0,
    this.aiInsight,
  });

  DashboardState copyWith({
    DashboardStatus? status,
    String? pharmacistName,
    int? totalMedicines,
    int? lowStock,
    int? outOfStock,
    DashboardAiInsight? aiInsight,
  }) {
    return DashboardState(
      status: status ?? this.status,
      pharmacistName: pharmacistName ?? this.pharmacistName,
      totalMedicines: totalMedicines ?? this.totalMedicines,
      lowStock: lowStock ?? this.lowStock,
      outOfStock: outOfStock ?? this.outOfStock,
      aiInsight: aiInsight ?? this.aiInsight,
    );
  }

  @override
  List<Object?> get props =>
      [status, pharmacistName, totalMedicines, lowStock, outOfStock, aiInsight];
}
