import { NOTEBOOK_AUTOMATION_INFO } from '../../../Notebook.constants';

export default class NotebookReviewController {
  /* @ngInject */
  constructor(coreConfig) {
    this.coreConfig = coreConfig;
  }

  getEditorInfo() {
    const { editor } = this.notebookModel.selected;
    return `${editor.name}`;
  }

  getFrameworkInfo() {
    const { framework } = this.notebookModel.selected;
    return `${framework.model.name} - ${framework.version.version}`;
  }

  getRegionInfo() {
    const { region } = this.notebookModel.selected;
    return `${region.name}`;
  }

  getResourceInfo() {
    const { resource } = this.notebookModel.selected;
    return `${resource.flavor.id} - x${resource.flavor.resourcesPerUnit.cpu}`;
  }

  getAutomationInfoLink() {
    return (
      NOTEBOOK_AUTOMATION_INFO[this.coreConfig.getUser().ovhSubsidiary] ||
      NOTEBOOK_AUTOMATION_INFO.DEFAULT
    );
  }
}
