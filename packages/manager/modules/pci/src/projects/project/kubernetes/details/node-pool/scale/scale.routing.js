export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state(
    'pci.projects.project.kubernetes.details.nodepools.scale',
    {
      url: '/scale?nodePoolId',
      views: {
        modal: {
          component: 'pciProjectKubernetesNodePoolsScaleComponent',
        },
      },
      layout: 'modal',
      params: {
        nodePoolId: null,
      },
      resolve: {
        goBack: /* @ngInject */ (goToNodePools) => goToNodePools,
        nodePool: /* @ngInject */ (
          Kubernetes,
          kubeId,
          nodePoolId,
          projectId,
          autoscaling,
        ) => ({
          ...Kubernetes.getNodePool(projectId, kubeId, nodePoolId),
          autoscaling,
        }),
        nodePoolId: /* @ngInject */ ($transition$) =>
          $transition$.params().nodePoolId,
        breadcrumb: () => null,
      },
    },
  );
};
