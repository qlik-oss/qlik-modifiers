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
      relativeNumbers: 0,
      outputExpression: '',
    };
    expression = 'Sum([Sales])';
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
    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe.skip('showExcludedValues = true', () => {
        beforeEach(() => {
          modifier.showExcludedValues = true;
        });

        describe('normalization type = relative to total selection', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 0;
          });

          it('should generate correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0)/Sum(Total Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });

          it('should generate correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0)/Sum(Total Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });

        describe('normalization type = relative to dimensional universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 1;
          });

          it('should generate correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0)/Sum({1} Aggr({1}If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });

          it('should generate correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0)/Sum({1} Aggr({1}If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });

        describe('normalization type = relative to total universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 2;
          });

          it('should generate correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0)/Sum({1} Total Aggr({1}If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });

          it('should generate correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0)/Sum({1} Total Aggr({1}If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum([Sales])　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]))\'"}>}0), 0), [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });
      });

      describe('showExcludedValues = false', () => {
        beforeEach(() => {
          modifier.showExcludedValues = false;
        });

        describe('normalization type = relative to total selection', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 0;
          });

          it('should generate correct expression ', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum(Total Aggr( (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });

        describe('normalization type = relative to dimensional universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 1;
          });

          it('should generate correct expression ', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum({1} Aggr({1} (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });

        describe('normalization type = relative to total universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 2;
          });

          it('should generate correct expression ', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum({1} Total Aggr({1} (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
          });
        });
      });
    });

    describe('Two dimension', () => {
      describe('normalization type = relative to total selection', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 0;
        });

        it('should generate correct expression ', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });

          expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum(Total Aggr( (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });

      describe('normalization type = relative to dimensional universe', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 1;
        });

        it('should generate correct expression ', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });

          expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum({1} Aggr({1} (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });

      describe('normalization type = relative to total universe', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 2;
        });

        it('should generate correct expression ', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });

          expect(outputExpression).to.equal(' (　Sum([Sales])　) /Sum({1} Total Aggr({1} (　Sum([Sales])　) , [$(=Replace(GetObjectField(0),\']\',\']]\'))], [$(=Replace(GetObjectField(1),\']\',\']]\'))]))');
        });
      });
    });
  });

  describe('extractExpression', () => {
    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe.skip('showExcludedValues = true', () => {
        beforeEach(() => {
          modifier.showExcludedValues = true;
        });

        describe('normalization type = relative to total selection', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 0;
          });
          it('should extract correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(inputExp).to.equal(expression);
          });

          it('should extract correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });

        describe('normalization type = relative to dimensional universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 1;
          });
          it('should extract correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(inputExp).to.equal(expression);
          });

          it('should extract correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });

        describe('normalization type = relative to total universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 2;
          });
          it('should extract correct expression when dimension is numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
            });

            expect(inputExp).to.equal(expression);
          });

          it('should extract correct expression when dimension is non-numeric', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });
      });

      describe('showExcludedValues = false', () => {
        beforeEach(() => {
          modifier.showExcludedValues = false;
        });

        describe('normalization type = relative to total selection', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 0;
          });
          it('should extract correct expression', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });

        describe('normalization type = relative to dimensional universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 1;
          });
          it('should extract correct expression', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });

        describe('normalization type = relative to total universe', () => {
          beforeEach(() => {
            modifier.relativeNumbers = 2;
          });
          it('should extract correct expression', () => {
            outputExpression = normalization.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = normalization.extractInputExpression({
              outputExpression, modifier, properties, libraryItemsProps,
            });

            expect(inputExp).to.equal(expression);
          });
        });
      });
    });

    describe('Two dimensions', () => {
      describe('normalization type = relative to total selection', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 0;
        });
        it('should extract correct expression', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps,
          });

          expect(inputExp).to.equal(expression);
        });
      });

      describe('normalization type = relative to dimensional universe', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 1;
        });
        it('should extract correct expression', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps,
          });

          expect(inputExp).to.equal(expression);
        });
      });

      describe('normalization type = relative to total universe', () => {
        beforeEach(() => {
          modifier.relativeNumbers = 2;
        });
        it('should extract correct expression', () => {
          outputExpression = normalization.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });
          inputExp = normalization.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps,
          });

          expect(inputExp).to.equal(expression);
        });
      });
    });
  });
});
