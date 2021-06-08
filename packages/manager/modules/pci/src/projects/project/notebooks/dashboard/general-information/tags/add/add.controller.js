import Notebook from '../../../../Notebook.class';

export default class PciNotebookTagsAddController {
  /* @ngInject */
  constructor($translate, NotebookService) {
    this.$translate = $translate;
    this.NotebookService = NotebookService;

    this.label = Notebook.generateLabel();
  }

  $onInit() {
    this.isLoading = false;
  }

  canAddTag() {
    return !this.isLoading && this.label.id && this.label.title;
  }

  addTag() {
    const n = this.notebook.copyToSend();
    return this.NotebookService.updateNotebook(this.projectId, n).then(
      (notebook) => {
        this.notebook = new Notebook(notebook, this.notebook.coreConfig);
      },
    );
  }
}
