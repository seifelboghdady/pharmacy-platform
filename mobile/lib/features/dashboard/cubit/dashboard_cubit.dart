import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/data/medicine_repository.dart';
import 'dashboard_state.dart';

/// The API has no dedicated dashboard/summary endpoint, so the stats
/// below are derived from [MedicineRepository]. If a real summary
/// endpoint is added later, only this class needs to change.
class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit({
    String pharmacistName = '',
    MedicineRepository? repository,
  })  : _repository = repository ?? MedicineRepository(),
        super(DashboardState(pharmacistName: pharmacistName)) {
    loadDashboard();
  }

  final MedicineRepository _repository;

  Future<void> loadDashboard() async {
    emit(state.copyWith(status: DashboardStatus.loading));
    try {
      final medicines = await _repository.fetchMedicines(limit: 500);
      final lowStock = medicines.where((m) => m.isLowStock).length;
      final outOfStock = medicines.where((m) => m.isOutOfStock).length;
      emit(state.copyWith(
        status: DashboardStatus.loaded,
        totalMedicines: medicines.length,
        lowStock: lowStock,
        outOfStock: outOfStock,
      ));
    } catch (e) {
      emit(state.copyWith(status: DashboardStatus.error));
    }
  }
}
