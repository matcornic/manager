export default /* @ngInject */ ($stateProvider) => {
  const stateName =
    'pci.projects.project.notebooks.dashboard.general-information';
  $stateProvider.state(stateName, {
    url: '/general-information',
    views: {
      notebookView: 'ovhManagerPciProjectNotebookGeneralInformation',
    },
    resolve: {
      breadcrumb: () => false,

      goBack: /* @ngInject */ (notebook, goToNotebook) => (message, type) =>
        goToNotebook(notebook, message, type),

      flavors: /* @ngInject */ (projectId, NotebookService) =>
        NotebookService.getFlavors(projectId),

      addTag: /* @ngInject */ ($state, projectId, notebook) => () => {
        console.log('ZM:: addTag', notebook);
        return $state.go(
          'pci.projects.project.notebooks.dashboard.general-information.tags-add',
          {
            projectId,
            notebook,
          },
        );
      },

      deleteNotebook: /* @ngInject */ ($state, projectId, notebook) => () => {
        console.log('ZM:: deleteNotebook', notebook);
        return $state.go(
          'pci.projects.project.notebooks.dashboard.general-information.delete-notebook',
          {
            projectId,
            notebook,
          },
        );
      },
    },
  });
};
