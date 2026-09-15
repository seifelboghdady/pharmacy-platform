import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';
import '../../../shared/models/order_model.dart';
import '../data/inventory_repository.dart';
import '../../orders/data/orders_repository.dart';

class ReceiveInventoryScreen extends StatefulWidget {
  final OrderModel order;

  const ReceiveInventoryScreen({
    super.key,
    required this.order,
  });

  @override
  State<ReceiveInventoryScreen> createState() =>
      _ReceiveInventoryScreenState();
}

class _ReceiveInventoryScreenState extends State<ReceiveInventoryScreen> {
  final InventoryRepository _inventoryRepository = InventoryRepository();
  final OrdersRepository _ordersRepository = OrdersRepository();
  late final List<TextEditingController> _priceControllers;
  late final List<TextEditingController> _expiryControllers;
  late final TextEditingController _supplierController;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _priceControllers = widget.order.items
        .map((_) => TextEditingController(text: '0'))
        .toList();
    _expiryControllers = widget.order.items
        .map((_) => TextEditingController())
        .toList();
    _supplierController = TextEditingController();
  }

  @override
  void dispose() {
    for (final controller in _priceControllers) {
      controller.dispose();
    }
    for (final controller in _expiryControllers) {
      controller.dispose();
    }
    _supplierController.dispose();
    super.dispose();
  }

  Future<void> _receive() async {
    if (_saving) return;
    setState(() => _saving = true);

    try {
      for (var i = 0; i < widget.order.items.length; i++) {
        final item = widget.order.items[i];
        final price = double.tryParse(_priceControllers[i].text.trim()) ?? -1;
        final expiry = _expiryControllers[i].text.trim();

        if (price < 0 || expiry.isEmpty) {
          throw Exception('Enter price and expiry date for every medicine.');
        }

        final catalog = await _inventoryRepository.ensureCatalogMedicine(
          name: item.medicineName,
          barcode: item.barcode,
        );

        if (catalog.id.isEmpty) {
          throw Exception('Could not identify ${item.medicineName} in catalog.');
        }

        await _inventoryRepository.addToInventory(
          catalogId: catalog.id,
          price: price,
          stockQuantity: item.quantity,
          expiryDate: expiry,
          supplier: _supplierController.text.trim(),
        );
      }

      await _ordersRepository.updateStatus(
        widget.order.id,
        'received',
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inventory received successfully')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ApiService.friendlyError(e))),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Receive Inventory'),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Iconsax.arrow_left_2),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                TextField(
                  controller: _supplierController,
                  decoration: const InputDecoration(
                    labelText: 'Supplier',
                    hintText: 'Supplier name',
                  ),
                ),
                const SizedBox(height: 16),
                ...widget.order.items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.medicineName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textDark,
                          ),
                        ),
                        if (item.barcode.isNotEmpty) ...[
                          const SizedBox(height: 5),
                          Text(
                            'Barcode: ${item.barcode}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textGrey,
                            ),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Text(
                          'Received Quantity: ${item.quantity}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textGrey,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _priceControllers[index],
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: const InputDecoration(labelText: 'Price'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _expiryControllers[index],
                                decoration: const InputDecoration(
                                  labelText: 'Expiry Date',
                                  hintText: 'YYYY-MM-DD',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: ElevatedButton(
                onPressed: _saving ? null : _receive,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _saving
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Add to Inventory'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
