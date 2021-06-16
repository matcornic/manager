import set from 'lodash/set';
import { pricingConstants } from '@ovh-ux/manager-product-offers';
import { MIGRATE_FAQ_LINK } from './migrate.constants';

export default class {
  /* @ngInject */
  constructor(ovhManagerProductOffersService) {
    this.ovhManagerProductOffersService = ovhManagerProductOffersService;
  }

  $onInit() {
    this.MIGRATE_FAQ_LINK = MIGRATE_FAQ_LINK[this.user.ovhSubsidiary];
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

  getRenewablePrice() {
    return this.ovhManagerProductOffersService.constructor.getUniquePricingOfCapacity(
      this.newPlan?.pricings,
      pricingConstants.PRICING_CAPACITIES.RENEW,
    ).price;
  }
}
