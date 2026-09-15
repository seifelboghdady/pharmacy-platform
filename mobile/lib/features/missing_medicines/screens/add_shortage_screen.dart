import 'dart:async';
import '../../scanner/screens/qr_scanner_screen.dart';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/data/medicine_repository.dart';
import '../../../shared/models/medicine_model.dart';
import '../../../shared/models/medicine_catalog_model.dart';
import 'medicine_catalog_picker_screen.dart';
import 'shortage_details_screen.dart';

class AddShortageScreen extends StatefulWidget {
  const AddShortageScreen({super.key});

  @override
  State<AddShortageScreen> createState() => _AddShortageScreenState();
}

class _AddShortageScreenState extends State<AddShortageScreen> {
  final MedicineRepository _repository = MedicineRepository();
  final TextEditingController _searchController = TextEditingController();

  Timer? _debounce;

  List<MedicineModel> _results = [];

  bool _isLoading = false;
  String? _error;

  // 0 = Medicine Name
  // 1 = Barcode
  int _searchMode = 0;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();

    final query = value.trim();

    if (query.isEmpty) {
      setState(() {
        _results = [];
        _isLoading = false;
        _error = null;
      });
      return;
    }

    // Small delay so we don't send a request for every single keystroke.
    _debounce = Timer(const Duration(milliseconds: 350), () {
      _search(query);
    });
  }

  Future<void> _search(String query) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final medicines = await _repository.fetchMedicines(
        name: _searchMode == 0 ? query : null,
        barcode: _searchMode == 1 ? query : null,
      );

      if (!mounted) return;

      setState(() {
        _results = medicines;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _results = [];
        _isLoading = false;
        _error = 'Unable to search medicines. Please try again.';
      });
    }
  }

  void _changeSearchMode(int mode) {
    if (_searchMode == mode) return;

    setState(() {
      _searchMode = mode;
      _results = [];
      _error = null;
    });

    _searchController.clear();
  }

  void _submitSearch() {
    final query = _searchController.text.trim();

    if (query.isEmpty) return;

    _debounce?.cancel();
    _search(query);
  }

  Future<void> _searchCatalog() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    final result = await Navigator.of(context).push<MedicineCatalogModel>(
      MaterialPageRoute(
        builder: (_) => MedicineCatalogPickerScreen(
          query: query,
          barcodeMode: _searchMode == 1,
        ),
      ),
    );

    if (!mounted || result == null) return;

    final medicine = MedicineModel(
      id: '',
      catalogId: result.id,
      name: result.name,
      category: result.category,
      activeIngredient: result.activeIngredient,
      manufacturer: result.manufacturer,
      barcode: result.barcode,
      stock: 0,
      price: 0,
      expiryDate: '',
      supplier: '',
    );

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ShortageDetailsScreen(medicine: medicine),
      ),
    );
  }
  Future<void> _openBarcodeScanner() async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const QrScannerScreen(
          returnMedicine: true,
        ),
      ),
    );

    if (!mounted || result == null) return;

    if (result is MedicineModel) {
      setState(() {
        _results = [result];
        _error = null;
        _isLoading = false;
        _searchController.text = result.barcode;
      });

      return;
    }

    if (result is String) {
      setState(() {
        _searchMode = 1;
        _results = [];
        _error = null;
        _isLoading = false;
        _searchController.text = result;
      });

      // Search inventory manually using the scanned barcode.
      _search(result);
    }
  }  @override
  Widget build(BuildContext context) {
    final isBarcode = _searchMode == 1;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Shortage'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Find Medicine',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Search your pharmacy inventory first.',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textGrey,
                ),
              ),

              const SizedBox(height: 20),

              // Search mode
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.chipGrey,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _SearchModeButton(
                        icon: Iconsax.search_normal,
                        label: 'Medicine Name',
                        selected: _searchMode == 0,
                        onTap: () => _changeSearchMode(0),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: _SearchModeButton(
                        icon: Iconsax.barcode,
                        label: 'Barcode',
                        selected: false,
                        onTap: _openBarcodeScanner,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Search field
              TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                onSubmitted: (_) => _submitSearch(),
                textInputAction: TextInputAction.search,
                keyboardType:
                    isBarcode ? TextInputType.number : TextInputType.text,
                decoration: InputDecoration(
                  hintText: isBarcode
                      ? 'Enter medicine barcode...'
                      : 'Search medicine name...',
                  prefixIcon: Icon(
                    isBarcode ? Iconsax.barcode : Iconsax.search_normal,
                    color: AppColors.primary,
                  ),
                  suffixIcon: _isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                            ),
                          ),
                        )
                      : IconButton(
                          icon: const Icon(Iconsax.search_normal),
                          onPressed: _submitSearch,
                        ),
                ),
              ),

              const SizedBox(height: 20),

              Expanded(
                child: _buildResults(),
              ),
            ],
          ),
        ),
      ),
    );
    
  }

  Widget _buildResults() {
    if (_error != null) {
      return Center(
        child: Text(
          _error!,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.danger,
          ),
        ),
      );
    }

    if (_searchController.text.trim().isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Iconsax.search_normal,
              size: 48,
              color: AppColors.textGrey,
            ),
            SizedBox(height: 12),
            Text(
              'Start typing to search for a medicine',
              style: TextStyle(
                color: AppColors.textGrey,
              ),
            ),
          ],
        ),
      );
    }

    if (!_isLoading && _results.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Iconsax.box,
              size: 48,
              color: AppColors.textGrey,
            ),
            const SizedBox(height: 12),
            const Text(
              'Medicine not found in your inventory',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textGrey,
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _searchCatalog,
              icon: const Icon(Iconsax.global_search),
              label: const Text('Search Medicine Catalog'),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: _results.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final medicine = _results[index];

        return _MedicineResultCard(
          medicine: medicine,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ShortageDetailsScreen(
                  medicine: medicine,
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _SearchModeButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _SearchModeButton({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: 11,
          horizontal: 8,
        ),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(9),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: selected
                  ? AppColors.primary
                  : AppColors.textGrey,
            ),
            const SizedBox(width: 7),
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight:
                      selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected
                      ? AppColors.primary
                      : AppColors.textGrey,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MedicineResultCard extends StatelessWidget {
  final MedicineModel medicine;
  final VoidCallback onTap;

  const _MedicineResultCard({
    required this.medicine,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.chipGrey,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Iconsax.health,
                color: AppColors.primary,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    medicine.name,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),

                  if (medicine.activeIngredient.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      medicine.activeIngredient,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textGrey,
                      ),
                    ),
                  ],

                  if (medicine.barcode.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Barcode: ${medicine.barcode}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textGrey,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(width: 8),

            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text(
                  'Stock',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textGrey,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${medicine.stock}',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: medicine.isOutOfStock
                        ? AppColors.danger
                        : AppColors.success,
                  ),
                ),
              ],
            ),

            const SizedBox(width: 6),

            const Icon(
              Iconsax.arrow_right_3,
              size: 18,
              color: AppColors.textGrey,
            ),
          ],
        ),
      ),
    );
  }
}