import helper from '../helper';

import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'timeSeriesDecomposition',
  disabled: false,
  decomposition: '',
  steps: 2,
  outputExpression: '',
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
  initModifier(modifier, measure) {
    helper.initModifier(modifier, DEFAULT_OPTIONS);
    if (modifier.decomposition === '' && measure) {
      // eslint-disable-next-line no-param-reassign
      modifier.decomposition = helper.getDecomposition(measure);
    }
  },
  propertyPanelDef,
};
