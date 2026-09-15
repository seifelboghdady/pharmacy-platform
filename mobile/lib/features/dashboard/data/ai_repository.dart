import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../shared/models/medicine_model.dart';
import '../../../core/network/api_service.dart';
class AiPrediction{final double predictedDemand;final int reorderQuantity;final double expiryScore;final String riskLevel;final String medicineName;const AiPrediction({required this.predictedDemand,required this.reorderQuantity,required this.expiryScore,required this.riskLevel,required this.medicineName});}
class AiRepository{
 static const baseUrl='https://pharmteck-ai.up.railway.app';
 final ApiService _api = ApiService.instance;

 Future<AiPrediction?> getDashboardPrediction(List<MedicineModel> medicines) async {
  if (medicines.isEmpty) return null;
  final sorted = [...medicines]..sort((a,b) => a.stock.compareTo(b.stock));
  final medicine = sorted.first;
  double recentSales = 0;
  try {
   final response = await _api.get('/api/dispensing-transactions');
   final data = response is Map<String,dynamic> ? response['data'] ?? response : response;
   final List items = data is List ? data : (data is Map<String,dynamic> && data['transactions'] is List ? data['transactions'] as List : const []);
   for (final raw in items.whereType<Map>()) {
    final t = Map<String,dynamic>.from(raw);
    final medicineRaw = t['medicine'];
    final txMedicineId = medicineRaw is Map ? (medicineRaw['_id'] ?? medicineRaw['id']).toString() : medicineRaw?.toString();
    if (txMedicineId == medicine.id) {
     recentSales += (t['quantity'] is num) ? (t['quantity'] as num).toDouble() : double.tryParse('${t['quantity']}') ?? 0;
    }
   }
  } catch (_) {}
  return predict(medicine: medicine, recentSales: recentSales);
 }
 Future<AiPrediction> predict({required MedicineModel medicine,required double recentSales})async{
  final expiry=DateTime.tryParse(medicine.expiryDate);final shelfLife=expiry==null?0:expiry.difference(DateTime.now()).inDays;
  final r=await http.post(Uri.parse('$baseUrl/predict'),headers:const {'Content-Type':'application/json'},body:jsonEncode({'product_id':medicine.catalogId.isNotEmpty?medicine.catalogId:medicine.id,'current_stock':medicine.stock,'recent_sales':recentSales,'shelf_life':shelfLife, 'barcode': medicine.barcode,})).timeout(const Duration(seconds:20));
  if(r.statusCode<200||r.statusCode>=300)throw Exception('AI prediction failed');final j=jsonDecode(r.body);if(j is! Map)throw Exception('Invalid AI response');
  return AiPrediction(predictedDemand:(j['predicted_demand'] as num?)?.toDouble()??0,reorderQuantity:(j['reorder_quantity'] as num?)?.toInt()??0,expiryScore:(j['expiry_score'] as num?)?.toDouble()??0,riskLevel:(j['risk_level']??'Unknown').toString(),medicineName:medicine.name);
 }
}
