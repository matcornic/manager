import {
  NOTEBOOK_FLAVOR_TYPE,
  NOTEBOOK_VOLUME_TYPE,
} from '../../Notebook.constants';

export default class {
  /* @ngInject */
  constructor($translate, coreURLBuilder, CucCloudMessage) {
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;

    this.NOTEBOOK_VOLUME_TYPE = NOTEBOOK_VOLUME_TYPE;
    this.NOTEBOOK_FLAVOR_TYPE = NOTEBOOK_FLAVOR_TYPE;
    this.billingUrl = coreURLBuilder.buildURL('dedicated', '#/billing/history');
  }

  $onInit() {
    this.messageContainer =
      'pci.projects.project.notebooks.dashboard.general-information';
    this.loadMessages();
  }

  loadMessages() {
    this.CucCloudMessage.unSubscribe(this.messageContainer);
    this.messageHandler = this.CucCloudMessage.subscribe(
      this.messageContainer,
      {
        onMessage: () => this.refreshMessages(),
      },
    );
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  onLabelRemove(labels, label) {
    console.log('ZM:: onLabelRemove.label', label, this.notebook);
  }
}
