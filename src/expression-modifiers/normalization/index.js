import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'normalization',
  disabled: false,
  primaryDimension: 0,
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

function getAggrWithField(expression, numberOfDims, field, value) {
  const dimsComp = getDimsComp(numberOfDims);
  return `Aggr({$<${field}={'${value}'}>} ${expression}, ${dimsComp})`;
}

function getTotal(expression) {
  return `Total ${expression}`;
}

function getTotalDim(expression, dim) {
  return `Total <${dim}> ${expression}`;
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

function getField(expression, field, value) {
  return `{$<${field}={'${value}'}>} ${expression}`;
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
    const { field, value } = modifier;
    switch (modifier.selectionScope) {
      case 0:
        switch (modifier.dimensionalScope) {
          case 0:
            // Relative to the total within the group
            generatedExpression = dimensions.length > 1 ? getSum(getTotalDim(getAggr(generatedExpression, numberOfDims), helper.getDimDefWithWrapper(modifier.primaryDimension))) : expWithExcludedComp;
            break;
          case 1:
            generatedExpression = expWithExcludedComp;
            break;
          case 2:
            // Relative to total selection
            generatedExpression = getSum(getTotal(getAggr(generatedExpression, numberOfDims)));
            break;
          default:
            generatedExpression = expWithExcludedComp;
        }
        break;
      case 1:
        switch (modifier.dimensionalScope) {
          case 0:
            generatedExpression = dimensions.length > 1 ? getSum(getField(getTotalDim(getAggrWithField(generatedExpression, numberOfDims, field, value), helper.getDimDefWithWrapper(modifier.primaryDimension)), field, value)) : expWithExcludedComp;
            break;
          case 1:
            generatedExpression = getSum(getField(getAggrWithField(generatedExpression, numberOfDims, field, value), field, value));
            break;
          case 2:
            generatedExpression = getSum(getField(getTotal(getAggrWithField(generatedExpression, numberOfDims, field, value)), field, value));
            break;
          default:
            generatedExpression = expWithExcludedComp;
        }
        break;
      case 2:
        switch (modifier.dimensionalScope) {
          case 0:
            generatedExpression = dimensions.length > 1 ? getSumDisregardSelect(getTotalDim(getAggrDisregardSelect(generatedExpression, numberOfDims), helper.getDimDefWithWrapper(modifier.primaryDimension))) : expWithExcludedComp;
            break;
          case 1:
            // Relative to dimensional universe
            generatedExpression = getSumDisregardSelect(getAggrDisregardSelect(generatedExpression, numberOfDims));
            break;
          case 2:
            // Relative to total universe
            generatedExpression = getSumDisregardSelect(getTotal(getAggrDisregardSelect(generatedExpression, numberOfDims)));
            break;
          default:
            generatedExpression = expWithExcludedComp;
        }
        break;
      default:
        generatedExpression = expWithExcludedComp;
    }
    generatedExpression = generatedExpression === expWithExcludedComp ? undefined : getDivide(expWithExcludedComp, generatedExpression);
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
