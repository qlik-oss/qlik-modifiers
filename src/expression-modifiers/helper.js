import util from '../utils/util';

const NO_BREAK_SPACE = ' ';
const IDEOGRAPHIC_SPACE = '　';
const MARKER1 = `${NO_BREAK_SPACE}(${IDEOGRAPHIC_SPACE}`;
const MARKER2 = `${IDEOGRAPHIC_SPACE})${NO_BREAK_SPACE}`;

function getExpressionWithMarkers(expression) {
  return MARKER1 + expression + MARKER2;
}

function canExtract(outputExpression) {
  const idx1 = outputExpression.indexOf(MARKER1);
  const idx2 = outputExpression.indexOf(MARKER2);
  return idx1 > -1 && idx2 > -1 && idx1 < idx2;
}

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
      for (
        let j = 0;
        j < field.qDerivedFieldData.qDerivedFieldLists.length;
        ++j
      ) {
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
    const libDim = findLibraryDimension(
      dimension.qLibraryId,
      dimensionAndFieldList.dimensionList,
    );
    return libDim && libDim.qData.info[0].qTags.indexOf('$numeric') > -1;
  }
  const field = findField(
    dimension.qDef.qFieldDefs[0],
    dimensionAndFieldList.fieldList,
  );
  return field && field.qTags.indexOf('$numeric') > -1;
}

function getPrimaryDimension(modifier) {
  return typeof modifier.primaryDimension === 'undefined'
    ? modifier.accumulationDimension
    : modifier.primaryDimension;
}

function isFullRange(modifier) {
  return !!(modifier.fullAccumulation || modifier.fullRange);
}

function getRowNoComp(modifier, numDimensions) {
  const { crossAllDimensions } = modifier;
  return numDimensions === 2 && crossAllDimensions ? 'RowNo(Total)' : 'RowNo()';
}

function stripLineComments(expression) {
  return expression.replace(/\/\/(.*)$/gm, '');
}

function stripBlockComments(expression) {
  return expression.replace(/\/\*[^]*?\*\//g, '');
}

function stripComments(expression) {
  if (!expression) {
    return '';
  }
  // eslint-disable-next-line no-param-reassign
  expression = stripLineComments(expression);
  // eslint-disable-next-line no-param-reassign
  expression = stripBlockComments(expression);
  return expression.trim();
}

function simplifyExpression(expression) {
  const exp = stripComments(expression);
  const s = exp.trim();
  const expComp = s.substring(0, 1) === '=' ? s.substring(1).trim() : s;
  return expComp;
}

function getDimSortCriterias(dimensions, dimIdx = 0) {
  const dimension = dimensions[dimIdx];
  return dimension.qDef.qSortCriterias[0];
}

// Engine will get right dimension, works for drill-down and alternative dimension
function getDimDefWithWrapper(dimIdx = 0) {
  return `[$(=Replace(GetObjectField(${dimIdx}),']',']]'))]`;
}

function getDimComp(dimensions, dimIdx) {
  const sortCriterias = getDimSortCriterias(dimensions, dimIdx);
  const dimDef = getDimDefWithWrapper(dimIdx);
  if (
    !sortCriterias.qSortByExpression
    && !sortCriterias.qSortByNumeric
    && !sortCriterias.qSortByAscii
  ) {
    return dimDef;
  }
  const type = ['Descending', 'Ascending'];
  const numericComp = sortCriterias.qSortByNumeric
    ? `(Numeric, ${type[(sortCriterias.qSortByNumeric + 1) / 2]})`
    : '';
  const textComp = sortCriterias.qSortByAscii
    ? `(Text, ${type[(sortCriterias.qSortByAscii + 1) / 2]})`
    : '';
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

function getRangeLimit(isDimNumeric, dim) {
  return isDimNumeric
    ? `${dim}={">=$(=Min(${dim}))<=$(=Max(${dim}))"}`
    : `${dim}={"=Only({1}${dim})>='$(=MinString(${dim}))' and Only({1}${dim})<='$(=MaxString(${dim}))'"}`;
}

function getExcludedComp({
  modifier = {},
  dimensions,
  dimensionAndFieldList,
  funcComp = 'Sum',
  valueComp = '0',
}) {
  const { showExcludedValues } = modifier;
  if (!showExcludedValues) {
    return '';
  }
  if (dimensions && dimensions.length === 1) {
    const isDim1Numeric = isNumeric(dimensions[0], dimensionAndFieldList);
    const dim1 = getDimDefWithWrapper(0);
    const filter1Comp = getRangeLimit(isDim1Numeric, dim1);
    return `${funcComp}({1<${filter1Comp}>}${valueComp})`;
  }
  if (dimensions && dimensions.length === 2) {
    const isDim1Numeric = isNumeric(dimensions[0], dimensionAndFieldList);
    const isDim2Numeric = isNumeric(dimensions[1], dimensionAndFieldList);
    const dim1 = getDimDefWithWrapper(0);
    const dim2 = getDimDefWithWrapper(1);
    const filter1Comp = getRangeLimit(isDim1Numeric, dim1);
    const filter2Comp = getRangeLimit(isDim2Numeric, dim2);
    return `${funcComp}({1<${filter1Comp},${filter2Comp}>}${valueComp})`;
  }
  return `${funcComp}({1}${valueComp})`;
}

function getExpressionWithExcludedComp({
  expression,
  modifier,
  dimensions,
  dimensionAndFieldList,
  treatMissingAsNull,
}) {
  const expComp = simplifyExpression(expression);
  const expWithMarkersComp = getExpressionWithMarkers(expComp);
  const { showExcludedValues } = modifier;
  if (!showExcludedValues) {
    return expWithMarkersComp;
  }
  const excludedComp = getExcludedComp({
    modifier,
    dimensions,
    dimensionAndFieldList,
  });
  const valueComp = treatMissingAsNull ? '' : ', 0';
  if (dimensions && dimensions.length === 1) {
    const dim1 = getDimDefWithWrapper(0);
    return `If(Count(${dim1}) > 0, ${expWithMarkersComp} + ${excludedComp}${valueComp})`;
  }
  if (dimensions && dimensions.length === 2) {
    const dim1 = getDimDefWithWrapper(0);
    const dim2 = getDimDefWithWrapper(1);
    return `If(Count(${dim1}) * Count(${dim2}) > 0, ${expWithMarkersComp} + ${excludedComp}${valueComp})`;
  }
  return expWithMarkersComp;
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
  return util.getValue(
    properties,
    'qHyperCubeDef.qDimensions',
    util.getValue(layout, 'qHyperCube.qDimensionInfo', []),
  ).length;
}

function needDimension({ modifier, properties, layout }) {
  const primaryDimension = getPrimaryDimension(modifier);
  return (
    primaryDimension === 0 && getNumDimensions({ properties, layout }) === 2
  );
}

function extractInputExpression({ outputExpression, modifier }) {
  if (!modifier) {
    return;
  }
  const idx1 = outputExpression.indexOf(MARKER1);
  if (idx1 === -1) {
    return;
  }
  const idx2 = outputExpression.indexOf(MARKER2);
  if (idx2 === -1) {
    return;
  }
  const expression = outputExpression.substring(idx1 + MARKER1.length, idx2);
  // eslint-disable-next-line consistent-return
  return expression;
}

function initModifier(modifier, defaultOptions) {
  Object.keys(defaultOptions).forEach((key) => {
    if (modifier[key] === undefined) {
      modifier[key] = defaultOptions[key]; // eslint-disable-line no-param-reassign
    }
  });
}

function isApplicable({
  properties,
  layout,
  minDimensions = 1,
  maxDimensions = 2,
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

  getExpressionWithMarkers,

  canExtract,

  getDimDefWithWrapper,
};
