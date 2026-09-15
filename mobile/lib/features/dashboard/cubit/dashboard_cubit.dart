import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/data/medicine_repository.dart';
import '../data/ai_repository.dart';
import 'dashboard_state.dart';

/// The API has no dedicated dashboard/summary endpoint, so the stats
/// below are derived from [MedicineRepository]. If a real summary
/// endpoint is added later, only this class needs to change.
class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit({
    String pharmacistName = '',
    MedicineRepository? repository,
    AiRepository? aiRepository,
  })  : _repository = repository ?? MedicineRepository(),
        _aiRepository = aiRepository ?? AiRepository(),
        super(DashboardState(pharmacistName: pharmacistName)) {
    loadDashboard();
  }

  final MedicineRepository _repository;
  final AiRepository _aiRepository;

  Future<void> loadDashboard() async {
    emit(state.copyWith(status: DashboardStatus.loading));
    try {
      final medicines = await _repository.fetchMedicines(limit: 500);
      final lowStock = medicines.where((m) => m.isLowStock).length;
      final outOfStock = medicines.where((m) => m.isOutOfStock).length;
      DashboardAiInsight? insight;
      try {
        final ai = await _aiRepository.getDashboardPrediction(medicines);
        if (ai != null) {
          insight = DashboardAiInsight(
            medicineName: ai.medicineName,
            predictedDemand: ai.predictedDemand,
            reorderQuantity: ai.reorderQuantity,
            expiryScore: ai.expiryScore,
            riskLevel: ai.riskLevel,
          );
        }
      } catch (_) {}
      emit(state.copyWith(
        status: DashboardStatus.loaded,
        totalMedicines: medicines.length,
        lowStock: lowStock,
        outOfStock: outOfStock,
        aiInsight: insight,
      ));
    } catch (e) {
      emit(state.copyWith(status: DashboardStatus.error));
    }
  }
}
