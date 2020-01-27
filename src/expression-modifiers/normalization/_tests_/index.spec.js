import normalization from '..';

describe('normalization', () => {
  let modifier;
  let expression;
  let properties;
  let libraryItemsProps;
  let dim1;
  let dim2;
  let outputExpression;
  let inputExp;
  let dimensionAndFieldList;

  beforeEach(() => {
    dimensionAndFieldList = {
      fieldList: [{
        qName: 'dim1',
        qTags: ['$numeric'],
      }, {
        qName: 'dim2',
        qTags: ['$numeric'],
      }],
    };
    modifier = {
      type: 'normalization',
      disabled: false,
      primaryDimension: 0,
      dimensionalScope: 0,
      selectionScope: 0,
      outputExpression: '',
      field: 'Product',
      value: 'Jeans',
    };
    expression = 'Sum(Sales)';
    dim1 = {
      qDef: {
        qFieldDefs: ['dim1'],
        qSortCriterias: [
          {
            qSortByExpression: 0,
            qSortByNumeric: 0,
            qSortByAscii: 0,
          },
        ],
      },
    };
    dim2 = {
      qDef: {
        qFieldDefs: ['dim2'],
        qSortCriterias: [
          {
            qSortByExpression: 0,
            qSortByNumeric: 0,
            qSortByAscii: 0,
          },
        ],
      },
    };
    properties = {
      qHyperCubeDef: {
        qDimensions: [dim1, dim2],
      },
    };
    libraryItemsProps = {
      libId: {
        qDim: {
          qFieldDefs: ['libDim'],
        },
      },
    };
  });

  describe('generateExpression', () => {
    describe('Selection scope = Current selection', () => {
      beforeEach(() => {
        modifier.selectionScope = 0;
      });
      describe('Dimensional scope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should not generate expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(undefined);
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum(Total <[$(=Replace(GetObjectField(0),\']\',\']]\'))]> Aggr( (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
      describe('Dimensional scope = Respect all dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 1;
        });
        it('should not generate expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(undefined);
        });
        it('should not generate expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(undefined);
        });
      });
      describe('Dimensional scope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should generate correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum(Total Aggr( (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum(Total Aggr( (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
    });

    describe('Selection scope = Select a field', () => {
      beforeEach(() => {
        modifier.selectionScope = 1;
      });
      describe('Dimensional scope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should not generate expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(undefined);
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({$<Product={\'Jeans\'}>} Total <[$(=Replace(GetObjectField(0),\']\',\']]\'))]> Aggr({$<Product={\'Jeans\'}>}  (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
      describe('Dimensional scope = Respect all dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 1;
        });
        it('should generate correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({$<Product={\'Jeans\'}>} Aggr({$<Product={\'Jeans\'}>}  (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({$<Product={\'Jeans\'}>} Aggr({$<Product={\'Jeans\'}>}  (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
      describe('Dimensional scope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should generate correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({$<Product={\'Jeans\'}>} Total Aggr({$<Product={\'Jeans\'}>}  (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({$<Product={\'Jeans\'}>} Total Aggr({$<Product={\'Jeans\'}>}  (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
    });

    describe('Selection scope = Total', () => {
      beforeEach(() => {
        modifier.selectionScope = 2;
      });
      describe('Dimensional scope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should not generate expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(undefined);
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({1} Total <[$(=Replace(GetObjectField(0),\']\',\']]\'))]> Aggr({1} (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
      describe('Dimensional scope = Respect all dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 1;
        });
        it('should generate correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({1} Aggr({1} (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({1} Aggr({1} (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
      describe('Dimensional scope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should generate correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({1} Total Aggr({1} (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
        });
        it('should generate correct expression for chart with two dimesions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　) /Sum({1} Total Aggr({1} (　Sum(Sales)　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
    });
  });

  describe('extractExpression', () => {
    describe('Selection scope = Current selection', () => {
      beforeEach(() => {
        modifier.selectionScope = 0;
      });
      describe('dimensionalScope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });

      describe('dimensionalScope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should extract correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
    });

    describe('Selection scope = Select a field', () => {
      beforeEach(() => {
        modifier.selectionScope = 1;
      });
      describe('Dimensional scope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
      describe('Dimensional scope = Respect all dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 1;
        });
        it('should extract correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
      describe('Dimensional scope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should extract correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
    });

    describe('Selection scope = Total', () => {
      beforeEach(() => {
        modifier.selectionScope = 2;
      });
      describe('Dimensional scope = Respect one dimension', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 0;
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
      describe('Dimensional scope = Respect all dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 1;
        });
        it('should extract correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
      describe('Dimensional scope = Disregard the dimensions', () => {
        beforeEach(() => {
          modifier.dimensionalScope = 2;
        });
        it('should extract correct expression for chart with one dimension', () => {
          properties.qHyperCubeDef.qDimensions = [dim1];
          dimensionAndFieldList.fieldList = [{
            qName: 'dim1',
            qTags: ['$numeric'],
          }];
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
        it('should extract correct expression for chart with two dimensions', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });
      });
    });
  });
});
