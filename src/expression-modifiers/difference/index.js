import util from '../../utils/util';
import helper from '../accumulation/helper';
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

function getPrefix({
  modifier, properties, layout,
}) {
  const aggrCompPrefix = helper.needDimension({ modifier, properties, layout }) ? 'Aggr(' : '';
  return aggrCompPrefix;
}

function getSuffix({
  modifier, numDimensions,
}) {
  const excludedComp = helper.getExcludedComp(modifier);
  const aboveCompPrefix = helper.getAboveCompPrefix(modifier, numDimensions);
  return `${excludedComp} - ${aboveCompPrefix}`;
}

export default {
  translationKey: 'properties.modifier.difference',

  needDimension: helper.needDimension,

  isApplicable({ properties, layout }) {
    return helper.getNumDimensions({ properties, layout }) <= maxNumDimensionsSupported;
  },

  extractInputExpression({
    outputExpression, modifier, properties, layout, numDimensions,
  }) {
    if (!modifier) {
      return;
    }
    const prefix = getPrefix({
      modifier, properties, layout, numDimensions,
    });
    const idx1 = prefix ? outputExpression.indexOf(prefix) : 0;
    if (idx1 === -1) {
      return;
    }
    const suffix = getSuffix({
      modifier, numDimensions,
    });
    const idx2 = outputExpression.lastIndexOf(suffix);
    if (idx2 === -1) {
      return;
    }
    const exp = outputExpression.substring(idx1 + prefix.length, idx2);
    return exp; // eslint-disable-line consistent-return
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
    const expComp = helper.getExpressionComp(expression);
    const aboveComp = helper.getAboveComp(modifier, numberOfDims, expComp);
    const excludedComp = helper.getExcludedComp(modifier);
    const differenceComp = `${expComp}${excludedComp} - ${aboveComp}`;
    let generatedExpression = differenceComp;

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
    Object.keys(DEFAULT_OPTIONS).forEach((key) => {
      if (modifier[key] === undefined) {
        modifier[key] = DEFAULT_OPTIONS[key]; // eslint-disable-line no-param-reassign
      }
    });
  },

  propertyPanelDef,
};
