import {
  DEFAULT_DISPLAYED_TILES,
  DISPLAYED_PRODUCTS_NUMBER,
} from './constants';

export default class ProductsController {
  /* @ngInject */
  constructor($state, atInternet) {
    this.DEFAULT_DISPLAYED_TILES = DEFAULT_DISPLAYED_TILES;
    this.DISPLAYED_PRODUCTS_NUMBER = DISPLAYED_PRODUCTS_NUMBER;
    this.$state = $state;
    this.atInternet = atInternet;
  }

  $onInit() {
    this.products.then((data) => {
      this.items = data;
    });
  }

  toggleExpand() {
    this.expand = !this.expand;
  }

  static formatProductTypeTracker(productType) {
    return productType.toLowerCase().replace(/_/g, '-');
  }

  goToProductPage(productObject) {
    const product = productObject.productType;
    this.atInternet.trackClick({
      name: `${this.trackingPrefix}::product::${product
        .toLowerCase()
        .replace(/_/g, '-')}::show-all`,
      type: 'action',
    });
    return (
      this.$state
        .go(`app.dashboard.${product.toLowerCase()}`)
        // If the transition error, it means the state doesn't exist
        .catch(() => {
          this.$state.go('app.dashboard.products', {
            product: product.toLowerCase(),
          });
        })
    );
  }
}
