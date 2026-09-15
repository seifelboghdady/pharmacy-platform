import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _todaySales = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await ApiService.instance.get('/api/dispensing-transactions');
      final data = response is Map<String, dynamic>
          ? response['data'] ?? response
          : response;
      final raw = data is List
          ? data
          : (data is Map<String, dynamic> && data['transactions'] is List
              ? data['transactions'] as List
              : const []);

      final now = DateTime.now();
      final sales = raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).where((tx) {
        final created = DateTime.tryParse('${tx['createdAt'] ?? ''}')?.toLocal();
        return created != null &&
            created.year == now.year &&
            created.month == now.month &&
            created.day == now.day;
      }).toList();

      if (!mounted) return;
      setState(() {
        _todaySales = sales;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  double get _totalSales => _todaySales.fold<double>(0, (sum, tx) {
    final value = tx['totalPrice'];
    return sum + (value is num ? value.toDouble() : double.tryParse('$value') ?? 0);
  });

  int get _unitsSold => _todaySales.fold<int>(0, (sum, tx) {
    final value = tx['quantity'];
    return sum + (value is num ? value.toInt() : int.tryParse('$value') ?? 0);
  });

  String _medicineName(Map<String, dynamic> tx) {
    final medicine = tx['medicine'];
    if (medicine is Map) {
      final nestedCatalog = medicine['medicineCatalog'];
      if (nestedCatalog is Map && nestedCatalog['name'] != null) {
        return nestedCatalog['name'].toString();
      }
      if (medicine['name'] != null) return medicine['name'].toString();
    }
    return 'Medicine sale';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Reports')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [SizedBox(height: 280), Center(child: CircularProgressIndicator())],
              )
            : _error != null
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [const SizedBox(height: 220), Center(child: Text(_error!))],
                  )
                : ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    children: [
                      const Text('Today', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(child: _Metric(title: 'Sales', value: '${_totalSales.toStringAsFixed(2)} EGP', icon: Iconsax.money_4)),
                          const SizedBox(width: 12),
                          Expanded(child: _Metric(title: 'Units Sold', value: '$_unitsSold', icon: Iconsax.box_1)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _Metric(title: 'Transactions', value: '${_todaySales.length}', icon: Iconsax.receipt_text),
                      const SizedBox(height: 20),
                      const Text("Today's Sales", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 10),
                      if (_todaySales.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                          child: const Text('No sales recorded today.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textGrey)),
                        )
                      else
                        ..._todaySales.map((tx) => Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                              child: Row(children: [
                                const CircleAvatar(backgroundColor: AppColors.chipGrey, child: Icon(Iconsax.health, color: AppColors.primary)),
                                const SizedBox(width: 12),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(_medicineName(tx), style: const TextStyle(fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 3),
                                  Text('Qty: ${tx['quantity'] ?? 0}', style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
                                ])),
                                Text('${(tx['totalPrice'] is num ? (tx['totalPrice'] as num).toDouble() : double.tryParse('${tx['totalPrice']}') ?? 0).toStringAsFixed(2)} EGP', style: const TextStyle(fontWeight: FontWeight.w800)),
                              ]),
                            )),
                    ],
                  ),
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  const _Metric({required this.title, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Row(children: [
        Container(width: 42, height: 42, decoration: BoxDecoration(color: AppColors.chipGrey, borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: AppColors.primary)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(height: 3),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        ])),
      ]),
    );
  }
}