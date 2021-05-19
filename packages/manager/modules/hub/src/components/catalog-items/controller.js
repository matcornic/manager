export default class {
  constructor() {
    this.loading = true;
  }

  $onInit() {
    this.items
      .then((products) => {
        this.allProducts = products;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  formatTracker(universe, product) {
    return `${this.trackingPrefix}::catalog::${universe
      .toLowerCase()
      .replace(' ', '-')}::${product.productName
      .toLowerCase()
      .replace(/_/g, '-')}::order`;
  }
}
