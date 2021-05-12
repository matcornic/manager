import { mapValues } from 'lodash-es';
import { SERVICE_STATES } from './payment-status-tile.constants';

export default class PaymentStatusTileCtrl {
  /* @ngInject */
  constructor($http, atInternet, coreConfig, coreURLBuilder) {
    this.atInternet = atInternet;
    this.coreConfig = coreConfig;
    this.$http = $http;

    this.SERVICE_STATES = SERVICE_STATES;

    this.autorenewLink = this.coreConfig.isRegion(['EU', 'CA'])
      ? coreURLBuilder.buildURL('dedicated', '#/billing/autorenew')
      : '';
    this.fetchServices();
  }

  onLinkClick() {
    this.atInternet.trackClick({
      name: `${this.trackingPrefix}::activity::payment-status::show-all`,
      type: 'action',
    });
  }

  getServiceManagementLink(service) {
    return `${this.autorenewLink}?searchText=${service.domain}`;
  }

  onServiceManagementClick() {
    this.atInternet.trackClick({
      name: `${this.trackingPrefix}::activity::payment-status::action::go-to-manage-service`,
      type: 'action',
    });
  }

  fetchServices() {
    const parseErrors = (data) =>
      mapValues(data.data, (value) =>
        value.status === 'ERROR'
          ? {
              status: value.status,
              error: value.data,
            }
          : value,
      );
    this.$http
      .get(`/hub/billingServices`, {
        serviceType: 'aapi',
      })
      .then(({ data }) => parseErrors(data));
  }

  refreshTile() {
    this.loading = true;
    return this.refresh()
      .then(({ count, data }) => {
        this.totalCount = count;
        this.services = data;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
