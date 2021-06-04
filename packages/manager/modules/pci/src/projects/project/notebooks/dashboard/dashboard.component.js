import controller from './dashboard.controller';
import template from './dashboard.html';

export default {
  bindings: {
    currentActiveLink: '<',
    notebook: '<',
    generalInformationLink: '<',
    guideUrl: '<',
    reloadState: '<',
    needRefresh: '<',
    killTasks: '<',
    waitNotebookToStartOrStop: '<',
  },
  controller,
  template,
};
