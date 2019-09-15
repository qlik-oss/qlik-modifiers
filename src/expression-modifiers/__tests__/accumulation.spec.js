import accumulation from '../accumulation';

describe('accumulation', () => {
  let modifier;
  let expression;
  let properties;
  let libraryItemsProps;
  let dim1;
  let dim2;
  let generatedExp;
  let inputExp;

  beforeEach(() => {
    modifier = {
      accumulationDimension: 0,
      crossAllDimensions: true,
      showExcludedValues: true,
      fullAccumulation: false,
      steps: 6,
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
        describe('Full accumulation', () => {
          beforeEach(() => {
            modifier.fullAccumulation = true;
          });

          it('should generate correct expression when suppress missing is false', () => {
            modifier.showExcludedValues = true;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, RowNo()))');
          });

          it('should generate correct expression when suppress missing is true', () => {
            modifier.showExcludedValues = false;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales), 0, RowNo()))');
          });
        });

        describe('Custom accumulation', () => {
          beforeEach(() => {
            modifier.fullAccumulation = false;
          });

          it('should generate correct expression when suppress missing is false', () => {
            modifier.showExcludedValues = true;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, 6))');
          });

          it('should generate correct expression when suppress missing is true', () => {
            modifier.showExcludedValues = false;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });

            expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales), 0, 6))');
          });
        });
      });
    });

    describe('Two dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1, dim2];
      });

      describe('Accumulation on the first dimension', () => {
        beforeEach(() => {
          modifier.accumulationDimension = 0;
        });

        describe('Restart accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = false;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal(
                  'Aggr(RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, RowNo())), [dim2], [dim1])',
                );
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('Aggr(RangeSum(Above(Sum(Sales), 0, RowNo())), [dim2], [dim1])');
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('Aggr(RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, 6)), [dim2], [dim1])');
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('Aggr(RangeSum(Above(Sum(Sales), 0, 6)), [dim2], [dim1])');
              });
            });
          });
        });

        describe('Continue accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = true;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal(
                  'Aggr(RangeSum(Above(Total Sum(Sales) + Sum({1} 0), 0, RowNo(Total))), [dim2], [dim1])',
                );
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal(
                  'Aggr(RangeSum(Above(Total Sum(Sales), 0, RowNo(Total))), [dim2], [dim1])',
                );
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal(
                  'Aggr(RangeSum(Above(Total Sum(Sales) + Sum({1} 0), 0, 6)), [dim2], [dim1])',
                );
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('Aggr(RangeSum(Above(Total Sum(Sales), 0, 6)), [dim2], [dim1])');
              });
            });
          });
        });
      });

      describe('Accumulation on the second dimension', () => {
        beforeEach(() => {
          modifier.accumulationDimension = 1;
        });

        describe('Restart accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = false;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, RowNo()))');
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales), 0, RowNo()))');
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales) + Sum({1} 0), 0, 6))');
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Sum(Sales), 0, 6))');
              });
            });
          });
        });

        describe('Continue accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = true;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Total Sum(Sales) + Sum({1} 0), 0, RowNo(Total)))');
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Total Sum(Sales), 0, RowNo(Total)))');
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should generate correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Total Sum(Sales) + Sum({1} 0), 0, 6))');
              });

              it('should generate correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });

                expect(generatedExp).to.equal('RangeSum(Above(Total Sum(Sales), 0, 6))');
              });
            });
          });
        });
      });
    });
  });

  describe('extractInputExpression', () => {
    beforeEach(() => {
      expression = 'RangeSum(Above( + Sum({1} 0), 0, RowNo()))';
    });

    describe('One dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1];
      });

      describe('Normal dimension', () => {
        describe('Full accumulation', () => {
          beforeEach(() => {
            modifier.fullAccumulation = true;
          });

          it('should extract correct expression when suppress missing is false', () => {
            modifier.showExcludedValues = true;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = accumulation.extractInputExpression({ outputExpression: generatedExp, modifier, properties });

            expect(inputExp).to.equal(expression);
          });

          it('should extract correct expression when suppress missing is true', () => {
            modifier.showExcludedValues = false;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = accumulation.extractInputExpression({ outputExpression: generatedExp, modifier, properties });

            expect(inputExp).to.equal(expression);
          });
        });

        describe('Custom accumulation', () => {
          beforeEach(() => {
            modifier.fullAccumulation = false;
          });

          it('should extract correct expression when suppress missing is false', () => {
            modifier.showExcludedValues = true;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = accumulation.extractInputExpression({ outputExpression: generatedExp, modifier, properties });

            expect(inputExp).to.equal(expression);
          });

          it('should extract correct expression when suppress missing is true', () => {
            modifier.showExcludedValues = false;
            generatedExp = accumulation.generateExpression({
              expression, modifier, properties, libraryItemsProps,
            });
            inputExp = accumulation.extractInputExpression({ outputExpression: generatedExp, modifier, properties });

            expect(inputExp).to.equal(expression);
          });
        });
      });
    });

    describe('Two dimension', () => {
      beforeEach(() => {
        properties.qHyperCubeDef.qDimensions = [dim1, dim2];
      });

      describe('Accumulation on the first dimension', () => {
        beforeEach(() => {
          modifier.accumulationDimension = 0;
        });

        describe('Restart accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = false;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });

        describe('Continue accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = true;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });
      });

      describe('Accumulation on the second dimension', () => {
        beforeEach(() => {
          modifier.accumulationDimension = 1;
        });

        describe('Restart accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = false;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });
          });
        });

        describe('Continue accumulation after the primary dimension of accumulation', () => {
          beforeEach(() => {
            modifier.crossAllDimensions = true;
          });

          describe('Normal dimension', () => {
            describe('Full accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = true;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });
            });

            describe('Custom accumulation', () => {
              beforeEach(() => {
                modifier.fullAccumulation = false;
              });

              it('should extract correct expression when suppress missing is false', () => {
                modifier.showExcludedValues = true;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
                });

                expect(inputExp).to.equal(expression);
              });

              it('should extract correct expression when suppress missing is true', () => {
                modifier.showExcludedValues = false;
                generatedExp = accumulation.generateExpression({
                  expression, modifier, properties, libraryItemsProps,
                });
                inputExp = accumulation.extractInputExpression({
                  outputExpression: generatedExp,
                  modifier,
                  properties,
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
