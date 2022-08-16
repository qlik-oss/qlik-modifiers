import movingAverage from '..';

describe('moving average', () => {
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
      fullRange: false,
      steps: 6,
      nullSuppression: false,
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

      describe('Normal dimension', () => {
        describe('Full range', () => {
          beforeEach(() => {
            modifier.fullRange = true;
          });

          describe('showExcludedValues = true', () => {
            beforeEach(() => {
              modifier.showExcludedValues = true;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0), 0, RowNo())) / RowNo()');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, RowNo())) / RowNo()');
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0)), 0, RowNo()))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, RowNo()))');
              });
            });
          });

          describe('showExcludedValues = false', () => {
            beforeEach(() => {
              modifier.showExcludedValues = false;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should generate correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeSum(Above( (　Sum(Sales)　) , 0, RowNo())) / RowNo()');
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should generate correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeAvg(Above( (　Sum(Sales)　) , 0, RowNo()))');
              });
            });
          });
        });

        describe('Custom range', () => {
          beforeEach(() => {
            modifier.fullRange = false;
          });

          describe('showExcludedValues = true', () => {
            beforeEach(() => {
              modifier.showExcludedValues = true;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0), 0), 0, 6)) / RangeMin(6, RowNo())');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, 6)) / RangeMin(6, RowNo())');
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should generate correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"}>}0)), 0, 6))');
              });

              it('should generate correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, 6))');
              });
            });
          });

          describe('showExcludedValues = false', () => {
            beforeEach(() => {
              modifier.showExcludedValues = false;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should generate correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeSum(Above( (　Sum(Sales)　) , 0, 6)) / RangeMin(6, RowNo())');
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should generate correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(outputExpression).to.equal('RangeAvg(Above( (　Sum(Sales)　) , 0, 6))');
              });
            });
          });
        });
      });
    });

    describe('Two dimensions', () => {
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

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, RowNo(Total))) / RowNo(Total), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, RowNo(Total))) / RowNo(Total), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, RowNo(Total))), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, RowNo(Total))), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeSum(Above(Total  (　Sum(Sales)　) , 0, RowNo(Total))) / RowNo(Total), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeAvg(Above(Total  (　Sum(Sales)　) , 0, RowNo(Total))), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, 6)) / RangeMin(6, RowNo(Total)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, 6)) / RangeMin(6, RowNo(Total)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeSum(Above(Total  (　Sum(Sales)　) , 0, 6)) / RangeMin(6, RowNo(Total)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeAvg(Above(Total  (　Sum(Sales)　) , 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, RowNo())) / RowNo(), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, RowNo())) / RowNo(), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, RowNo())), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, RowNo())), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeSum(Above( (　Sum(Sales)　) , 0, RowNo())) / RowNo(), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeAvg(Above( (　Sum(Sales)　) , 0, RowNo())), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, 6)) / RangeMin(6, RowNo()), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, 6)) / RangeMin(6, RowNo()), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}Aggr(RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Only({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}Aggr(RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))]))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeSum(Above( (　Sum(Sales)　) , 0, 6)) / RangeMin(6, RowNo()), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('Aggr(RangeAvg(Above( (　Sum(Sales)　) , 0, 6)), [$(=Replace(GetObjectField(1),\']\',\']]\'))], [$(=Replace(GetObjectField(0),\']\',\']]\'))])');
                  });
                });
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

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, RowNo(Total))) / RowNo(Total)');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, RowNo(Total))) / RowNo(Total)');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, RowNo(Total)))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, RowNo(Total)))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total  (　Sum(Sales)　) , 0, RowNo(Total))) / RowNo(Total)');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total  (　Sum(Sales)　) , 0, RowNo(Total)))');
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, 6)) / RangeMin(6, RowNo(Total))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, 6)) / RangeMin(6, RowNo(Total))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, 6))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, 6))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(Total  (　Sum(Sales)　) , 0, 6)) / RangeMin(6, RowNo(Total))');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(Total  (　Sum(Sales)　) , 0, 6))');
                  });
                });
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, RowNo())) / RowNo()');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, RowNo())) / RowNo()');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, RowNo()))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, RowNo()))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above( (　Sum(Sales)　) , 0, RowNo())) / RowNo()');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above( (　Sum(Sales)　) , 0, RowNo()))');
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0), 0), 0, 6)) / RangeMin(6, RowNo())');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0), 0), 0, 6)) / RangeMin(6, RowNo())');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(0),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(0),\']\',\']]\'))]))"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={">=$(=Min([$(=Replace(GetObjectField(1),\']\',\']]\'))]))<=$(=Max([$(=Replace(GetObjectField(1),\']\',\']]\'))]))"}>}0)), 0, 6))');
                  });

                  it('should generate correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above(If(Count([$(=Replace(GetObjectField(0),\']\',\']]\'))]) * Count([$(=Replace(GetObjectField(1),\']\',\']]\'))]) > 0,  (　Sum(Sales)　)  + Sum({1<[$(=Replace(GetObjectField(0),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(0),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(0),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"},[$(=Replace(GetObjectField(1),\']\',\']]\'))]={"=Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])>=\'$(=Replace(Replace(MinString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\' and Only({1}[$(=Replace(GetObjectField(1),\']\',\']]\'))])<=\'$(=Replace(Replace(MaxString([$(=Replace(GetObjectField(1),\']\',\']]\'))]),\'\'\'\',\'\'\'\'\'\'),\'$\',\'$\'\'&\'\'\'))\'"}>}0)), 0, 6))');
                  });
                });
              });

              describe('showExcludedValues = false', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = false;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeSum(Above( (　Sum(Sales)　) , 0, 6)) / RangeMin(6, RowNo())');
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should generate correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });

                    expect(outputExpression).to.equal('RangeAvg(Above( (　Sum(Sales)　) , 0, 6))');
                  });
                });
              });
            });
          });
        });
      });
    });
  });


  describe('extractInputExpression', () => {
    beforeEach(() => {
      expression = 'RangeSum(Above(Avg(Sales) + Sum({1}0), 0, RowNo()))';
    });

    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe('Normal dimension', () => {
        describe('Full range', () => {
          beforeEach(() => {
            modifier.fullRange = true;
          });

          describe('showExcludedValues = true', () => {
            beforeEach(() => {
              modifier.showExcludedValues = true;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
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

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should extract correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should extract correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });

        describe('Custom range', () => {
          beforeEach(() => {
            modifier.fullRange = false;
          });

          describe('showExcludedValues = true', () => {
            beforeEach(() => {
              modifier.showExcludedValues = true;
            });

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should extract correct expression when dimension is numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when dimension is non-numeric', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
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

            describe('nullSuppression = false', () => {
              beforeEach(() => {
                modifier.nullSuppression = false;
              });
              it('should extract correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('nullSuppression = true', () => {
              beforeEach(() => {
                modifier.nullSuppression = true;
              });
              it('should extract correct expression', () => {
                outputExpression = movingAverage.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = movingAverage.extractInputExpression({
                  outputExpression, modifier, properties, libraryItemsProps,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });
      });
    });

    describe('Two dimensions', () => {
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

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
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

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });
          });

          describe('crossAllDimensions = false', () => {
            beforeEach(() => {
              modifier.crossAllDimensions = false;
            });

            describe('Full range', () => {
              beforeEach(() => {
                modifier.fullRange = true;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });
              });
            });

            describe('Custom range', () => {
              beforeEach(() => {
                modifier.fullRange = false;
              });

              describe('showExcludedValues = true', () => {
                beforeEach(() => {
                  modifier.showExcludedValues = true;
                });

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression when dimension is numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps, dimensionAndFieldList,
                    });

                    expect(inputExp).to.equal(expression);
                  });

                  it('should extract correct expression when dimension is non-numeric', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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

                describe('nullSuppression = false', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = false;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
                      outputExpression, modifier, properties, libraryItemsProps,
                    });

                    expect(inputExp).to.equal(expression);
                  });
                });

                describe('nullSuppression = true', () => {
                  beforeEach(() => {
                    modifier.nullSuppression = true;
                  });
                  it('should extract correct expression', () => {
                    outputExpression = movingAverage.generateExpression({
                      expression, modifier, properties, libraryItemsProps,
                    });
                    inputExp = movingAverage.extractInputExpression({
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
  });
});
