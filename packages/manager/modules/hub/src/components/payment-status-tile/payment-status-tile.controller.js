import { SERVICE_STATES } from './payment-status-tile.constants';

export default class PaymentStatusTileCtrl {
  /* @ngInject */
  constructor(atInternet, coreURLBuilder, ovhFeatureFlipping) {
    this.atInternet = atInternet;
    this.coreURLBuilder = coreURLBuilder;
    this.ovhFeatureFlipping = ovhFeatureFlipping;

    this.SERVICE_STATES = SERVICE_STATES;
  }

  $onInit() {
    const featureName = 'billing:management';
    this.loading = true;
    return this.ovhFeatureFlipping
      .checkFeatureAvailability(featureName)
      .then((billingManagementAvailability) => {
        this.autorenewLink = billingManagementAvailability.isFeatureAvailable(
          featureName,
        )
          ? this.coreURLBuilder.buildURL('dedicated', '#/billing/autorenew')
          : null;
      })
      .catch(() => {
        this.autorenewLink = null;
      })
      .finally(() => {
        this.loading = false;
      });
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
