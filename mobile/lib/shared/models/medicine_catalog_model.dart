/// Represents a global medicine in MedicineCatalog.
class MedicineCatalogModel {
  final String id;
  final String name;
  final String barcode;
  final String activeIngredient;
  final String manufacturer;
  final String category;
  final String dosageForm;
  final String strength;

  const MedicineCatalogModel({
    required this.id,
    required this.name,
    this.barcode = '',
    this.activeIngredient = '',
    this.manufacturer = '',
    this.category = '',
    this.dosageForm = '',
    this.strength = '',
  });

  factory MedicineCatalogModel.fromJson(Map<String, dynamic> json) {
    return MedicineCatalogModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      barcode: (json['barcode'] ?? '').toString(),
      activeIngredient: (json['activeIngredient'] ?? '').toString(),
      manufacturer: (json['manufacturer'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      dosageForm: (json['dosageForm'] ?? '').toString(),
      strength: (json['strength'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        if (barcode.isNotEmpty) 'barcode': barcode,
        if (activeIngredient.isNotEmpty)
          'activeIngredient': activeIngredient,
        if (manufacturer.isNotEmpty) 'manufacturer': manufacturer,
        if (category.isNotEmpty) 'category': category,
        if (dosageForm.isNotEmpty) 'dosageForm': dosageForm,
        if (strength.isNotEmpty) 'strength': strength,
      };
}
