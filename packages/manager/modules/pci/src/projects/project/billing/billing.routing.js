import { groupBy, maxBy } from 'lodash';
import { formatBillingDetails, formatPrice } from './billing.utils';
import { PRODUCT_MAPPING } from './billing.constants';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('pci.projects.project.billing', {
    url: '/billing',
    componentProvider: /* @ngInject */ (isLegacyProject) =>
      isLegacyProject ? 'pciProjectBillingLegacy' : 'pciProjectBilling',
    redirectTo: (transition) => {
      // Redirect back to project page if the current NIC
      // is not an admin or a billing contact
      const serviceName = transition.params().projectId;
      const $q = transition.injector().get('$q');
      return $q
        .all([
          transition
            .injector()
            .get('OvhApiMe')
            .v6()
            .get().$promise,
          transition
            .injector()
            .get('OvhApiCloudProjectServiceInfos')
            .v6()
            .get({
              serviceName,
            }).$promise,
        ])
        .then(([me, serviceInfo]) =>
          me.nichandle !== serviceInfo.contactAdmin &&
          me.nichandle !== serviceInfo.contactBilling
            ? 'pci.projects.project'
            : false,
        );
    },
    resolve: {
      breadcrumb: /* @ngInject */ ($translate) =>
        $translate.instant('cpbc_billing_control'),
      catalog: /* @ngInject */ ($http, coreConfig) =>
        $http
          .get(
            `/order/catalog/public/cloud?ovhSubsidiary=${
              coreConfig.getUser().ovhSubsidiary
            }`,
          )
          .then(({ data }) => data),
      consumption: /* @ngInject */ (
        $http,
        $q,
        catalog,
        consumptionDetails,
        coreURLBuilder,
        forecast,
        forecastDetails,
        isLegacyProject,
        projectId,
        serviceInfos,
        service,
      ) =>
        !isLegacyProject
          ? $http
              .get(`/services/${serviceInfos.serviceId}/consumption`)
              .then(({ data }) => data)
              .then((consumption) => ({
                ...consumption,
                priceByPlanFamily: consumption.priceByPlanFamily.map(
                  (price) => {
                    const details = formatBillingDetails(
                      consumptionDetails,
                      price.planFamily,
                      catalog,
                      consumption.price,
                    ).map((detail) => {
                      const url = PRODUCT_MAPPING[price.planFamily];
                      return {
                        ...detail,
                        forecast: maxBy(
                          forecastDetails.filter(
                            ({ uniqueId }) => uniqueId === detail.uniqueId,
                          ),
                          'price.value',
                        ),
                        url: url
                          ? coreURLBuilder.buildURL('public-cloud', `#${url}`, {
                              serviceName: projectId,
                              id: detail.serviceId,
                            })
                          : null,
                      };
                    });
                    return {
                      ...price,
                      forecast: forecast.priceByPlanFamily.find(
                        ({ planFamily }) => planFamily === price.planFamily,
                      ),
                      details: groupBy(details, (element) =>
                        element.id !== element.region
                          ? element.id
                          : `${element.planCode}-${element.uniqueId}`,
                      ),
                    };
                  },
                ),
              }))
              .catch(() => ({
                price: {
                  text: formatPrice(service.billing?.pricing?.price, 0),
                },
              }))
          : $q.resolve({}),
      consumptionDetails: /* @ngInject */ (
        $http,
        $q,
        isLegacyProject,
        serviceInfos,
      ) =>
        !isLegacyProject
          ? $http
              .get(`/services/${serviceInfos.serviceId}/consumption/element`)
              .then(({ data }) => data)
              .then((consumption) => groupBy(consumption, 'planFamily'))
              .catch(() => ({}))
          : $q.resolve({}),
      forecast: /* @ngInject */ (
        $http,
        $q,
        isLegacyProject,
        service,
        serviceInfos,
      ) =>
        !isLegacyProject
          ? $http
              .get(`/services/${serviceInfos.serviceId}/consumption/forecast`)
              .then(({ data }) => data)
              .catch(() => ({
                price: {
                  text: formatPrice(service.billing?.pricing?.price, 0),
                },
              }))
          : $q.resolve({}),
      forecastDetails: /* @ngInject */ (
        $http,
        $q,
        isLegacyProject,
        serviceInfos,
      ) =>
        !isLegacyProject
          ? $http
              .get(
                `/services/${serviceInfos.serviceId}/consumption/forecast/element`,
              )
              .then(({ data }) => data)
              .catch(() => ({}))
          : $q.resolve({}),
      currentActiveLink: /* @ngInject */ ($transition$, $state) => () =>
        $state.href($state.current.name, $transition$.params()),
      billingLink: /* @ngInject */ ($state, projectId) =>
        $state.href('pci.projects.project.billing', { projectId }),
      historyLink: /* @ngInject */ ($state, projectId) =>
        $state.href('pci.projects.project.billing.history', {
          projectId,
          year: moment.utc().year(),
          month: moment.utc().month(),
        }),
      estimateLink: /* @ngInject */ ($state, projectId) =>
        $state.href('pci.projects.project.billing.estimate', { projectId }),
    },
  });
};
