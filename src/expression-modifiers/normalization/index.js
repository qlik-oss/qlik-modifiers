import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'normalization',
  disabled: false,
  primaryDimension: 0,
  relativeNumbers: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  fullNormalization: false,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

export default {
  translationKey: 'properties.modifier.normalization',

  needDimension: helper.needDimension,

  isApplicable({ properties, layout }) {
    return helper.isApplicable({
      properties,
      layout,
      minDimensions: 1,
      maxDimensions: maxNumDimensionsSupported,
    });
  },

  extractInputExpression: helper.extractInputExpression,

  generateExpression({
    expression,
    modifier,
    properties,
    layout,
    numDimensions,
    dimensionAndFieldList,
  }) {
    if (!modifier) {
      return expression;
    }
    let numberOfDims = numDimensions;
    if (typeof numberOfDims === 'undefined') {
      numberOfDims = helper.getNumDimensions({ properties, layout });
    }
    const dimensions = util.getValue(
      properties,
      'qHyperCubeDef.qDimensions',
      [],
    );
    const dim1 = helper.getDimDefWithWrapper(0);

    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression,
      modifier,
      dimensions,
      dimensionAndFieldList,
    });

    let generatedExpression = expWithExcludedComp;

    switch (modifier.relativeNumbers) {
      case 0:
        generatedExpression = helper.getSum(helper.getTotal(helper.getAggrOneDim(generatedExpression, dim1)));
        break;
      case 1:
        generatedExpression = helper.getSumDisregardSelec(helper.getAggrDisregadSelec(generatedExpression, dim1));
        break;
      case 2:
        generatedExpression = helper.getSumDisregardSelec(helper.getTotal(helper.getAggrDisregadSelec(generatedExpression, dim1)));
        break;
      default:
        generatedExpression = expWithExcludedComp;
    }
    generatedExpression = helper.getDivide(expWithExcludedComp, generatedExpression);
    return generatedExpression;
  },

  initModifier(modifier) {
    Object.keys(DEFAULT_OPTIONS).forEach((key) => {
      if (modifier[key] === undefined) {
        modifier[key] = DEFAULT_OPTIONS[key]; // eslint-disable-line no-param-reassign
      }
    });
  },

  propertyPanelDef,
};
