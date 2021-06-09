import get from 'lodash/get';

export default class PciNotebookNotebookDeleteAddController {
  /* @ngInject */
  constructor($translate, NotebookService) {
    this.$translate = $translate;
    this.NotebookService = NotebookService;
  }

  $onInit() {
    this.isLoading = false;
  }

  deleteNotebook() {
    this.isLoading = true;
    return this.NotebookService.deleteNotebook(this.projectId, this.notebook.id)
      .then(() => {
        return this.goBack(
          this.$translate.instant(
            'pci_notebooks_general_information_info_delete_notebook_action_delete_success',
          ),
        );
      })
      .catch((error) => {
        this.goBack(
          this.$translate.instant(
            'pci_notebooks_general_information_info_delete_notebook_action_delete_fail',
            {
              name: this.notebook.name,
              message: get(error, 'data.message', null),
            },
          ),
          'error',
        );
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
