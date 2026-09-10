import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/models/medicine_model.dart';
import '../data/dispense_repository.dart';
import 'dispense_state.dart';

class DispenseCubit extends Cubit<DispenseState> {
  DispenseCubit(MedicineModel medicine, {DispenseRepository? repository})
      : _repository = repository ?? DispenseRepository(),
        super(DispenseState(medicine: medicine));

  final DispenseRepository _repository;

  void increment() {
    if (state.quantity < state.medicine.stock) {
      emit(state.copyWith(quantity: state.quantity + 1));
    }
  }

  void decrement() {
    if (state.quantity > 1) {
      emit(state.copyWith(quantity: state.quantity - 1));
    }
  }

  Future<void> confirmDispense() async {
    emit(state.copyWith(status: DispenseStatus.dispensing));
    try {
      await _repository.dispense(
        medicineId: state.medicine.id,
        quantity: state.quantity,
      );
      emit(state.copyWith(status: DispenseStatus.success));
    } catch (e) {
      emit(state.copyWith(status: DispenseStatus.error));
    }
  }
}
