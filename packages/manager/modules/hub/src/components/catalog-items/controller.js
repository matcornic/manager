export default class {
  $onInit() {
    this.fetchItems();
  }

  fetchItems() {
    if (this.items && this.items.length) return;

    this.loading = true;

    this.itemsPromise
      .then((products) => {
        this.items = products;
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
