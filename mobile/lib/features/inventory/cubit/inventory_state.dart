import 'package:equatable/equatable.dart';
import '../../../shared/models/medicine_model.dart';

enum InventoryStatus { loading, loaded, error }

class InventoryFilter extends Equatable {
  final String availability; // All, Available, Out of Stock
  final String category;
  final String manufacturer;
  final String sortBy;

  const InventoryFilter({
    this.availability = 'All',
    this.category = 'All',
    this.manufacturer = 'All',
    this.sortBy = 'Name (A-Z)',
  });

  InventoryFilter copyWith({
    String? availability,
    String? category,
    String? manufacturer,
    String? sortBy,
  }) {
    return InventoryFilter(
      availability: availability ?? this.availability,
      category: category ?? this.category,
      manufacturer: manufacturer ?? this.manufacturer,
      sortBy: sortBy ?? this.sortBy,
    );
  }

  @override
  List<Object?> get props => [availability, category, manufacturer, sortBy];
}

class InventoryState extends Equatable {
  final InventoryStatus status;
  final List<MedicineModel> allMedicines;
  final String searchQuery;
  final InventoryFilter filter;

  const InventoryState({
    this.status = InventoryStatus.loading,
    this.allMedicines = const [],
    this.searchQuery = '',
    this.filter = const InventoryFilter(),
  });

  List<MedicineModel> get filteredMedicines {
    return allMedicines.where((m) {
      final matchesSearch = searchQuery.isEmpty ||
          m.name.toLowerCase().contains(searchQuery.toLowerCase());
      final matchesAvailability = filter.availability == 'All' ||
          (filter.availability == 'Available' && m.stock > 0) ||
          (filter.availability == 'Out of Stock' && m.stock <= 0);
      final matchesCategory =
          filter.category == 'All' || m.category == filter.category;
      final matchesManufacturer = filter.manufacturer == 'All' ||
          m.manufacturer == filter.manufacturer;
      return matchesSearch &&
          matchesAvailability &&
          matchesCategory &&
          matchesManufacturer;
    }).toList();
  }

  InventoryState copyWith({
    InventoryStatus? status,
    List<MedicineModel>? allMedicines,
    String? searchQuery,
    InventoryFilter? filter,
  }) {
    return InventoryState(
      status: status ?? this.status,
      allMedicines: allMedicines ?? this.allMedicines,
      searchQuery: searchQuery ?? this.searchQuery,
      filter: filter ?? this.filter,
    );
  }

  @override
  List<Object?> get props => [status, allMedicines, searchQuery, filter];
}
