import helper from '../helper';

import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'timeSeriesDecomposition',
  disabled: false,
  primaryDimension: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  decomposition: '',
  steps: 12,
  outputExpression: '',
  nullSuppression: false,
};

export default {
  translationKey: 'properties.modifier.timeSeriesDecomposition',

  needDimension: helper.needDimension,

  isApplicable({ properties, layout }) {
    return helper.isApplicable({
      properties,
      layout,
      minDimensions: 1,
      maxDimensions: 2,
    });
  },
  generateExpression({
    expression,
    modifier,
    properties,
  }) {
    if (!modifier) {
      return expression;
    }
    return helper.generateTSDExpression(modifier, expression, properties);
  },

  extractInputExpression: helper.extractInputExpression,

  initModifier(modifier) {
    helper.initModifier(modifier, DEFAULT_OPTIONS);
  },

  enableTotalsFunction: () => false,

  propertyPanelDef,
};
