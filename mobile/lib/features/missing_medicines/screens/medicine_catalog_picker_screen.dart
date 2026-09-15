import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';
import '../../../shared/models/medicine_catalog_model.dart';
import '../data/medicine_catalog_repository.dart';

class MedicineCatalogPickerScreen extends StatefulWidget {
  final String query;
  final bool barcodeMode;

  const MedicineCatalogPickerScreen({
    super.key,
    required this.query,
    this.barcodeMode = false,
  });

  @override
  State<MedicineCatalogPickerScreen> createState() =>
      _MedicineCatalogPickerScreenState();
}

class _MedicineCatalogPickerScreenState
    extends State<MedicineCatalogPickerScreen> {
  final MedicineCatalogRepository _repository = MedicineCatalogRepository();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _barcodeController = TextEditingController();
  final TextEditingController _activeIngredientController =
      TextEditingController();
  final TextEditingController _manufacturerController = TextEditingController();

  List<MedicineCatalogModel> _results = [];
  bool _loading = true;
  bool _creating = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.barcodeMode) {
      _barcodeController.text = widget.query;
    } else {
      _nameController.text = widget.query;
    }
    _search();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _barcodeController.dispose();
    _activeIngredientController.dispose();
    _manufacturerController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await _repository.search(
        name: widget.barcodeMode ? null : widget.query,
        barcode: widget.barcodeMode ? widget.query : null,
      );

      if (!mounted) return;
      setState(() {
        _results = results;
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

  Future<void> _createCatalogMedicine(BuildContext dialogContext) async {
    final name = _nameController.text.trim().isEmpty
        ? widget.query
        : _nameController.text.trim();
    final barcode = _barcodeController.text.trim();

    if (name.isEmpty) return;

    setState(() => _creating = true);
    try {
      final medicine = await _repository.create(
        name: name,
        barcode: barcode,
        activeIngredient: _activeIngredientController.text,
        manufacturer: _manufacturerController.text,
      );

      if (!mounted) return;
      Navigator.of(dialogContext).pop(medicine);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ApiService.friendlyError(e))),
      );
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  Future<void> _showAddDialog() async {
    final medicine = await showDialog<MedicineCatalogModel>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add to Medicine Catalog'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Medicine Name'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _barcodeController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Barcode'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _activeIngredientController,
                  decoration:
                      const InputDecoration(labelText: 'Active Ingredient'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _manufacturerController,
                  decoration: const InputDecoration(labelText: 'Manufacturer'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: _creating ? null : () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _creating ? null : () => _createCatalogMedicine(context),
              child: _creating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Add'),
            ),
          ],
        );
      },
    );

    if (medicine != null && mounted) {
      Navigator.of(context).pop(medicine);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Medicine Catalog'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _results.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Iconsax.box_search,
                              size: 48,
                              color: AppColors.textGrey,
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Medicine not found in the global catalog.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppColors.textGrey),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _showAddDialog,
                              icon: const Icon(Iconsax.add),
                              label: const Text('Add to Global Catalog'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _results.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final medicine = _results[index];
                        return Card(
                          child: ListTile(
                            title: Text(
                              medicine.name,
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            subtitle: Text(
                              [
                                if (medicine.activeIngredient.isNotEmpty)
                                  medicine.activeIngredient,
                                if (medicine.barcode.isNotEmpty)
                                  'Barcode: ${medicine.barcode}',
                              ].join(' • '),
                            ),
                            trailing: const Icon(Iconsax.arrow_right_3),
                            onTap: () => Navigator.of(context).pop(medicine),
                          ),
                        );
                      },
                    ),
    );
  }
}
