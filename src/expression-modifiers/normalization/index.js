import util from '../../utils/util';
import helper from '../helper';
import propertyPanelDef from './properties';

const DEFAULT_OPTIONS = {
  type: 'normalization',
  disabled: false,
  primaryDimension: 0,
  outputExpression: '',
  dimensionalScope: 2,
  selectionScope: 2,
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

function getDisregardSelectionComp(selectionScope) {
  return selectionScope === 2 ? '{1}' : '';
}

function getFieldSelectionComp(selectionScope, field, value) {
  return selectionScope === 1 ? `{$<${helper.getFieldWithWrapper(field)}={'${value}'}>}` : '';
}

function getTotalComp(dimScope, numberOfDims) {
  return (dimScope === 0 && numberOfDims > 1) || dimScope === 2 ? 'Total' : '';
}

function getSelectedDimComp(dimScope, numberOfDims, dim) {
  return dimScope === 0 && numberOfDims > 1 ? `<${helper.getDimDefWithWrapper(dim)}>` : '';
}

function generateExp(exp, selectionScope, field, value, dimScope, numberOfDims, dim) {
  const DISREGARD_SELECTION = getDisregardSelectionComp(selectionScope);
  const FIELD_SELECTOON = getFieldSelectionComp(selectionScope, field, value);
  const SELECTION = DISREGARD_SELECTION === '' && FIELD_SELECTOON === '' ? '' : DISREGARD_SELECTION || FIELD_SELECTOON;
  const TOTAL = getTotalComp(dimScope, numberOfDims);
  const SELECTED_DIM = getSelectedDimComp(dimScope, numberOfDims, dim);
  const DIM = getDimsComp(numberOfDims);
  return `${exp}/ Sum(${SELECTION} ${TOTAL}${SELECTED_DIM} Aggr(${SELECTION} ${exp}, ${DIM}))`;
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
    const {
      selectionScope, dimensionalScope, field, value, primaryDimension,
    } = modifier;
    generatedExpression = generateExp(expWithExcludedComp, selectionScope, field, value, dimensionalScope, numberOfDims, primaryDimension);
    return generatedExpression;
  },

  initModifier(modifier) {
    Object.keys(DEFAULT_OPTIONS).forEach((key) => {
      if (modifier[key] === undefined) {
        modifier[key] = DEFAULT_OPTIONS[key]; // eslint-disable-line no-param-reassign
      }
    });
  },

  updateModifier(modifier, qDef) {
    const numberOfDimensions = qDef.qDimensions ? qDef.qDimensions.length : 0;
    if (numberOfDimensions === 1 && modifier.dimensionalScope === 0) {
      // eslint-disable-next-line no-param-reassign
      modifier.dimensionalScope = 2;
    }
  },

  enableTotalsFunction() {
    // if (measure.qDef.modifiers) {
    //   const { modifiers } = measure.qDef;
    //   for (let i = 0; i < modifiers.length; i++) {
    //     if (modifiers[i].type === DEFAULT_OPTIONS.type && modifiers[i].disabled === false && modifiers[i].dimensionalScope === 2) { return true; }
    //   }
    // }
    return true;
  },

  propertyPanelDef,

  getDisregardSelectionComp,

  getFieldSelectionComp,

  getTotalComp,

  getSelectedDimComp,
};
