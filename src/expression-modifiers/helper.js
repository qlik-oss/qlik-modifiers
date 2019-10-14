import util from '../utils/util';

function findLibraryDimension(id, dimensionList) {
  if (!dimensionList) {
    return null;
  }
  let i;
  let layout;
  for (i = 0; i < dimensionList.length; i++) {
    layout = dimensionList[i];
    if (layout.qInfo.qId === id) {
      return layout;
    }
  }
  return null;
}

function getField(expression) {
  let exp = expression.trim();
  if (exp.charAt(0) === '=') {
    exp = exp.substring(1);
    exp = exp.trim();
  }
  const lastIndex = exp.length - 1;
  if (exp.charAt(0) === '[' && exp.charAt(lastIndex) === ']') {
    exp = exp.substring(1, lastIndex);
    exp = exp.trim();
  }
  return exp;
}

function findField(name, fieldList) {
  if (!fieldList) {
    return null;
  }
  let i;
  let field;
  const name2 = getField(name);
  for (i = 0; i < fieldList.length; i++) {
    field = fieldList[i];
    if (field.qName === name2) {
      return field;
    }
    if (field.qDerivedFieldData) {
      for (let j = 0; j < field.qDerivedFieldData.qDerivedFieldLists.length; ++j) {
        const derived = field.qDerivedFieldData.qDerivedFieldLists[j];
        for (let k = 0; k < derived.qFieldDefs.length; ++k) {
          const derivedField = derived.qFieldDefs[k];
          if (derivedField.qName === name2) {
            return derivedField;
          }
        }
      }
    }
  }
  return null;
}

function isNumeric(dimension, dimensionAndFieldList = {}) {
  if (dimension.qLibraryId) {
    const libDim = findLibraryDimension(dimension.qLibraryId, dimensionAndFieldList.dimensionList);
    return libDim && libDim.qData.info[0].qTags.indexOf('$numeric') > -1;
  }
  const field = findField(dimension.qDef.qFieldDefs[0], dimensionAndFieldList.fieldList);
  return field && field.qTags.indexOf('$numeric') > -1;
}

function getPrimaryDimension(modifier) {
  return typeof modifier.primaryDimension === 'undefined' ? modifier.accumulationDimension : modifier.primaryDimension;
}

function isFullRange(modifier) {
  return !!(modifier.fullAccumulation || modifier.fullRange);
}

function getRowNoComp(modifier, numDimensions) {
  const { crossAllDimensions } = modifier;
  return numDimensions === 2 && crossAllDimensions ? 'RowNo(Total)' : 'RowNo()';
}

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

function getDimDefWithWrapper(dimensions, dimIdx = 0, libraryItemsProps) {
  const dimDef = getDimDef(dimensions, dimIdx, libraryItemsProps);
  return `[${dimDef}]`;
}

function getDimComp(dimensions, dimIdx, libraryItemsProps) {
  const sortCriterias = getDimSortCriterias(dimensions, dimIdx);
  const dimDef = getDimDefWithWrapper(dimensions, dimIdx, libraryItemsProps);
  if (!sortCriterias.qSortByExpression && !sortCriterias.qSortByNumeric && !sortCriterias.qSortByAscii) {
    return dimDef;
  }
  const type = ['Descending', 'Ascending'];
  const numericComp = sortCriterias.qSortByNumeric ? `(Numeric, ${type[(sortCriterias.qSortByNumeric + 1) / 2]})` : '';
  const textComp = sortCriterias.qSortByAscii ? `(Text, ${type[(sortCriterias.qSortByAscii + 1) / 2]})` : '';
  if (sortCriterias.qSortByNumeric && sortCriterias.qSortByAscii) {
    return `(${dimDef}, ${numericComp}, ${textComp})`;
  }
  if (sortCriterias.qSortByNumeric) {
    return `(${dimDef}, ${numericComp})`;
  }
  if (sortCriterias.qSortByAscii) {
    return `(${dimDef}, ${textComp})`;
  }
  return dimDef;
}

function getNumStepComp(modifier, numDimensions) {
  if (!isFullRange(modifier)) {
    const { steps } = modifier;
    return typeof steps === 'number' && !Number.isNaN(steps) ? steps : 6;
  }
  return getRowNoComp(modifier, numDimensions);
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

function getExcludedComp({
  modifier = {}, dimensions, libraryItemsProps, dimensionAndFieldList,
}) {
  const { showExcludedValues } = modifier;
  if (!showExcludedValues) {
    return '';
  }
  if (dimensions && dimensions.length === 1) {
    const isDim1Numeric = isNumeric(dimensions[0], dimensionAndFieldList);
    if (isDim1Numeric) {
      const dim1 = getDimDefWithWrapper(dimensions, 0, libraryItemsProps);
      const filter1 = `${dim1}={">=$(=Min(${dim1}))<=$(=Max(${dim1}))"}`;
      return ` + Sum({1<${filter1}>}0)`;
    }
  }
  if (dimensions && dimensions.length === 2) {
    const isDim1Numeric = isNumeric(dimensions[0], dimensionAndFieldList);
    const isDim2Numeric = isNumeric(dimensions[1], dimensionAndFieldList);
    const dim1 = getDimDefWithWrapper(dimensions, 0, libraryItemsProps);
    const dim2 = getDimDefWithWrapper(dimensions, 1, libraryItemsProps);
    if (isDim1Numeric) {
      const filter1 = `${dim1}={">=$(=Min(${dim1}))<=$(=Max(${dim1}))"}`;
      if (isDim2Numeric) {
        const filter2 = `${dim2}={">=$(=Min(${dim2}))<=$(=Max(${dim2}))"}`;
        return ` + Sum({1<${filter1},${filter2}>}0)`;
      }
      return ` + Sum({1<${filter1}>}0)`;
    }
    if (isDim2Numeric) {
      const filter2 = `${dim2}={">=$(=Min(${dim2}))<=$(=Max(${dim2}))"}`;
      return ` + Sum({1<${filter2}>}0)`;
    }
  }
  return ' + Sum({1} 0)';
}

function getExpressionWithExcludedComp({
  expression, modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
}) {
  const expComp = simplifyExpression(expression);
  const excludedComp = getExcludedComp({
    modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
  });
  return expComp + excludedComp;
}

function getFunctionPrefix(functionName) {
  return `${functionName}(`;
}

function getFunctionSuffix() {
  return ')';
}

function getRangeComp(functionName, functionParameter) {
  const rangePrefix = getFunctionPrefix(functionName);
  const rangeSuffix = getFunctionSuffix();
  return rangePrefix + functionParameter + rangeSuffix;
}

function getAggrComp(comp1, comp2, comp3) {
  return `Aggr(${comp1}, ${comp2}, ${comp3})`;
}

function getNumDimensions({ properties, layout }) {
  return util.getValue(properties, 'qHyperCubeDef.qDimensions', util.getValue(layout, 'qHyperCube.qDimensionInfo', []))
    .length;
}

function needDimension({ modifier, properties, layout }) {
  const primaryDimension = getPrimaryDimension(modifier);
  return getNumDimensions({ properties, layout }) === 2 && primaryDimension === 0;
}

function getPrefix({
  modifier, properties, layout, numDimensions, functionName,
}) {
  let numberOfDims;
  if (typeof numDimensions === 'undefined') {
    numberOfDims = getNumDimensions({ properties, layout });
  }
  const aboveCompPrefix = getAboveCompPrefix(modifier, numberOfDims);
  const rangeSumCompPrefix = getFunctionPrefix(functionName);
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

function removeExcludedComp({
  expression, modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
}) {
  const excludedComp = getExcludedComp({
    modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
  });
  if (excludedComp) {
    if (expression.substring(expression.length - excludedComp.length) !== excludedComp) {
      return expression;
    }
    return expression.substring(0, expression.length - excludedComp.length);
  }
  return expression;
}

function extractInputExpression({
  outputExpression, modifier, properties, layout, numDimensions, libraryItemsProps, functionName, dimensionAndFieldList,
}) {
  if (!modifier) {
    return;
  }
  const prefix = getPrefix({
    modifier, properties, layout, numDimensions, functionName,
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
  const expression = outputExpression.substring(idx1 + prefix.length, idx2);
  const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
  // eslint-disable-next-line consistent-return
  return removeExcludedComp({
    expression, modifier, dimensions, libraryItemsProps, dimensionAndFieldList,
  });
}

function initModifier(modifier, defaultOptions) {
  Object.keys(defaultOptions).forEach((key) => {
    if (modifier[key] === undefined) {
      modifier[key] = defaultOptions[key]; // eslint-disable-line no-param-reassign
    }
  });
}

function isApplicable({
  properties, layout, minDimensions = 1, maxDimensions = 2,
}) {
  const numDimensions = getNumDimensions({ properties, layout });
  return numDimensions >= minDimensions && numDimensions <= maxDimensions;
}

export default {
  isFullRange,

  getNumDimensions,

  getExpressionWithExcludedComp,

  getRowNoComp,

  getNumStepComp,

  getAboveCompPrefix,

  getAboveCompSuffix,

  getAboveComp,

  getFunctionPrefix,

  getFunctionSuffix,

  getRangeComp,

  getAggrComp,

  getExcludedComp,

  needDimension,

  getDimComp,

  simplifyExpression,

  extractInputExpression,

  initModifier,

  isNumeric,

  isApplicable,

};
