import { AUTOSCALING_LINK } from './autoscaling.constants';
import { SCALE_DEFAULT_VALUES } from '../../kubernetes.constants';

export default class AutoscalingController {
  /* @ngInject */
  constructor(coreConfig) {
    this.ovhSubsidiary = coreConfig.getUser().ovhSubsidiary;
    this.autoscalingInfoLink = this.getAutoscalingInfoLink();
    this.nodesBackup = { lowest: {}, desired: {}, highest: {} };
    this.LOWEST_VALUE = SCALE_DEFAULT_VALUES.LOWEST_VALUE;
  }

  $onInit() {
    this.model = this.nodePool.autoscaling;
    const { lowest, desired, highest } = this.model.nodes;

    if (!this.isEditMode) this.setLimits();
    this.createNodesBackup(this.model.autoscale);
    this.setAutoscalingValidity(lowest.value, desired.value, highest.value);
  }

  setLimits() {
    this.setLimitsForNoScaleCase();
    this.setLimitsForScaleCase();
  }

  setLimitsForNoScaleCase() {
    const { desired } = this.model.nodes;

    desired.min = SCALE_DEFAULT_VALUES.LOWEST_MIN_VALUE;
    desired.value = SCALE_DEFAULT_VALUES.LOWEST_VALUE;
    desired.max = SCALE_DEFAULT_VALUES.HIGHEST_MAX_VALUE;
  }

  setLimitsForScaleCase() {
    const { lowest, highest } = this.model.nodes;

    lowest.min = SCALE_DEFAULT_VALUES.LOWEST_MIN_VALUE;
    lowest.value = SCALE_DEFAULT_VALUES.LOWEST_MIN_VALUE;
    lowest.max = SCALE_DEFAULT_VALUES.HIGHEST_VALUE;

    highest.min = SCALE_DEFAULT_VALUES.LOWEST_MIN_VALUE;
    highest.value = SCALE_DEFAULT_VALUES.HIGHEST_VALUE;
    highest.max = SCALE_DEFAULT_VALUES.HIGHEST_MAX_VALUE;
  }

  setAutoscalingValidity(minValue, desiredValue, maxValue) {
    const { autoscale } = this.model;

    this.model.isValidScale = AutoscalingController.isValidKubeScale(
      autoscale,
      minValue,
      desiredValue,
      maxValue,
    );
  }

  createNodesBackup(autoscale) {
    const { lowest, desired, highest } = this.model.nodes;

    if (autoscale) {
      this.nodesBackup.desired = { ...desired };
    } else {
      this.nodesBackup.lowest = { ...lowest };
      this.nodesBackup.highest = { ...highest };
    }
  }

  restoreNodesBackup(autoscale) {
    const { lowest, desired, highest } = this.nodesBackup;

    if (autoscale) {
      this.model.nodes.highest = { ...highest };
      this.model.nodes.lowest = { ...lowest };
    } else {
      this.model.nodes.desired = { ...desired };
    }
  }

  getAutoscalingInfoLink() {
    return AUTOSCALING_LINK[this.ovhSubsidiary] || AUTOSCALING_LINK.DEFAULT;
  }

  onAutoscaleChanged(autoscale) {
    this.createNodesBackup(autoscale.status);
    this.restoreNodesBackup(autoscale.status);

    AutoscalingController.triggerHandlerFunction(
      this.onAutoscalePoolChanged,
      autoscale,
    );
  }

  onLowestValueChange(min) {
    const { desired, highest } = this.model.nodes;

    if (this.model.autoscale) {
      highest.min = min.value;
    }

    this.setAutoscalingValidity(min.value, desired.value, highest.value);
    AutoscalingController.triggerHandlerFunction(
      this.onLowestPoolValueChanged,
      min,
    );
  }

  onDesiredValueChange(need) {
    const { lowest, highest } = this.model.nodes;

    if (!this.model.autoscale) {
      lowest.value = need.value;
    }

    this.setAutoscalingValidity(lowest.value, need.value, highest.value);
    AutoscalingController.triggerHandlerFunction(
      this.onDesiredPoolValueChanged,
      need,
    );
  }

  onHighestValueChange(max) {
    const { lowest, desired } = this.model.nodes;

    if (this.model.autoscale) {
      lowest.max = max.value;
    }

    this.setAutoscalingValidity(lowest.value, desired.value, max.value);
    AutoscalingController.triggerHandlerFunction(
      this.onHighestPoolValueChanged,
      max,
    );
  }

  static triggerHandlerFunction(fn, data) {
    if (fn instanceof Function) fn(data);
  }

  static isValidKubeScale(autoscale, min, desired, max) {
    if (autoscale) {
      return min < max;
    }

    return desired > SCALE_DEFAULT_VALUES.LOWEST_MIN_VALUE;
  }
}
