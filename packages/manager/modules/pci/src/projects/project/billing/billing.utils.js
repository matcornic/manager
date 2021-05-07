import { MONTHLY_STRATEGY } from './billing.constants';

export const formatPrice = (price, value) =>
  price.text.replace(/([0-9]|\.|,)+/g, value);

export const getPrice = (catalogItem, price) => {
  const value =
    catalogItem.pricings.find(({ capacities }) =>
      capacities.includes('consumption'),
    )?.price / 100000000;
  const commercialUnit = catalogItem.blobs?.commercial?.price?.unit;
  const unit =
    catalogItem.consumptionConfiguration?.billingStrategy === MONTHLY_STRATEGY
      ? 'month'
      : 'hour';
  return {
    value: formatPrice(price, value),
    unit: commercialUnit ? commercialUnit.replace('*', '_') : unit,
  };
};

export const formatBillingDetails = (details, planFamily, catalog, price) =>
  details[planFamily].map((detail) => {
    const serviceId = detail.metadata?.find(({ key }) => key.includes('_id'))
      ?.value;
    const region = detail.metadata?.find(({ key }) => key.includes('region'))
      ?.value;
    return {
      ...detail,
      serviceId,
      region,
      id: serviceId || region || detail.uniqueId,
      flavor: detail.metadata?.find(({ key }) => key.includes('flavor_name'))
        ?.value,
      catalogPrice: getPrice(
        catalog.addons.find(({ planCode }) => planCode === detail.planCode),
        price,
      ),
    };
  });

export default {
  formatBillingDetails,
  getPrice,
  formatPrice,
};
