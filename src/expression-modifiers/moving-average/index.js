import util from '../../utils/util';
import helper from '../accumulation/helper';

import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'movingAverage',
  disabled: false,
  primaryDimension: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  fullRange: false,
  steps: 6,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

function getDivisorComp(modifier, numDimensions) {
  const { crossAllDimensions, fullRange, steps } = modifier;
  const rowNo = numDimensions === 2 && crossAllDimensions ? 'RowNo(Total)' : 'RowNo()';
  if (!fullRange) {
    const numSteps = typeof steps === 'number' && !Number.isNaN(steps) ? steps : 6;
    return `RangeMin(${numSteps}, ${rowNo})`;
  }
  return rowNo;
}

export default {
  translationKey: 'properties.modifier.movingAverage',

  needDimension: helper.needDimension,

  extractInputExpression: helper.extractInputExpression,

  isApplicable({ properties, layout }) {
    return helper.getNumDimensions({ properties, layout }) <= maxNumDimensionsSupported;
  },

  generateExpression({
    expression, modifier, properties, libraryItemsProps, layout, numDimensions,
  }) {
    if (!modifier) {
      return expression;
    }
    let numberOfDims = numDimensions;
    if (typeof numberOfDims === 'undefined') {
      numberOfDims = helper.getNumDimensions({ properties, layout });
    }
    const expComp = helper.getExpressionComp(expression, modifier);
    const numStepComp = helper.getNumStepComp(modifier, numberOfDims);
    const aboveComp = helper.getAboveComp(modifier, numberOfDims, expComp, numStepComp);
    const rangeSumComp = helper.getRangeSumComp(aboveComp);
    const divisorComp = getDivisorComp(modifier, numberOfDims);
    const averageComp = `${rangeSumComp} / ${divisorComp}`;
    let generatedExpression = averageComp;

    if (helper.needDimension({ modifier, properties, layout })) {
      const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
      const dim1Comp = helper.getDimComp(dimensions, 1, libraryItemsProps);
      const dim2Comp = helper.getDimComp(dimensions, 0, libraryItemsProps);
      const aggrComp = helper.getAggrComp(generatedExpression, dim1Comp, dim2Comp);
      generatedExpression = aggrComp;
    }
    return generatedExpression;
  },

  initModifier(modifier) {
    helper.initModifier(modifier, DEFAULT_OPTIONS);
  },

  propertyPanelDef,
};
