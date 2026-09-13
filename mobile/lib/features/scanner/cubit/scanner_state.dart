import 'package:equatable/equatable.dart';
import '../../../shared/models/medicine_model.dart';

enum ScannerStatus { idle, scanning, found, notFound }

class ScannerState extends Equatable {
  final ScannerStatus status;
  final MedicineModel? medicine;

  const ScannerState({this.status = ScannerStatus.idle, this.medicine});

  ScannerState copyWith({ScannerStatus? status, MedicineModel? medicine}) {
    return ScannerState(
      status: status ?? this.status,
      medicine: medicine ?? this.medicine,
    );
  }

  @override
  List<Object?> get props => [status, medicine];
}
