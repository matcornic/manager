export default class CloudProjectBillingConsumptionCurrentCtrl {
  /* @ngInject */
  constructor($q, $translate, $state, CucCloudMessage) {
    this.data = {};

    this.CucCloudMessage = CucCloudMessage;

    this.loading = true;

    this.loadMessages();
  }

  $onInit() {
    this.isExpanded = Object.keys(this.consumptionDetails).reduce(
      (acc, planFamily) => ({
        ...acc,
        [planFamily]: false,
      }),
      {},
    );
  }

  loadMessages() {
    this.messageHandler = this.CucCloudMessage.subscribe(
      'pci.projects.project.billing',
      {
        onMessage: () => this.refreshMessages(),
      },
    );
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  expandRow($row) {
    this.isExpanded[$row.planFamily] = !this.isExpanded[$row.planFamily];
  }
}
