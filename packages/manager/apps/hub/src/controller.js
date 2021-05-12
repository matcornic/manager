import { isString, map, filter, head, get } from 'lodash-es';
import { BillingService } from '@ovh-ux/manager-models';

export default class HubController {
  /* @ngInject */
  constructor(
    $document,
    $http,
    $q,
    $scope,
    $state,
    $rootScope,
    coreConfig,
    ovhFeatureFlipping,
    OrderTracking,
  ) {
    this.$document = $document;
    this.$http = $http;
    this.$q = $q;
    this.$scope = $scope;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.chatbotEnabled = false;
    this.coreConfig = coreConfig;
    this.ovhFeatureFlipping = ovhFeatureFlipping;
    this.OrderTracking = OrderTracking;
  }

  $onInit() {
    this.servicesImpactedWithIncident = [];
    this.navbarOptions = {
      universe: this.coreConfig.getUniverse(),
      version: 'beta',
      toggle: {
        event: 'sidebar:loaded',
      },
    };
    this.currentLanguage = this.coreConfig.getUserLanguage();
    this.user = this.coreConfig.getUser();
    const unregisterListener = this.$scope.$on('app:started', () => {
      const CHATBOT_FEATURE = 'chatbot';
      this.ovhFeatureFlipping
        .checkFeatureAvailability(CHATBOT_FEATURE)
        .then((featureAvailability) => {
          this.chatbotEnabled = featureAvailability.isFeatureAvailable(
            CHATBOT_FEATURE,
          );
          if (this.chatbotEnabled) {
            this.$rootScope.$broadcast(
              'ovh-chatbot:enable',
              this.chatbotEnabled,
            );
          }
        });
      unregisterListener();
    });

    // this.bills = this.getHubSubData('bills');
    // this.debt = this.getHubSubData('debt');
    // this.catalog = this.getHubSubData('catalog');
    // this.certificates = this.$q(this.getHubSubData('certificates')).then(
    //   (data) => data,
    // );
    // this.me = new User(this.getHubSubData('me'), this.certificates);
    // this.notifications = this.getNotifications();
    // this.order = this.getOrder();
    // this.services = this.getHubSubData('services');
    // this.tickets = this.getHubSubData('support')?.data;

    return this.getServicesImpactedByIncident();
  }

  /**
   * Set focus on the specified element.
   * @param  {string} id Element to locate.
   * @return {void}
   */
  setFocus(id) {
    if (isString(id)) {
      const [element] = this.$document.find(`#${id}`);
      element.focus();
    }
  }

  getServicesImpactedByIncident() {
    return this.$http
      .get('/incident-status', {
        serviceType: 'aapi',
      })
      .then(({ data }) => {
        this.servicesImpactedWithIncident = data;
      })
      .catch(() => []);
  }

  getHubSubData(subdata) {
    this.$http
      .get(`/hub/${subdata}`, { serviceType: 'aapi' })
      .then((data) => data.data.data[subdata])
      .catch(() => null);
  }

  async getNotifications() {
    const notifications = await this.getHubSubData('notifications')?.data;
    return map(
      filter(
        notifications,
        (notification) => ['warning', 'error'].includes(notification.level),
        (notification) => ({
          ...notification,
          // force sanitization to null as this causes issues with UTF-8 characters
          description: this.$translate.instant(
            'manager_hub_notification_warning',
            { content: notification.description },
            undefined,
            false,
            null,
          ),
        }),
      ),
    );
  }

  async getBillingServices() {
    const services = await this.getHubSubData('billingServices');

    return services.status === 'ERROR'
      ? services
      : {
          count: get(services, 'data.count'),
          data: map(services.data.data, (service) => {
            return new BillingService(service);
          }),
        };
  }

  async getOrder() {
    const latestOrder = await this.getHubSubData('lastOrder').data;
    return latestOrder
      ? this.$q
          .all({
            status: this.OrderTracking.getOrderStatus(latestOrder),
            details: this.OrderTracking.getOrderDetails(latestOrder),
          })
          .then(({ status, details }) => ({
            ...latestOrder,
            status,
            ...head(details),
          }))
          .then((order) =>
            this.OrderTracking.getCompleteHistory(order).then((history) => ({
              ...order,
              ...history,
            })),
          )
      : this.$q.resolve();
  }

  goToIncidentStatus() {
    return this.$state.go('app.dashboard.incident.status', {
      incidentName: 'SBG',
    });
  }
}
