import find from 'lodash/find';
import Notebook from '../Notebook.class';
import { NOTEBOOK_POLLER_NAMESPACES } from '../Notebook.constants';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('pci.projects.project.notebooks.dashboard', {
    url: '/:notebookId',
    component: 'ovhManagerPciProjectNotebooksDashboard',
    resolve: {
      currentActiveLink: /* @ngInject */ ($transition$, $state) => () =>
        $state.href($state.current.name, $transition$.params()),

      notebookId: /* @ngInject */ ($transition$) =>
        $transition$.params().notebookId,

      notebook: /* @ngInject */ (
        notebookId,
        notebooks,
        coreConfig,
        CucRegionService,
      ) =>
        new Notebook(
          find(notebooks, { id: notebookId }),
          coreConfig,
          CucRegionService,
        ),

      breadcrumb: /* @ngInject */ (notebook) => notebook.id,

      generalInformationLink: /* @ngInject */ ($state, notebookId, projectId) =>
        $state.href(
          'pci.projects.project.notebooks.dashboard.general-information',
          {
            projectId,
            notebookId,
          },
        ),

      killTasks: /* @ngInject */ (Poller) => (pattern) => Poller.kill(pattern),

      needRefresh: /* @ngInject */ (notebook) => () =>
        notebook.isStarting() || notebook.isStopping(),

      waitNotebookToStartOrStop: /* @ngInject */ (
        projectId,
        notebook,
        NotebookService,
        Poller,
      ) => () => {
        const endPointUrl = NotebookService.buildGetNotebookUrl(
          projectId,
          notebook.id,
        );
        return Poller.poll(endPointUrl, null, {
          interval: 2500,
          successRule(notebookResponse) {
            const n = new Notebook(notebookResponse, null);
            return n.isRunning() || n.isStopped();
          },
          namespace: NOTEBOOK_POLLER_NAMESPACES.CHANGING,
          notifyOnError: false,
        });
      },
    },
    redirectTo: 'pci.projects.project.notebooks.dashboard.general-information',
  });
};
