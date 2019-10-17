import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'accumulation',
  disabled: false,
  accumulationDimension: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  fullAccumulation: false,
  steps: 6,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

export default {
  translationKey: 'properties.modifier.accumulation',

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
    let numberOfDims = numDimensions;
    if (typeof numberOfDims === 'undefined') {
      numberOfDims = helper.getNumDimensions({ properties, layout });
    }
    const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression, modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
    });
    const numStepComp = helper.getNumStepComp(modifier, numberOfDims);
    const aboveComp = helper.getAboveComp(modifier, numberOfDims, expWithExcludedComp, numStepComp);
    const rangeSumComp = helper.getRangeComp('RangeSum', aboveComp);
    let generatedExpression = rangeSumComp;

    if (helper.needDimension({ modifier, properties, layout })) {
      const dim1Comp = helper.getDimComp(dimensions, 1, libraryItemsProps);
      const dim2Comp = helper.getDimComp(dimensions, 0, libraryItemsProps);
      const aggrComp = helper.getAggrComp(generatedExpression, dim1Comp, dim2Comp);
      generatedExpression = aggrComp;
    }
    return generatedExpression;
  },

  extractInputExpression: helper.extractInputExpression,

  initModifier(modifier) {
    helper.initModifier(modifier, DEFAULT_OPTIONS);
  },

  propertyPanelDef,
};
