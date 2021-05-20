import controller from './add.controller';
import template from './add.html';

export default {
  bindings: {
    goToNotebooks: '<',
    guideUrl: '<',
    onNotebookAdd: '<',
    projectId: '<',
    trackNotebooks: '<',
    trackClick: '<',
    editors: '<',
    frameworks: '<',
    regions: '<',
    flavors: '<',
    volumes: '<',
    prices: '<',
  },
  controller,
  template,
};
