import util from '../../utils/util';
import helper from '../helper';

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
  nullSuppression: false,
};

const maxNumDimensionsSupported = 2;

function getDivisorComp(modifier, numDimensions) {
  const rowNo = helper.getRowNoComp(modifier, numDimensions);
  if (!helper.isFullRange(modifier)) {
    const { steps } = modifier;
    const numSteps = typeof steps === 'number' && !Number.isNaN(steps) ? steps : 6;
    return `RangeMin(${numSteps}, ${rowNo})`;
  }
  return rowNo;
}

export default {
  translationKey: 'properties.modifier.movingAverage',

  needDimension: helper.needDimension,

  isApplicable({ properties, layout }) {
    return helper.isApplicable({
      properties, layout, minDimensions: 1, maxDimensions: maxNumDimensionsSupported,
    });
  },

  generateExpression({
    expression, modifier, properties, libraryItemsProps, layout, numDimensions, dimensionAndFieldList,
  }) {
    if (!modifier) {
      return expression;
    }
    let averageComp;
    let numberOfDims = numDimensions;
    if (typeof numberOfDims === 'undefined') {
      numberOfDims = helper.getNumDimensions({ properties, layout });
    }
    const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
    const treatMissingAsNull = modifier.showExcludedValues && modifier.nullSuppression;
    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression, modifier, dimensions, libraryItemsProps, dimensionAndFieldList, treatMissingAsNull,
    });
    const numStepComp = helper.getNumStepComp(modifier, numberOfDims);
    const aboveComp = helper.getAboveComp(modifier, numberOfDims, expWithExcludedComp, numStepComp);
    if (modifier.nullSuppression) {
      averageComp = helper.getRangeComp('RangeAvg', aboveComp);
    } else {
      const rangeSumComp = helper.getRangeComp('RangeSum', aboveComp);
      const divisorComp = getDivisorComp(modifier, numberOfDims);
      averageComp = `${rangeSumComp} / ${divisorComp}`;
    }
    let generatedExpression = averageComp;

    if (helper.needDimension({ modifier, properties, layout })) {
      const dim1Comp = helper.getDimComp(dimensions, 1, libraryItemsProps);
      const dim2Comp = helper.getDimComp(dimensions, 0, libraryItemsProps);
      const aggrComp = helper.getAggrComp(generatedExpression, dim1Comp, dim2Comp);
      generatedExpression = !modifier.showExcludedValues ? aggrComp
        : helper.getExcludedComp({
          modifier, dimensions, libraryItemsProps, dimensionAndFieldList, funcComp: 'Only', valueComp: aggrComp,
        });
    }
    return generatedExpression;
  },

  extractInputExpression: helper.extractInputExpression,

  initModifier(modifier) {
    helper.initModifier(modifier, DEFAULT_OPTIONS);
  },

  propertyPanelDef,
};
