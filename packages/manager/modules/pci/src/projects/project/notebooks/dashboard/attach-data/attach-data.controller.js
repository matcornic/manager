import {
  NOTEBOOK_ATTACH_DATA_DATAGRID,
  NOTEBOOK_ATTACH_DATA_INFO_LINK,
} from './attach-data.constants';

export default class {
  /* @ngInject */
  constructor(
    $translate,
    coreConfig,
    CucCloudMessage,
    CucRegionService,
    NotebookService,
  ) {
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.CucRegionService = CucRegionService;
    this.NotebookService = NotebookService;
    this.user = coreConfig.getUser();

    this.NOTEBOOK_ATTACH_DATA_DATAGRID = NOTEBOOK_ATTACH_DATA_DATAGRID;
  }

  $onInit() {
    this.messageContainer =
      'pci.projects.project.notebooks.dashboard.attach-data';
    this.loadMessages();
  }

  getAttachDataInfoLink() {
    return (
      NOTEBOOK_ATTACH_DATA_INFO_LINK[this.user.ovhSubsidiary] ||
      NOTEBOOK_ATTACH_DATA_INFO_LINK.DEFAULT
    );
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
}
