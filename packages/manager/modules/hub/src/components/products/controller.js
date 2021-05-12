// import { filter, get, groupBy, map, reverse, sortBy } from 'lodash-es';
import {
  DEFAULT_DISPLAYED_TILES,
  DISPLAYED_PRODUCTS_NUMBER,
} from './constants';

// const getProducts = (services, order, catalog) => {
//   return get(services, 'data.count') === 0 && !order
//     ? groupBy(
//         filter(catalog.data, ({ highlight }) => highlight),
//         'universe',
//       )
//     : reverse(
//         sortBy(
//           map(services.data?.data, (service, productType) => ({
//             ...service,
//             productType,
//           })),
//           'count',
//         ),
//       );
// };

export default class ProductsController {
  /* @ngInject */
  constructor($q, $http) {
    this.DEFAULT_DISPLAYED_TILES = DEFAULT_DISPLAYED_TILES;
    this.DISPLAYED_PRODUCTS_NUMBER = DISPLAYED_PRODUCTS_NUMBER;
    this.$q = $q;
    this.$http = $http;
    // this.products = [];
  }

  // $onInit() {
  //   // console.log(this.order);
  //   const catalogPromise = this.$http.get('/hub/catalog', {
  //     serviceType: 'aapi',
  //   });
  //   const servicesPromise = this.$http.get('/hub/services', {
  //     serviceType: 'aapi',
  //   });
  //   const order = this.$http.get('/hub/lastOrder', {
  //     serviceType: 'aapi',
  //   });

  //   this.$q
  //     .all([catalogPromise, servicesPromise, order])
  //     .then((responseArray) => {
  //       const { catalog } = responseArray[0].data.data;
  //       const { services } = responseArray[1].data.data;
  //       const { lastOrder } = responseArray[2].data.data;

  //       this.products = getProducts(services, lastOrder, catalog);
  //     });
  // }

  toggleExpand() {
    this.expand = !this.expand;
    this.onExpand({ expand: this.expand || null });
  }

  static formatProductTypeTracker(productType) {
    return productType.toLowerCase().replace(/_/g, '-');
  }
}
