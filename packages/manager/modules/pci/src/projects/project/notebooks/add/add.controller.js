import get from 'lodash/get';
import {
  NOTEBOOK_PRIVACY_SETTINGS,
  NOTEBOOK_RESOURCES,
} from './notebook.constants';

export default class NotebookAddController {
  static convertLabels(labels) {
    return labels.reduce((cum, l) => ({ ...cum, [l.key]: l.value }), {});
  }

  static buildResourceBody(flavor, nbResources) {
    const { resourcesPerUnit, gpuInformation } = flavor;
    const { cpu, ...restOfResources } = resourcesPerUnit;

    return {
      [flavor.type]: nbResources,
      flavor: flavor.id,
      ...restOfResources,
      ...gpuInformation,
    };
  }

  static createNotebook(notebookModel) {
    const { name, nbResources } = notebookModel;
    const { labels, volumes, selected } = notebookModel;
    const { editor, framework, region, resource } = selected;

    return {
      env: {
        editorId: editor.id,
        frameworkId: framework.model.id,
        frameworkVersion: framework.version.version,
      },
      labels: NotebookAddController.convertLabels(labels),
      name,
      region: region.name,
      resources: NotebookAddController.buildResourceBody(
        resource.flavor,
        nbResources,
      ),
      volumes: volumes.map((volume) => ({
        container: volume.container.name,
        region: region.name,
        mountPath: volume.mountPath,
        permissions: volume.permission,
        cache: true,
      })),
    };
  }

  /* @ngInject */
  constructor($translate, CucCloudMessage, NotebookService) {
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.NotebookService = NotebookService;
  }

  $onInit() {
    this.messageContainer = 'pci.projects.project.notebooks.add';
    this.loadMessages();
    this.trackNotebooks('configuration', 'page');

    // Notebook model
    this.notebookModel = {
      name: '',
      labels: [],
      repositoryURL: '',
      mountPath: '',
      nbResources: NOTEBOOK_RESOURCES.NB_RESOURCES,
      volumes: [],
      selected: {
        editor: null,
        framework: {
          version: null,
          model: null,
        },
        privacy: NOTEBOOK_PRIVACY_SETTINGS.RESTRICTED,
        region: null,
        useCase: null,
        resource: {
          usage: NOTEBOOK_RESOURCES.STANDARD,
          flavor: null,
          flavorType: NOTEBOOK_RESOURCES.STANDARD_FLAVOR,
        },
      },
    };
  }

  loadMessages() {
    this.CucCloudMessage.unSubscribe(this.messageContainer);
    this.messageHandler = this.CucCloudMessage.subscribe(
      this.messageContainer,
      { onMessage: () => this.refreshMessages() },
    );
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  onRegionChange({ name: regionName }) {
    this.flavorsAreLoaded = false;
    this.NotebookService.getFlavors(this.projectId, regionName).then(
      (flavors) => {
        this.flavors = flavors;
        this.flavorsAreLoaded = true;
      },
    );
  }

  onNotebookSubmit() {
    const { selected, nbResources } = this.notebookModel;
    const { editor, framework, resource } = selected;
    const flavorName = resource.flavor.name;

    this.trackNotebooks(`config_create_notebook${editor.id}`);
    this.trackNotebooks(
      'PublicCloud_create_new_notebook::'
        .concat(`${editor.id}::${framework.model.id}::`)
        .concat(`${resource.usage}_${flavorName}_${nbResources}`),
    );

    this.isAdding = true;
    return this.NotebookService.addNotebook(
      this.projectId,
      NotebookAddController.createNotebook(this.notebookModel),
    )
      .then(() =>
        this.goToNotebooks(
          this.$translate.instant('pci_notebook_add_notebook_create_success'),
        ).then(() =>
          this.trackNotebooks(`config_create_notebook_validated${editor.id}`),
        ),
      )
      .catch((error) => {
        this.trackNotebooks(`config_create_notebook_error${editor.id}`);
        this.CucCloudMessage.error(
          this.$translate.instant('pci_notebook_add_notebook_create_error', {
            message: get(error, 'data.message'),
          }),
        );
      })
      .finally(() => {
        this.isAdding = false;
      });
  }
}
