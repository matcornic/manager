import { filter, get, groupBy, map, reverse, sortBy } from 'lodash-es';
// import { get } from 'lodash-es';

const getProducts = (services, order, catalog) => {
  return get(services, 'data.count') === 0 && !order
    ? groupBy(
        filter(catalog.data, ({ highlight }) => highlight),
        'universe',
      )
    : reverse(
        sortBy(
          map(services.data?.data, (service, productType) => ({
            ...service,
            productType,
          })),
          'count',
        ),
      );
};

export default /* @ngInject */ ($stateProvider, $urlRouterProvider) => {
  $stateProvider.state('app.dashboard', {
    url: '/?expand',
    params: {
      expand: {
        value: null,
        squash: true,
        dynamic: true,
      },
    },
    resolve: {
      products: /* @ngInject */ ($http, $q, order) => {
        const catalogPromise = $http.get('/hub/catalog', {
          serviceType: 'aapi',
        });
        const servicesPromise = $http.get('/hub/services', {
          serviceType: 'aapi',
        });

        return $q
          .all([catalogPromise, servicesPromise])
          .then((responseArray) => {
            const { catalog } = responseArray[0].data.data;
            const { services } = responseArray[1].data.data;
            return getProducts(services, order, catalog);
          });
      },
      goToProductPage: /* @ngInject */ ($state, atInternet, trackingPrefix) => (
        product,
      ) => {
        atInternet.trackClick({
          name: `${trackingPrefix}::product::${product
            .toLowerCase()
            .replace(/_/g, '-')}::show-all`,
          type: 'action',
        });
        return (
          $state
            .go(`app.dashboard.${product.toLowerCase()}`)
            // If the transition error, it means the state doesn't exist
            .catch(() =>
              $state.go('app.dashboard.products', {
                product: product.toLowerCase(),
              }),
            )
        );
      },
      trackingPrefix: () => 'hub::dashboard',
      expandProducts: /* @ngInject */ ($state) => (expand) =>
        $state.go('.', {
          expand,
        }),
      expand: /* @ngInject */ ($transition$) => $transition$.params().expand,
      hideBreadcrumb: () => true,
      breadcrumb: /* @ngInject */ ($translate) =>
        $translate.instant('manager_hub_dashboard'),
    },
    resolvePolicy: {
      async: 'NOWAIT',
    },
    // componentProvider: () => 'hubDashboard',
    componentProvider: /* @ngInject */ (order, numberOfServices) =>
      numberOfServices === 0 && !order ? 'hubOrderDashboard' : 'hubDashboard',
  });

  $urlRouterProvider.otherwise('/');
};
