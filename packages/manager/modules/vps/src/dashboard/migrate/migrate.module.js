import angular from 'angular';
import '@uirouter/angularjs';
import '@ovh-ux/ui-kit';

import routing from './migrate.routing';
import component from './migrate.component';
import confirm from './migrate-confirm';
import vpsMigrationService from './migrate.service';

const moduleName = 'ovhManagerVpsMigrate';

angular
  .module(moduleName, ['oui', 'ui.router', confirm])
  .config(routing)
  .component('ovhManagerVpsDashboardMigrateVps', component)
  .service('VpsMigrationService', vpsMigrationService)
  .run(/* @ngTranslationsInject:json ./translations */);

export default moduleName;
