import set from 'lodash/set';
import get from 'lodash/get';
import { MIGRATE_FAQ_LINK } from './migrate.constants';

export default class {
  /* @ngInject */
  constructor(atInternet) {
    this.atInternet = atInternet;
    this.MIGRATE_FAQ_LINK = MIGRATE_FAQ_LINK;
  }

  $onInit() {
    set(
      this.newPlan,
      'configuration',
      this.parseRangeConfiguration(this.newPlan.planCode),
    );
  }

  /* eslint-disable-next-line class-methods-use-this */
  extractConfigurationFromPlanCode(planCode) {
    const [cores, memory, storage] = planCode.match(/\d+/g);
    return [parseInt(cores, 10), parseInt(memory, 10), parseInt(storage, 10)];
  }

  parseRangeConfiguration(rangeFullName) {
    const [cores, memory, storage] = this.extractConfigurationFromPlanCode(
      rangeFullName,
    );

    return {
      cpu: { cores },
      memory: { size: memory },
      storage: { disks: [{ capacity: storage }] },
    };
  }

  cancel() {
    this.atInternet.trackClick({
      name: `${this.migrationTrackingPrefix}::cancel`,
      type: 'action',
    });
    return this.goBack();
  }

  getRenewablePrice() {
    return get(this.newPlan, 'pricings').find(({ capacities }) =>
      capacities.includes('renew'),
    ).price;
  }
}
