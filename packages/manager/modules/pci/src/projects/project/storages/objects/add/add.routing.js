import find from 'lodash/find';
import filter from 'lodash/filter';
import get from 'lodash/get';
import map from 'lodash/map';
import set from 'lodash/set';
import some from 'lodash/some';

import { OBJECT_CONTAINER_OFFERS } from '../../containers/containers.constants';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('pci.projects.project.storages.objects.add', {
    url: '/new',
    component: 'pciProjectStorageContainersAdd',
    resolve: {
      regions: /* @ngInject */ (PciProjectRegions, projectId) =>
        PciProjectRegions.getAvailableRegions(projectId).then((regions) => {
          // Remove code start - temporary fix added until the API returns the correct data
          regions.forEach((region) => {
            set(region, 'actualName', region.name);
            set(region, 'name', region.datacenterLocation);
          });
          const sbgPreprod = find(regions, { actualName: 'PREPROD.SBG' });
          if (sbgPreprod) {
            sbgPreprod.services.push({
              name: 'storage-high-perf',
              status: 'UP',
            });
          }
          // Remove code end
          return OBJECT_CONTAINER_OFFERS.reduce(
            (regionsConfiguration, offerName) => ({
              ...regionsConfiguration,
              [offerName]: map(
                filter(regions, (region) =>
                  some(get(region, 'services', []), {
                    name: offerName,
                    status: 'UP',
                  }),
                ),
                (region) => ({
                  ...region,
                  hasEnoughQuota: () => true,
                }),
              ),
            }),
            {},
          );
        }),
      goBack: /* @ngInject */ (goToStorageContainers) => goToStorageContainers,
      cancelLink: /* @ngInject */ ($state, projectId) =>
        $state.href('pci.projects.project.storages.objects', {
          projectId,
        }),
      breadcrumb: /* @ngInject */ ($translate) =>
        $translate.instant(
          'pci_projects_project_storages_containers_add_title',
        ),
    },
  });
};
