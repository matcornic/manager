import { NOTEBOOK_POLLER_NAMESPACES } from '../Notebook.constants';

export default class {
  /* @ngInject */
  constructor($translate, NotebookService) {
    this.$translate = $translate;
    this.NotebookService = NotebookService;
  }

  $onInit() {
    if (this.needRefresh()) {
      this.waitNotebookToStartOrStop().then(() => this.reloadState());
    }
  }

  $onDestroy() {
    this.killTasks(NOTEBOOK_POLLER_NAMESPACES.CHANGING);
  }
}
