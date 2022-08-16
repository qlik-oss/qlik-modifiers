import difference from '..';

describe('difference', () => {
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
      disabled: false,
      primaryDimension: 0,
      crossAllDimensions: true,
      showExcludedValues: true,
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
    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe('showExcludedValues = true', () => {
        beforeEach(() => {
          modifier.showExcludedValues = true;
        });

        it('should generate correct expression when dimension is numeric', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0))');
        });

        it('should generate correct expression when dimension is non-numeric', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });

          expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0))');
        });
      });

      describe('showExcludedValues = false', () => {
        beforeEach(() => {
          modifier.showExcludedValues = false;
        });
        it('should generate correct expression', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });

          expect(outputExpression).to.equal(' (　Sum(Sales)　)  - Above( (　Sum(Sales)　) )');
        });
      });
    });

    describe('Two dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1, dim2];
      });
      describe('Normal dimensions', () => {
        describe('primaryDimension = 0', () => {
          beforeEach(() => {
            modifier.primaryDimension = 0;
          });

          describe('crossAllDimensions = true', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = true;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0) - Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0) - Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should generate correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('Aggr( (　Sum(Sales)　)  - Above(Total  (　Sum(Sales)　) ), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should generate correct expression when showExcludedValues = false', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('Aggr( (　Sum(Sales)　)  - Above( (　Sum(Sales)　) ), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
              });
            });
          });
        });

        describe('primaryDimension = 1', () => {
          beforeEach(() => {
            modifier.primaryDimension = 1;
          });

          describe('crossAllDimensions = true', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = true;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0) - Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0) - Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0))');
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should generate correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal(' (　Sum(Sales)　)  - Above(Total  (　Sum(Sales)　) )');
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0) - Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0))');
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should generate correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal(' (　Sum(Sales)　)  - Above( (　Sum(Sales)　) )');
              });
            });
          });
        });
      });
    });
  });

  describe('extractExpression', () => {
    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe('showExcludedValues = true', () => {
        beforeEach(() => {
          modifier.showExcludedValues = true;
        });

        it('should extract correct expression when dimension is numeric', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });
          inputExp = difference.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
          });

          expect(inputExp).to.equal(expression);
        });

        it('should extract correct expression when dimension is non-numeric', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });
          inputExp = difference.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps,
          });

          expect(inputExp).to.equal(expression);
        });
      });

      describe('showExcludedValues = false', () => {
        beforeEach(() => {
          modifier.showExcludedValues = false;
        });
        it('should extract correct expression', () => {
          outputExpression = difference.generateExpression({
            expression, modifier, properties, libraryItemsProps,
          });
          inputExp = difference.extractInputExpression({
            outputExpression, modifier, properties, libraryItemsProps,
          });

          expect(inputExp).to.equal(expression);
        });
      });
    });

    describe('Two dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1, dim2];
      });
      describe('Normal dimensions', () => {
        describe('primaryDimension = 0', () => {
          beforeEach(() => {
            modifier.primaryDimension = 0;
          });

          describe('crossAllDimensions = true', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = true;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should extract correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should extract correct expression when showExcludedValues = false', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });

        describe('primaryDimension = 1', () => {
          beforeEach(() => {
            modifier.primaryDimension = 1;
          });

          describe('crossAllDimensions = true', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = true;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should extract correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('showExcludedValues = true', () => {
              beforeEach(() => {
                modifier.showExcludedValues = true;
              });

              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('showExcludedValues = false', () => {
              beforeEach(() => {
                modifier.showExcludedValues = false;
              });

              it('should extract correct expression', () => {
                outputExpression = difference.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = difference.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });
      });
    });
  });
});
