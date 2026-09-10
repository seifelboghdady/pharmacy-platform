import 'package:equatable/equatable.dart';
import '../../../shared/models/medicine_model.dart';

enum DispenseStatus { selecting, dispensing, success, error }

class DispenseState extends Equatable {
  final DispenseStatus status;
  final MedicineModel medicine;
  final int quantity;

  const DispenseState({
    this.status = DispenseStatus.selecting,
    required this.medicine,
    this.quantity = 1,
  });

  double get totalPrice => medicine.price * quantity;
  int get remainingStock => medicine.stock - quantity;

  DispenseState copyWith({
    DispenseStatus? status,
    int? quantity,
  }) {
    return DispenseState(
      status: status ?? this.status,
      medicine: medicine,
      quantity: quantity ?? this.quantity,
    );
  }

  @override
  List<Object?> get props => [status, medicine, quantity];
}
