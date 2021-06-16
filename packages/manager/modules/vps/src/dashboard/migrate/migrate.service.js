export default class VpsMigrationService {
  /* @ngInject */
  constructor($q, $http) {
    this.$q = $q;
    this.$http = $http;
  }

  migrateVps(serviceName) {
    return this.$http.post(`/vps/${serviceName}/migration2016`);
  }
}
