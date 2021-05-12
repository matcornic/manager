import { get, map, mapValues, head } from 'lodash-es';

import { BillingService, User } from '@ovh-ux/manager-models';

const parseErrors = (data) =>
  mapValues(data.data, (value) =>
    value.status === 'ERROR'
      ? {
          status: value.status,
          error: value.data,
        }
      : value,
  );

const transformBillingServices = (services) => {
  return services.status === 'ERROR'
    ? services
    : {
        count: get(services, 'data.count'),
        data: map(services.data.data, (service) => {
          return new BillingService(service);
        }),
      };
};

const transformOrder = ($q, lastOrder, OrderTracking) => {
  const latestOrder = lastOrder.data;
  return latestOrder
    ? $q
        .all({
          status: OrderTracking.getOrderStatus(latestOrder),
          details: OrderTracking.getOrderDetails(latestOrder),
        })
        .then(({ status, details }) => ({
          ...latestOrder,
          status,
          ...head(details),
        }))
        .then((order) =>
          OrderTracking.getCompleteHistory(order).then((history) => ({
            ...order,
            ...history,
          })),
        )
    : $q.resolve();
};

export default /* @ngInject */ ($stateProvider, $urlRouterProvider) => {
  $stateProvider.state('app', {
    url: '',
    abstract: true,
    redirectTo: 'app.dashboard',
    resolve: {
      sidebar: /* @ngInject */ ($rootScope) => {
        $rootScope.$broadcast('sidebar:loaded');
      },
      refreshBillingServices: /* @ngInject */ (refresh) => () =>
        refresh('billingServices').then((hub) =>
          transformBillingServices(hub.billingServices),
        ),
      // catalog: /* @ngInject */ ($http) =>
      //   $http
      //     .get('/hub/catalog', { serviceType: 'aapi' })
      //     .then((data) => data.data.data.catalog),
      certificates: /* @ngInject */ ($http) =>
        $http
          .get('/hub/certificates', { serviceType: 'aapi' })
          .then((data) => data.data.data.certificates.data),
      me: /* @ngInject */ (certificates, $http) =>
        $http
          .get('/hub/me', { serviceType: 'aapi' })
          .then((data) => new User(data.data.data.me.data, certificates)),
      order: /* @ngInject */ ($q, $http, OrderTracking) =>
        $http
          .get('/hub/lastOrder', { serviceType: 'aapi' })
          .then((data) =>
            transformOrder($q, data.data.data.lastOrder, OrderTracking),
          ),
      // services: /* @ngInject */ ($http) =>
      //   $http
      //     .get('/hub/services', { serviceType: 'aapi' })
      //     .then((data) => data.data.data.services),
      numberOfServices: /* ngInject */ ($http) => {
        $http
          .get('/services', {
            headers: {
              'X-Pagination-Mode': 'CachedObjectList-Pages',
              'X-Pagination-Size': 5,
            },
          })
          .then((data) => data.data.length);
      },
      trackingPrefix: () => 'hub::dashboard::activity::payment-status',
      refresh: /* @ngInject */ ($http) => (type) =>
        $http
          .get(`/hub/${type}`, {
            serviceType: 'aapi',
          })
          .then(({ data }) => parseErrors(data)),
    },
  });

  $urlRouterProvider.otherwise('/');
};
