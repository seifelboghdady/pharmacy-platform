const medicineCatalogKey = (query) => {
  const { name, barcode, category } = query;

  if (name) {
    return `medicine-catalog:name:${name.toLowerCase()}`;
  }

  if (barcode) {
    return `medicine-catalog:barcode:${barcode}`;
  }

  if (category) {
    return `medicine-catalog:category:${category.toLowerCase()}`;
  }

  return "medicine-catalog:all";
};

module.exports = {
  medicineCatalogKey
};