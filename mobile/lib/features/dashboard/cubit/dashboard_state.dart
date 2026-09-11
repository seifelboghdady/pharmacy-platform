import 'package:equatable/equatable.dart';

enum DashboardStatus { loading, loaded, error }

class DashboardState extends Equatable {
  final DashboardStatus status;
  final String pharmacistName;
  final int totalMedicines;
  final int lowStock;
  final int outOfStock;

  const DashboardState({
    this.status = DashboardStatus.loading,
    this.pharmacistName = '',
    this.totalMedicines = 0,
    this.lowStock = 0,
    this.outOfStock = 0,
  });

  DashboardState copyWith({
    DashboardStatus? status,
    String? pharmacistName,
    int? totalMedicines,
    int? lowStock,
    int? outOfStock,
  }) {
    return DashboardState(
      status: status ?? this.status,
      pharmacistName: pharmacistName ?? this.pharmacistName,
      totalMedicines: totalMedicines ?? this.totalMedicines,
      lowStock: lowStock ?? this.lowStock,
      outOfStock: outOfStock ?? this.outOfStock,
    );
  }

  @override
  List<Object?> get props =>
      [status, pharmacistName, totalMedicines, lowStock, outOfStock];
}
