import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/data/medicine_repository.dart';
import 'inventory_state.dart';

class InventoryCubit extends Cubit<InventoryState> {
  InventoryCubit({MedicineRepository? repository})
      : _repository = repository ?? MedicineRepository(),
        super(const InventoryState()) {
    loadMedicines();
  }

  final MedicineRepository _repository;

  Future<void> loadMedicines() async {
    emit(state.copyWith(status: InventoryStatus.loading));
    try {
      final medicines = await _repository.fetchMedicines(limit: 100);
      emit(state.copyWith(
        status: InventoryStatus.loaded,
        allMedicines: medicines,
      ));
    } catch (e) {
      emit(state.copyWith(status: InventoryStatus.error));
    }
  }

  void search(String query) => emit(state.copyWith(searchQuery: query));

  void applyFilter(InventoryFilter filter) =>
      emit(state.copyWith(filter: filter));

  void clearFilters() => emit(state.copyWith(filter: const InventoryFilter()));
}
