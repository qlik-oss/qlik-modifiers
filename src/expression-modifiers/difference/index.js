import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'difference',
  disabled: false,
  primaryDimension: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

export default {
  translationKey: 'properties.modifier.difference',

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
    const expWithExcludedComp = helper.getExpressionWithExcludedComp({
      expression,
      modifier,
      dimensions,
      dimensionAndFieldList,
    });
    const aboveComp = helper.getAboveComp(
      modifier,
      numberOfDims,
      expWithExcludedComp,
    );
    const differenceComp = `${expWithExcludedComp} - ${aboveComp}`;
    let generatedExpression = differenceComp;

    if (helper.needDimension({ modifier, properties, layout })) {
      const dim1Comp = helper.getDimComp(dimensions, 1);
      const dim2Comp = helper.getDimComp(dimensions, 0);
      const aggrComp = helper.getAggrComp(
        generatedExpression,
        dim1Comp,
        dim2Comp,
      );
      generatedExpression = !modifier.showExcludedValues
        ? aggrComp
        : helper.getExcludedComp({
          modifier,
          dimensions,
          dimensionAndFieldList,
          funcComp: 'Only',
          valueComp: aggrComp,
        });
    }
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
