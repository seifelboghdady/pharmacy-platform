import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';
import '../../../shared/models/missing_medicine_model.dart';
import '../../../shared/models/order_model.dart';
import '../data/orders_repository.dart';
import '../../inventory/screens/receive_inventory_screen.dart';

class OrdersScreen extends StatefulWidget {
  final List<MissingMedicineModel> medicines;

  const OrdersScreen({
    super.key,
    this.medicines = const [],
  });

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final OrdersRepository _repository = OrdersRepository();
  late List<MissingMedicineModel> _medicines;
  List<OrderModel> _orders = [];
  bool _isCreatingOrder = false;
  bool _isLoadingOrders = true;
  String? _ordersError;
  bool _showOrderList = false;

  @override
  void initState() {
    super.initState();
    _medicines = List.from(widget.medicines);
    _showOrderList = _medicines.isEmpty;
    if (_showOrderList) _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoadingOrders = true;
      _ordersError = null;
    });
    try {
      final orders = await _repository.getOrders();
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _isLoadingOrders = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoadingOrders = false;
        _ordersError = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _createOrder() async {
    if (_isCreatingOrder || _medicines.isEmpty) return;
    setState(() => _isCreatingOrder = true);
    try {
      await _repository.generateFromMissing();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Purchase order created successfully')),
      );
      setState(() {
        _showOrderList = true;
        _isCreatingOrder = false;
        _isLoadingOrders = true;
      });
      await _loadOrders();
    } catch (e) {
      if (!mounted) return;
      setState(() => _isCreatingOrder = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ApiService.friendlyError(e))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          onPressed: () => Navigator.pop(context, true),
          icon: const Icon(Iconsax.arrow_left_2, color: AppColors.textDark),
        ),
        title: const Text(
          'Orders',
          style: TextStyle(
            color: AppColors.textDark,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: _showOrderList ? _buildOrdersList() : _buildReview(),
    );
  }

  Widget _buildReview() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              Text(
                'Selected Medicines (${_medicines.length})',
                style: const TextStyle(
                  color: AppColors.textDark,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 14),
              ..._medicines.map(
                (medicine) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _OrderMedicineCard(medicine: medicine),
                ),
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.chipGrey,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Iconsax.info_circle, size: 20, color: AppColors.textGrey),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'All pending shortage medicines will be included in this purchase order.',
                        style: TextStyle(
                          color: AppColors.textGrey,
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: ElevatedButton(
              onPressed: _isCreatingOrder ? null : _createOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: _isCreatingOrder
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Create Purchase Order',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrdersList() {
    if (_isLoadingOrders) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_ordersError != null) {
      return Center(
        child: TextButton(
          onPressed: _loadOrders,
          child: Text(_ordersError!),
        ),
      );
    }

    if (_orders.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadOrders,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 180),
            Icon(Iconsax.box_search, size: 52, color: AppColors.textGrey),
            SizedBox(height: 14),
            Center(
              child: Text(
                'No orders yet',
                style: TextStyle(
                  color: AppColors.textDark,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadOrders,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: _orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = _orders[index];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Order ${_shortOrderId(order.id, index)}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textDark,
                        ),
                      ),
                    ),
                    _statusChip(order.status),
                  ],
                ),
                if (order.supplier.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Supplier: ${order.supplier}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textGrey),
                  ),
                ],
                const SizedBox(height: 14),
                ...order.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Iconsax.health, size: 17, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.medicineName,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textDark,
                            ),
                          ),
                        ),
                        Text(
                          'x${item.quantity}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (order.status.toLowerCase() != 'received') ...[
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final changed = await Navigator.of(context).push<bool>(
                          MaterialPageRoute(
                            builder: (_) => ReceiveInventoryScreen(order: order),
                          ),
                        );
                        if (changed == true && mounted) {
                          _loadOrders();
                        }
                      },
                      icon: const Icon(Iconsax.box_add),
                      label: const Text('Receive Inventory'),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  String _shortOrderId(String id, int index) {
    if (id.isEmpty) return '#${index + 1}';
    return '#${id.length > 8 ? id.substring(0, 8) : id}';
  }

  Widget _statusChip(String status) {
    final text = status.isEmpty ? 'Pending' : status.replaceAll('_', ' ');
    final lower = text.toLowerCase();
    final color = lower.contains('received') || lower.contains('complete')
        ? AppColors.success
        : lower.contains('cancel') || lower.contains('reject')
            ? AppColors.danger
            : AppColors.warning;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _OrderMedicineCard extends StatelessWidget {
  final MissingMedicineModel medicine;

  const _OrderMedicineCard({required this.medicine});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  medicine.medicineName,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (medicine.barcode.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  Text(
                    'Barcode: ${medicine.barcode}',
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                  ),
                ],
                const SizedBox(height: 10),
                Text(
                  'Required: ${medicine.requiredQuantity}',
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 13),
                ),
              ],
            ),
          ),
          const Icon(Iconsax.arrow_right_3, size: 18, color: AppColors.textGrey),
        ],
      ),
    );
  }
}
