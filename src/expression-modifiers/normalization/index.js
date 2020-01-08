import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'normalization',
  disabled: false,
  primaryDimension: 0,
  relativeNumbers: 0,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

function getDimsComp(numberOfDims) {
  const dims = [];
  for (let i = 0; i < numberOfDims; i++) {
    dims[i] = helper.getDimDefWithWrapper(i);
  }
  const s = dims.join(', ');
  return s;
}

function getAggr(expression, numberOfDims) {
  const dimsComp = getDimsComp(numberOfDims);
  return `Aggr(${expression}, ${dimsComp})`;
}

function getAggrDisregardSelect(expression, numberOfDims) {
  const dimsComp = getDimsComp(numberOfDims);
  return `Aggr({1}${expression}, ${dimsComp})`;
}

function getTotal(expression) {
  return `Total ${expression}`;
}
function getSum(expression) {
  return `Sum(${expression})`;
}

function getDivide(measureExp, expression) {
  return `${measureExp}/${expression}`;
}

function getSumDisregardSelect(expression) {
  return `Sum({1} ${expression})`;
}

export default {
  translationKey: 'properties.modifier.normalization',

  needDimension: () => true,

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
    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression,
      modifier,
      dimensions,
      dimensionAndFieldList,
    });

    let generatedExpression = expWithExcludedComp;

    switch (modifier.relativeNumbers) {
      case 0:
        generatedExpression = getSum(getTotal(getAggr(generatedExpression, numberOfDims)));
        break;
      case 1:
        generatedExpression = getSumDisregardSelect(getAggrDisregardSelect(generatedExpression, numberOfDims));
        break;
      case 2:
        generatedExpression = getSumDisregardSelect(getTotal(getAggrDisregardSelect(generatedExpression, numberOfDims)));
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
