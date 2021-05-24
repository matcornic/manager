import controller from './notebook-review.controller';
import template from './notebook-review.html';

export default {
  bindings: {
    displayNotebookReview: '<',
    notebookModel: '<',
  },
  controller,
  template,
};
