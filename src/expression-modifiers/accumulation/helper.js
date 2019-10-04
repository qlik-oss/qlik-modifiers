import util from '../../utils/util';

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
  return typeof numStepComp === 'undefined' ? ')' : `, 0, ${numStepComp})`;
}

function getAboveComp(modifier, numDimensions, expComp, numStepComp) {
  const aboveCompPrefix = getAboveCompPrefix(modifier, numDimensions);
  const aboveCompSuffix = getAboveCompSuffix(numStepComp);
  return aboveCompPrefix + expComp + aboveCompSuffix;
}

function getExcludedComp(modifier = {}) {
  const { showExcludedValues } = modifier;
  return showExcludedValues ? ' + Sum({1} 0)' : '';
}

function getExpressionComp(expression, modifier) {
  const expComp = simplifyExpression(expression);
  const excludedComp = getExcludedComp(modifier);
  return expComp + excludedComp;
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
  const primaryDimension = typeof modifier.primaryDimension === 'undefined' ? modifier.accumulationDimension : modifier.primaryDimension;
  return getNumDimensions({ properties, layout }) === 2 && primaryDimension === 0;
}

function getPrefix({
  modifier, properties, layout, numDimensions,
}) {
  let numberOfDims;
  if (typeof numDimensions === 'undefined') {
    numberOfDims = getNumDimensions({ properties, layout });
  }
  const aboveCompPrefix = getAboveCompPrefix(modifier, numberOfDims);
  const rangeSumCompPrefix = getRangeSumCompPrefix();
  const aggrCompPrefix = needDimension({ modifier, properties, layout }) ? 'Aggr(' : '';
  return aggrCompPrefix + rangeSumCompPrefix + aboveCompPrefix;
}

function getSuffix({
  modifier, properties, layout, numDimensions,
}) {
  let numberOfDims;
  if (typeof numDimensions === 'undefined') {
    numberOfDims = getNumDimensions({ properties, layout });
  }
  const numStepComp = getNumStepComp(modifier, numberOfDims);
  const aboveCompSuffix = getAboveCompSuffix(numStepComp);
  const rangeSumCompSuffix = getFunctionSuffix();
  return aboveCompSuffix + rangeSumCompSuffix;
}

function removeExcludedComp(exp, modifier) {
  const excludedComp = getExcludedComp(modifier);
  if (excludedComp) {
    if (exp.substring(exp.length - excludedComp.length) !== excludedComp) {
      return exp;
    }
    return exp.substring(0, exp.length - excludedComp.length);
  }
  return exp;
}

function extractInputExpression({
  outputExpression, modifier, properties, layout, numDimensions,
}) {
  if (!modifier) {
    return;
  }
  const prefix = getPrefix({
    modifier, properties, layout, numDimensions,
  });
  const idx1 = outputExpression.indexOf(prefix);
  if (idx1 === -1) {
    return;
  }
  const suffix = getSuffix({
    modifier, properties, layout, numDimensions,
  });
  const idx2 = outputExpression.lastIndexOf(suffix);
  if (idx2 === -1) {
    return;
  }
  const exp = outputExpression.substring(idx1 + prefix.length, idx2);
  return removeExcludedComp(exp, modifier); // eslint-disable-line consistent-return
}

function initModifier(modifier, defaultOptions) {
  Object.keys(defaultOptions).forEach((key) => {
    if (modifier[key] === undefined) {
      modifier[key] = defaultOptions[key]; // eslint-disable-line no-param-reassign
    }
  });
}

export default {
  getNumDimensions,

  getExpressionComp,

  getNumStepComp,

  getAboveCompPrefix,

  getAboveCompSuffix,

  getAboveComp,

  getRangeSumCompPrefix,

  getFunctionSuffix,

  getRangeSumComp,

  getAggrComp,

  getExcludedComp,

  needDimension,

  getDimComp,

  simplifyExpression,

  extractInputExpression,

  initModifier,

};
