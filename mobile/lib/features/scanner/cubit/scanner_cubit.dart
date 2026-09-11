import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/data/medicine_repository.dart';
import 'scanner_state.dart';

/// Resolves a scanned/entered barcode via [MedicineRepository].
class ScannerCubit extends Cubit<ScannerState> {
  ScannerCubit({MedicineRepository? repository})
      : _repository = repository ?? MedicineRepository(),
        super(const ScannerState());

  final MedicineRepository _repository;

  Future<void> lookupCode(String code) async {
    emit(state.copyWith(status: ScannerStatus.scanning));
    try {
      final medicine = await _repository.findByBarcode(code);
      if (medicine == null) {
        emit(state.copyWith(status: ScannerStatus.notFound));
        return;
      }
      emit(state.copyWith(status: ScannerStatus.found, medicine: medicine));
    } catch (e) {
      emit(state.copyWith(status: ScannerStatus.notFound));
    }
  }

  void reset() => emit(const ScannerState());
}
