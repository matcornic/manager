import { map, filter } from 'lodash-es';

export default class {
  /* @ngInject */
  constructor($q, $http, $translate, atInternet) {
    this.atInternet = atInternet;
    this.index = 0;
    this.$http = $http;
    this.$q = $q;
    this.$translate = $translate;
  }

  $onInit() {
    this.$http
      .get('/hub/notifications', {
        serviceType: 'aapi',
      })
      .then((data) => {
        this.items = map(
          filter(data.data.data.notifications.data, (notification) => {
            return ['warning', 'error'].includes(notification.level);
          }),
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
        );
      });
  }

  nextAlert() {
    if (this.index === this.items.length - 1) {
      this.index = 0;
    } else {
      this.index += 1;
    }

    this.atInternet.trackClick({
      name: `${this.trackingPrefix}::alert::action`,
      type: 'action',
    });
  }

  switchToAlert(index) {
    this.index = index;
  }
}
