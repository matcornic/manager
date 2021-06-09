export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state(
    'pci.projects.project.notebooks.dashboard.general-information.delete-notebook',
    {
      url: '/delete-notebook',
      views: {
        modal: {
          component: 'pciNotebooksNotebookDashboardNotebookDelete',
        },
      },
      layout: 'modal',
      resolve: {
        breadcrumb: () => null,
      },
    },
  );
};
