import util from '../utils/util';
import propertyPanelDef from './accumulation-properties';

const DEFAULT_OPTIONS = {
  type: 'accumulation',
  disabled: false,
  auto: true,
  accumulationDimension: 0,
  crossAllDimensions: false,
  showExcludedValues: true,
  fullAccumulation: false,
  steps: 6,
  outputExpression: '',
};

const maxNumDimensionsSupported = 2;

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

function getAboveComp(modifier, numDimensions) {
  const { crossAllDimensions } = modifier;
  return numDimensions === 2 && crossAllDimensions ? 'Above(Total ' : 'Above(';
}

function getExpressionComp(modifier, expression) {
  const { showExcludedValues } = modifier;
  const s = expression.trim();
  const expComp = s.substring(0, 1) === '=' ? s.substring(1).trim() : s;
  return showExcludedValues ? `${expComp} + Sum({1} 0)` : expComp;
}

function getNumDimensions({ properties, layout }) {
  return util.getValue(properties, 'qHyperCubeDef.qDimensions', util.getValue(layout, 'qHyperCube.qDimensionInfo', []))
    .length;
}

function needDimension({ modifier, properties, layout }) {
  return getNumDimensions({ properties, layout }) === 2 && modifier.accumulationDimension === 0;
}

export default {
  needDimension,

  isApplicable({ properties, layout }) {
    return getNumDimensions({ properties, layout }) <= maxNumDimensionsSupported;
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
    const aboveComp = getAboveComp(modifier, numberOfDims);
    const rangeSumComp = `RangeSum(${aboveComp}${expComp}, 0, ${numStepComp}))`;
    let generatedExpression = rangeSumComp;

    if (needDimension({ modifier, properties, layout })) {
      const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
      const aggrComp = `Aggr(${rangeSumComp}, ${getDimComp(dimensions, 1, libraryItemsProps)}, ${getDimComp(
        dimensions,
        0,
        libraryItemsProps,
      )})`;
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
