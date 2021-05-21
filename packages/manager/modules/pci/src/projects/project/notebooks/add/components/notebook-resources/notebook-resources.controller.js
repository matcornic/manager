import { NOTEBOOK_RESOURCES } from '../../notebook.constants';

export default class NotebookResourcesController {
  /* @ngInject */
  constructor(coreConfig) {
    this.coreConfig = coreConfig;

    this.NOTEBOOK_RESOURCES = NOTEBOOK_RESOURCES;
  }

  $onInit() {
    this.PriceFormatter = new Intl.NumberFormat(
      this.coreConfig.getUserLocale().replace('_', '-'),
      {
        style: 'currency',
        currency: this.coreConfig.getUser().currency.code,
        maximumFractionDigits: 5, // default is 2. But this rounds off the price
      },
    );
  }

  onUsecaseChange(flavorType) {
    this.notebookModel.selected.resource.flavor = null;
    this.notebookModel.selected.resource.flavorType = flavorType;
  }

  convertPriceToHour(flavorId) {
    const priceIndex = `ai-notebook.${flavorId}.minute.consumption`;
    return this.PriceFormatter.format(this.prices[priceIndex].price.value * 60);
  }
}
