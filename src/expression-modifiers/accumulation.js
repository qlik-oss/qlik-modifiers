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

function getNumStepComp(modifier, dimensions) {
  const { restartAfterAcumulationDimension, fullAccumulation, stepsBack } = modifier;
  if (!fullAccumulation) {
    return (stepsBack || 0) + 1;
  }
  return dimensions.length === 2 && !restartAfterAcumulationDimension ? 'RowNo(Total)' : 'RowNo()';
}

function getAboveComp(modifier, dimensions) {
  const { restartAfterAcumulationDimension, fullAccumulation } = modifier;
  return fullAccumulation && dimensions.length === 2 && !restartAfterAcumulationDimension ? 'Above(Total ' : 'Above(';
}

function initModifierProperty(modifier, property, value) {
  if (typeof modifier[property] === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    modifier[property] = value;
  }
}

export default {
  generateExpression(expression, modifier, properties, libraryItemsProps) {
    if (!modifier) {
      return expression;
    }
    const dimensions = properties.qHyperCubeDef.qDimensions;
    const s = expression.trim();
    const expComp = s.substring(0, 1) === '=' ? s.substring(1).trim() : s;
    const numStepComp = getNumStepComp(modifier, dimensions);
    const aboveComp = getAboveComp(modifier, dimensions);
    const rangeSumComp = `RangeSum(${aboveComp}${expComp}, 0, ${numStepComp}))`;
    let generatedExpression = rangeSumComp;
    if (dimensions.length === 2 && modifier.accumulationDimension === 0) {
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
    initModifierProperty(modifier, 'type', 'accumulation');
    initModifierProperty(modifier, 'disabled', false);
    initModifierProperty(modifier, 'auto', true);
    initModifierProperty(modifier, 'accumulationDimension', 0);
    initModifierProperty(modifier, 'restartAfterAcumulationDimension', false);
    initModifierProperty(modifier, 'fullAccumulation', false);
    initModifierProperty(modifier, 'stepsBack', 0);
    initModifierProperty(modifier, 'outputExpression', { qValueExpression: { qExpr: '' } });
  },
};
