import 'package:equatable/equatable.dart';

import '../../../shared/models/medicine_model.dart';

enum ScannerStatus {
  idle,
  scanning,
  found,
  notFound,
}

class ScannerState extends Equatable {
  final ScannerStatus status;
  final MedicineModel? medicine;
  final String? barcode;

  const ScannerState({
    this.status = ScannerStatus.idle,
    this.medicine,
    this.barcode,
  });

  ScannerState copyWith({
    ScannerStatus? status,
    MedicineModel? medicine,
    String? barcode,
  }) {
    return ScannerState(
      status: status ?? this.status,
      medicine: medicine ?? this.medicine,
      barcode: barcode ?? this.barcode,
    );
  }

  @override
  List<Object?> get props => [
        status,
        medicine,
        barcode,
      ];
}