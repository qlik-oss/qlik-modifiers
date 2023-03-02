import timeSeriesDecomposition from '..';

describe('timeSeriesDecomposition', () => {
  let modifier;
  let expression;
  let properties;
  let libraryItemsProps;
  let outputExpression;
  let dimensionAndFieldList;

  beforeEach(() => {
    modifier = {
      type: 'timeSeriesDecomposition',
      disabled: false,
      decomposition: '',
      steps: 1,
      outputExpression: '',
    };
    expression = 'Sum(Sales)';
    properties = {
      qInfo: {
        qId: 'xUTvxD',
        qType: 'linechart',
      },
      qMetaDef: {},
      qHyperCubeDef: {
        qDimensions: [
          {
            qLibraryId: 'BuSE',
            qDef: {
              qGrouping: 'N',
              qFieldDefs: [],
              qFieldLabels: [],
              qSortCriterias: [
                {
                  qSortByNumeric: 1,
                  qSortByAscii: 1,
                  qSortByLoadOrder: 1,
                  qExpression: {},
                },
              ],
              qNumberPresentations: [],
              qActiveField: 0,
              autoSort: true,
              cId: 'XzcJEj',
              othersLabel: 'Others',
              forecast: {
                stepSize: 'days',
              },
            },
            qOtherTotalSpec: {
              qOtherMode: 'OTHER_OFF',
              qOtherCounted: {
                qv: '10',
              },
              qOtherLimit: {
                qv: '0',
              },
              qOtherLimitMode: 'OTHER_GE_LIMIT',
              qForceBadValueKeeping: true,
              qApplyEvenWhenPossiblyWrongResult: true,
              qOtherSortMode: 'OTHER_SORT_DESCENDING',
              qTotalMode: 'TOTAL_OFF',
              qReferencedExpression: {},
            },
            qOtherLabel: {
              qv: 'Others',
            },
            qTotalLabel: {},
            qCalcCond: {},
            qAttributeExpressions: [],
            qAttributeDimensions: [],
            qCalcCondition: {
              qCond: {},
              qMsg: {},
            },
          },
        ],
        qMeasures: [
          {
            qDef: {
              qLabel: 'Tobacco Sales',
              qDef: "STL_Trend(Sum({<Year={$(=Max(Year))},Category={'tobacco'}>} TotalSales), 12)",
              modifiers: [
                {
                  type: 'timeSeriesDecomposition',
                  disabled: false,
                  primaryDimension: 0,
                  crossAllDimensions: false,
                  showExcludedValues: true,
                  decomposition: 'cao.trendDecomposition.parameters.decomposition.trend',
                  steps: 12,
                  outputExpression: "STL_Trend(Sum({<Year={$(=Max(Year))},Category={'tobacco'}>} TotalSales), 12)",
                  nullSuppression: false,
                  base: {
                    qDef: '',
                    qLibraryId: 'upBQchN',
                    qLabel: '',
                    qLabelExpression: '',
                  },
                },
              ],
              base: {
                qDef: '',
                qLibraryId: 'upBQchN',
                qLabel: '',
                qLabelExpression: '',
              },
              coloring: {},
            },
          },
          {
            qDef: {
              qLabel: 'Sum({<Year={$(=Max(Year))},Category={`tobacco`}>} TotalSales*2)',
              qDef: 'Sum({<Year={$(=Max(Year))},Category={`tobacco`}>} TotalSales*2)',
              modifiers: [
                {
                  type: 'timeSeriesDecomposition',
                  disabled: false,
                  primaryDimension: 0,
                  crossAllDimensions: false,
                  showExcludedValues: true,
                  decomposition: 'cao.trendDecomposition.parameters.decomposition.seasonal',
                  steps: 15,
                  outputExpression: "STL_Seasonal(Sum({<Year={$(=Max(Year))},Category={'tobacco'}>} TotalSales), 15)",
                  nullSuppression: false,
                  base: {
                    qDef: '',
                    qLibraryId: 'upBQchN',
                    qLabel: '',
                    qLabelExpression: '',
                  },
                },
              ],
              base: {
                qDef: '',
                qLibraryId: 'upBQch1',
                qLabel: 'a',
                qLabelExpression: '',
              },
            },
          },
        ],
        qInterColumnSortOrder: [
          0,
          1,
          2,
        ],
        qSuppressMissing: true,
        qInitialDataFetch: [
          {
            qLeft: 0,
            qTop: 0,
            qWidth: 17,
            qHeight: 500,
          },
        ],
        qReductionMode: 'N',
        qMode: 'S',
        qPseudoDimPos: -1,
        qNoOfLeftDims: -1,
        qAlwaysFullyExpanded: true,
        qMaxStackedCells: 5000,
        qCalcCond: {},
        qTitle: {},
        qCalcCondition: {
          qCond: {},
          qMsg: {},
        },
        qColumnOrder: [],
        qExpansionState: [],
        qDynamicScript: [],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInterColumnSortOrder: [],
            qInitialDataFetch: [],
            qReductionMode: 'N',
            qMode: 'S',
            qPseudoDimPos: -1,
            qNoOfLeftDims: -1,
            qMaxStackedCells: 5000,
            qCalcCond: {},
            qTitle: {},
            qCalcCondition: {
              qCond: {},
              qMsg: {},
            },
            qColumnOrder: [],
            qExpansionState: [],
            qDynamicScript: [],
          },
        },
      },
    };
  });

  describe('generateExpression', () => {
    describe('Observed', () => {
      beforeEach(() => {
        modifier.decomposition = 'observed';
      });
      it('should generate correct expression when decomposition is observed', () => {
        outputExpression = timeSeriesDecomposition.generateExpression({
          expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
        });
        expect(outputExpression).to.equal('Sum(Sales)');
      });
    });

    describe('Trend', () => {
      beforeEach(() => {
        modifier.decomposition = 'trend';
      });
      it('should generate correct expression when decomposition is trend', () => {
        outputExpression = timeSeriesDecomposition.generateExpression({
          expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
        });

        expect(outputExpression).to.equal('STL_Trend(Sum(Sales), 1)');
      });
    });

    describe('Seasonal', () => {
      beforeEach(() => {
        modifier.decomposition = 'seasonal';
        modifier.steps = 12;
      });
      it('should generate correct expression when decomposition is seasonal', () => {
        outputExpression = timeSeriesDecomposition.generateExpression({
          expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
        });

        expect(outputExpression).to.equal('STL_Seasonal(Sum(Sales), 12)');
      });
    });

    describe('Residual', () => {
      beforeEach(() => {
        modifier.decomposition = 'residual';
        modifier.steps = 15;
      });
      it('should generate correct expression when decomposition is residual', () => {
        outputExpression = timeSeriesDecomposition.generateExpression({
          expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
        });

        expect(outputExpression).to.equal('STL_Residual(Sum(Sales), 15)');
      });
    });
  });


  describe('generateExpression with updated expression', () => {
    it('should extract correct expression when decomposition is residual', () => {
      expression = 'Sum({<Year={$(=Max(Year))},Category={`tobacco`}>} TotalSales)';
      modifier.decomposition = 'residual';
      timeSeriesDecomposition.initModifier(modifier);
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
      });
      expect(`STL_Residual(${expression}, 1)`).to.equal(outputExpression);
    });

    it('should master item when decomposition is observed', () => {
      modifier.decomposition = 'observed';
      modifier.base = {
        qDef: '',
        qLibraryId: 'upBQchN',
        qLabel: '',
        qLabelExpression: '',
      };
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps,
      });
      expect(outputExpression).to.equal(expression);
    });

    it('should master item when decomposition is residual', () => {
      modifier.decomposition = 'residual';
      modifier.base = {
        qDef: '',
        qLibraryId: 'upBQchN',
        qLabel: '',
        qLabelExpression: '',
      };
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps,
      });
      expect(outputExpression).to.equal('STL_Residual([Tobacco Sales], 1)');
    });

    it('should master item when decomposition is seasonal', () => {
      modifier.decomposition = 'seasonal';
      modifier.base = {
        qDef: '',
        qLibraryId: 'upBQchN',
        qLabel: '',
        qLabelExpression: '',
      };
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps,
      });
      expect(outputExpression).to.equal('STL_Seasonal([Tobacco Sales], 1)');
    });

    it('should master item when decomposition is trend', () => {
      modifier.decomposition = 'trend';
      modifier.base = {
        qDef: '',
        qLibraryId: 'upBQchN',
        qLabel: '',
        qLabelExpression: '',
      };
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps,
      });
      expect(outputExpression).to.equal('STL_Trend([Tobacco Sales], 1)');
    });

    it('should use expression instead of master item when expression is changed', () => {
      expression = 'Sum({<Year={$(=Max(Year))},Category={`tobacco`}>} TotalSales*2)';
      modifier.base = {
        qDef: '',
        qLibraryId: 'upBQch1',
        qLabel: '',
        qLabelExpression: '',
      };
      modifier.decomposition = 'residual';
      timeSeriesDecomposition.initModifier(modifier);
      outputExpression = timeSeriesDecomposition.generateExpression({
        expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
      });
      expect(`STL_Residual(${expression}, 1)`).to.equal(outputExpression);
    });
  });
});
