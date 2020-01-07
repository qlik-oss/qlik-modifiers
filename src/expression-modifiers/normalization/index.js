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

function getAggrOneDim(expression, dim1) {
  return `Aggr(${expression}, ${dim1})`;
}

function getAggrDisregardSelect(expression, dim1) {
  return `Aggr({1}${expression}, ${dim1})`;
}

function getTotal(expression) {
  return `total ${expression}`;
}
function getSum(expression) {
  return `Sum (${expression})`;
}

function getDivide(measureExp, expression) {
  return `${measureExp}/${expression}`;
}

function getSumDisregardSelec(expression) {
  return `Sum({1} ${expression})`;
}

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
    const dim = helper.getDimDefWithWrapper(modifier.primaryDimension);

    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression,
      modifier,
      dimensions,
      dimensionAndFieldList,
    });

    let generatedExpression = expWithExcludedComp;

    switch (modifier.relativeNumbers) {
      case 0:
        generatedExpression = getSum(getTotal(getAggrOneDim(generatedExpression, dim)));
        break;
      case 1:
        generatedExpression = getSumDisregardSelec(getAggrDisregardSelect(generatedExpression, dim));
        break;
      case 2:
        generatedExpression = getSumDisregardSelec(getTotal(getAggrDisregardSelect(generatedExpression, dim)));
        break;
      default:
        generatedExpression = expWithExcludedComp;
    }
    generatedExpression = getDivide(expWithExcludedComp, generatedExpression);
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
