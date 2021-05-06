import { filter, get, head, map, mapValues } from 'lodash-es';

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
          console.log(new BillingService(service));
          return new BillingService(service);
        }),
      };
};

const transformOrder = ($q, lastOrder, OrderTracking) => {
  console.log(lastOrder);
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
      billingServices: /* @ngInject */ ($http) =>
        $http
          .get('/hub/billingServices', {
            serviceType: 'aapi',
          })
          .then((data) => {
            console.log('Billing services : ', data.data.data.billingServices);
            transformBillingServices(data.data.data.billingServices);
          }),
      refreshBillingServices: /* @ngInject */ (refresh) => () =>
        refresh('billingServices').then((hub) =>
          transformBillingServices(hub.billingServices),
        ),
      bills: /* @ngInject */ ($http) =>
        $http
          .get('/hub/bills', { serviceType: 'aapi' })
          .then((data) => data.data.data.bills),
      debt: /* @ngInject */ ($http) =>
        $http
          .get('/hub/debt', { serviceType: 'aapi' })
          .then((data) => data.data.data.debt),
      catalog: /* @ngInject */ ($http) =>
        $http
          .get('/hub/catalog', { serviceType: 'aapi' })
          .then((data) => data.data.data.catalog),
      certificates: /* @ngInject */ ($http) =>
        $http
          .get('/hub/certificates', { serviceType: 'aapi' })
          .then((data) => data.data.data.certificates.data),
      me: /* @ngInject */ (certificates, $http) =>
        $http
          .get('/hub/me', { serviceType: 'aapi' })
          .then((data) => new User(data.data.data.me.data, certificates)),
      notifications: /* @ngInject */ ($translate, $http) =>
        $http
          .get('/hub/notifications', { serviceType: 'aapi' })
          .then((data) => {
            console.log('notifs : ', data.data.data.notifications.data);
            map(
              filter(data.data.data.notifications.data, (notification) => {
                console.log(notification);
                return ['warning', 'error'].includes(notification.level);
              }),
              (notification) => ({
                ...notification,
                // force sanitization to null as this causes issues with UTF-8 characters
                description: $translate.instant(
                  'manager_hub_notification_warning',
                  { content: notification.description },
                  undefined,
                  false,
                  null,
                ),
              }),
            );
          }),
      order: /* @ngInject */ ($q, $http, OrderTracking) =>
        $http
          .get('/hub/lastOrder', { serviceType: 'aapi' })
          .then((data) =>
            transformOrder($q, data.data.data.lastOrder, OrderTracking),
          ),
      refreshOrder: /* @ngInject */ (refresh) => () =>
        refresh('lastOrder').then((lastOrder) => transformOrder(lastOrder)),
      services: /* @ngInject */ ($http) =>
        $http
          .get('/hub/services', { serviceType: 'aapi' })
          .then((data) => data.data.data.services),

      hub: /* @ngInject */ ($http) =>
        $http
          .get('/hub', {
            serviceType: 'aapi',
          })
          .then(({ data }) => parseErrors(data)),

      tickets: /* @ngInject */ ($http) =>
        $http
          .get('/hub/support', { serviceType: 'aapi' })
          .then((data) => data.data.data.support.data),
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
