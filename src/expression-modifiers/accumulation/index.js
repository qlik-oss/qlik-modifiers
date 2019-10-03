import util from '../../utils/util';
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

function simplifyExpression(expression) {
  const s = expression.trim();
  const expComp = s.substring(0, 1) === '=' ? s.substring(1).trim() : s;
  return expComp;
}

function getDimSortCriterias(dimensions, dimIdx = 0) {
  const dimension = dimensions[dimIdx];
  return dimension.qDef.qSortCriterias[0];
}

function getDimDef(dimensions, dimIdx = 0, libraryItemsProps) {
  const dimension = dimensions[dimIdx];
  return dimension.qLibraryId
    ? libraryItemsProps[dimension.qLibraryId].qDim.qFieldDefs[0]
    : dimension.qDef.qFieldDefs[0];
}

function getDimComp(dimensions, dimIdx, libraryItemsProps) {
  const sortCriterias = getDimSortCriterias(dimensions, dimIdx);
  const dimDef = getDimDef(dimensions, dimIdx, libraryItemsProps);
  if (!sortCriterias.qSortByExpression && !sortCriterias.qSortByNumeric && !sortCriterias.qSortByAscii) {
    return `[${dimDef}]`;
  }
  const type = ['Descending', 'Ascending'];
  const numericComp = sortCriterias.qSortByNumeric ? `(Numeric, ${type[(sortCriterias.qSortByNumeric + 1) / 2]})` : '';
  const textComp = sortCriterias.qSortByAscii ? `(Text, ${type[(sortCriterias.qSortByAscii + 1) / 2]})` : '';
  if (sortCriterias.qSortByNumeric && sortCriterias.qSortByAscii) {
    return `([${dimDef}], ${numericComp}, ${textComp})`;
  }
  if (sortCriterias.qSortByNumeric) {
    return `([${dimDef}], ${numericComp})`;
  }
  if (sortCriterias.qSortByAscii) {
    return `([${dimDef}], ${textComp})`;
  }
  return `[${dimDef}]`;
}

function getNumStepComp(modifier, numDimensions) {
  const { crossAllDimensions, fullAccumulation, steps } = modifier;
  if (!fullAccumulation) {
    return typeof steps === 'number' && !Number.isNaN(steps) ? steps : 6;
  }
  return numDimensions === 2 && crossAllDimensions ? 'RowNo(Total)' : 'RowNo()';
}

function getAboveCompPrefix(modifier, numDimensions) {
  const { crossAllDimensions } = modifier;
  return numDimensions === 2 && crossAllDimensions ? 'Above(Total ' : 'Above(';
}

function getAboveCompSuffix(numStepComp) {
  return `, 0, ${numStepComp})`;
}

function getAboveComp(modifier, numDimensions, expComp, numStepComp) {
  const aboveCompPrefix = getAboveCompPrefix(modifier, numDimensions);
  const aboveCompSuffix = getAboveCompSuffix(numStepComp);
  return aboveCompPrefix + expComp + aboveCompSuffix;
}

function getExpressionComp(modifier, expression) {
  const { showExcludedValues } = modifier;
  const expComp = simplifyExpression(expression);
  return showExcludedValues ? `${expComp} + Sum({1} 0)` : expComp;
}

function getRangeSumCompPrefix() {
  return 'RangeSum(';
}

function getFunctionSuffix() {
  return ')';
}

function getRangeSumComp(comp) {
  const rangeSumPrefix = getRangeSumCompPrefix();
  const rangeSumSuffix = getFunctionSuffix();
  return rangeSumPrefix + comp + rangeSumSuffix;
}

function getAggrComp(comp1, comp2, comp3) {
  return `Aggr(${comp1}, ${comp2}, ${comp3})`;
}

function getNumDimensions({ properties, layout }) {
  return util.getValue(properties, 'qHyperCubeDef.qDimensions', util.getValue(layout, 'qHyperCube.qDimensionInfo', []))
    .length;
}

function needDimension({ modifier, properties, layout }) {
  return getNumDimensions({ properties, layout }) === 2 && modifier.accumulationDimension === 0;
}

export default {
  translationKey: 'properties.modifier.accumulation',

  needDimension,

  simplifyExpression,

  isApplicable({ properties, layout }) {
    return getNumDimensions({ properties, layout }) <= maxNumDimensionsSupported;
  },

  extractInputExpression({
    outputExpression, modifier, properties, layout, numDimensions,
  }) {
    if (!modifier) {
      return;
    }
    let numberOfDims;
    if (typeof numDimensions === 'undefined') {
      numberOfDims = getNumDimensions({ properties, layout });
    }
    const numStepComp = getNumStepComp(modifier, numberOfDims);
    const aboveCompPrefix = getAboveCompPrefix(modifier, numberOfDims);
    const rangeSumCompPrefix = getRangeSumCompPrefix();
    const aggrCompPrefix = needDimension({ modifier, properties, layout }) ? 'Aggr(' : '';
    const prefix = aggrCompPrefix + rangeSumCompPrefix + aboveCompPrefix;
    const idx1 = outputExpression.indexOf(prefix);
    if (idx1 === -1) {
      return;
    }
    const aboveCompSuffix = getAboveCompSuffix(numStepComp);
    const rangeSumCompSuffix = getFunctionSuffix();
    const suffix = aboveCompSuffix + rangeSumCompSuffix;
    const idx2 = outputExpression.lastIndexOf(suffix);
    if (idx2 === -1) {
      return;
    }
    let exp = outputExpression.substring(idx1 + prefix.length, idx2);
    const { showExcludedValues } = modifier;
    if (showExcludedValues) {
      const expCompSuffix = ' + Sum({1} 0)';
      if (exp.substring(exp.length - expCompSuffix.length) !== expCompSuffix) {
        return;
      }
      exp = exp.substring(0, exp.length - expCompSuffix.length);
    }
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
      numberOfDims = getNumDimensions({ properties, layout });
    }
    const expComp = getExpressionComp(modifier, expression);
    const numStepComp = getNumStepComp(modifier, numberOfDims);
    const aboveComp = getAboveComp(modifier, numberOfDims, expComp, numStepComp);
    const rangeSumComp = getRangeSumComp(aboveComp);
    let generatedExpression = rangeSumComp;

    if (needDimension({ modifier, properties, layout })) {
      const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
      const dim1Comp = getDimComp(dimensions, 1, libraryItemsProps);
      const dim2Comp = getDimComp(dimensions, 0, libraryItemsProps);
      const aggrComp = getAggrComp(rangeSumComp, dim1Comp, dim2Comp);
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
