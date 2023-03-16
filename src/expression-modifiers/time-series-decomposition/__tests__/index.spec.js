import timeSeriesDecomposition from '..';

const properties = require('./properties.json');

describe('timeSeriesDecomposition', () => {
  let modifier;
  let expression;
  let libraryItemsProps;
  let outputExpression;
  let dimensionAndFieldList;

  beforeEach(() => {
    modifier = {
      type: 'timeSeriesDecomposition',
      disabled: false,
      decomposition: '',
      steps: 2,
      outputExpression: '',
    };
    expression = 'Sum(Sales)';
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

        expect(outputExpression).to.equal('STL_Trend(Sum(Sales), 2)');
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
      expect(`STL_Residual(${expression}, 2)`).to.equal(outputExpression);
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
      expect(outputExpression).to.equal('STL_Residual([Tobacco Sales], 2)');
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
      expect(outputExpression).to.equal('STL_Seasonal([Tobacco Sales], 2)');
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
      expect(outputExpression).to.equal('STL_Trend([Tobacco Sales], 2)');
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
      expect(`STL_Residual(${expression}, 2)`).to.equal(outputExpression);
    });
  });
});
