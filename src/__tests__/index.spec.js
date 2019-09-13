import Modifiers from '..';
import SoftPropertyHandler from '../soft-property-handler';
// import accumulation from '../expression-modifiers/accumulation';
import * as MasterItemSubscriber from '../master-item-subscriber';

describe('measure modifiers', () => {
  let sandbox;
  let model;
  let mockedLibItems;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockedLibItems = {
      libId1: {
        properties: {
          qMeasure: {
            qDef: 'Count(Sales)',
            coloring: {
              blabla: 'bla',
            },
            qLabel: 'qLabel_Lib',
            qLabelExpression: 'qLabelExpression_Lib',
          },
        },
        getProperties() {
          return Promise.resolve(this.properties);
        },
      },
    };

    model = {
      id: 'dummy-id1',
      layout: {
        qHyperCube: {
          qMeasureInfo: [
            {
              modifiers: [
                {
                  type: 'accumulation',
                },
              ],
            },
          ],
        },
      },
      properties: {
        qHyperCubeDef: {
          qMeasures: [
            {
              qDef: {
                qDef: 'Sum(Sales)',
                modifiers: [
                  {
                    type: 'accumulation',
                  },
                ],
              },
            },
          ],
        },
      },
      getEffectiveProperties: sinon.stub().callsFake(() => Promise.resolve(model.properties)),
      setProperties: sinon.stub().callsFake((properties) => {
        model.properties = properties;
        return Promise.resolve();
      }),
      app: {
        clearUndoBuffer: sinon.spy(),
        getMeasure: libId => Promise.resolve(mockedLibItems[libId]),
      },
    };

    sandbox.stub(SoftPropertyHandler, 'saveSoftProperties').callsFake((modl, prevProperties, properties) => {
      modl.properties = properties; // eslint-disable-line no-param-reassign
      return Promise.resolve();
    });
    sandbox
      .stub(Modifiers.modifiers.accumulation, 'generateExpression')
      .callsFake(({ expression }) => `accumulation(${expression})`);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve immediately if it is snapshot mode, case 1', async () => {
    await Modifiers.apply({ model, isSnapshot: true });

    expect(model.getEffectiveProperties).to.not.have.been.called;
  });

  it('should resolve immediately if it is selection mode, case 1', async () => {
    model.layout.qSelectionInfo = { qInSelections: true };
    await Modifiers.apply({ model, isSnapshot: false });

    expect(model.getEffectiveProperties).to.not.have.been.called;
  });

  it('should resolve immediately if there is no qHyperCube in the root of the layout (for now...)', async () => {
    delete model.layout.qHyperCube;
    await Modifiers.apply({ model });

    expect(model.getEffectiveProperties).to.not.have.been.called;
  });

  describe('hasActiveModifiers', () => {
    it('should resolve promise immediately if there are no modifiers', async () => {
      delete model.layout.qHyperCube.qMeasureInfo[0].modifiers;
      await Modifiers.apply({ model });

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should resolve immediately if there are no supported modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].modifiers[0].type = 'xyz';

      await Modifiers.apply({ model });

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should resolve immediately if there are no enabled modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].modifiers[0].disabled = true;

      await Modifiers.apply({ model });

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should resolve immediately if there are no applicable modifiers', async () => {
      model.layout.qHyperCube.qDimensionInfo = [{}, {}, {}];
      await Modifiers.apply({ model });

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should call getEffectiveProperties on the first time when there are active modifiers', async () => {
      await Modifiers.apply({ model });

      expect(model.getEffectiveProperties).to.have.been.called;
    });
  });

  describe('applyModifiers', () => {
    it('should only apply enabled modifiers', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers[0].disabled = true;
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
        type: 'accumulation',
      });

      await Modifiers.apply({ model });

      expect(Modifiers.modifiers.accumulation.generateExpression).to.have.been.calledOnce;
    });

    it('should apply modifiers on all measures', async () => {
      model.properties.qHyperCubeDef.qMeasures.push({
        qDef: {
          qDef: 'Avg(Expression1)',
          modifiers: [
            {
              type: 'accumulation',
            },
          ],
        },
      });

      await Modifiers.apply({ model });

      expect(Modifiers.modifiers.accumulation.generateExpression).to.have.been.calledTwice;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
      expect(model.properties.qHyperCubeDef.qMeasures[1].qDef.qDef).to.equal('accumulation(Avg(Expression1))');
    });

    it('should apply modifiers on alternative measures as well', async () => {
      model.properties.qHyperCubeDef.qLayoutExclude = {
        qHyperCubeDef: {
          qMeasures: [
            {
              qDef: {
                qDef: 'Avg(Expression1)',
                modifiers: [
                  {
                    type: 'accumulation',
                  },
                ],
              },
            },
          ],
        },
      };

      await Modifiers.apply({ model });

      expect(Modifiers.modifiers.accumulation.generateExpression).to.have.been.calledTwice;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
      expect(model.properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal(
        'accumulation(Avg(Expression1))',
      );
    });

    it('should only save properties once, even if modifying multiple measures', async () => {
      model.properties.qHyperCubeDef.qMeasures.push({
        qDef: {
          qDef: 'Avg(Expression1)',
          modifiers: [
            {
              type: 'accumulation',
            },
          ],
        },
      });

      await Modifiers.apply({ model });

      expect(SoftPropertyHandler.saveSoftProperties).to.have.been.calledOnce;
    });

    it('should throw exception if more than 1 active modifier on a measure (not supported yet!)', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
        type: 'accumulation',
      });

      try {
        await Modifiers.apply({ model });
      } catch (error) {
        expect(error.message).to.contain('More than 1 modifier on a measure');
      }
    });

    describe('expression', () => {
      it('should init a base object correctly when expression', async () => {
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base.qDef).to.eql('Sum(Sales)');
      });

      it('should modify qDef.qDef correctly for expression', async () => {
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
      });

      it('should set qDef.qLabelExpression and qLabel correctly from base, case 1', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
          qDef: 'Sum(Sales)',
          qLabelExpression: 'qLabelExpression',
        };
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabelExpression).to.equal('qLabelExpression');
        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabel).to.equal(undefined);
      });

      it('should set qDef.qLabelExpression and qLabel correctly from base, case 2', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
          qDef: 'Sum(Sales)',
          qLabel: 'qLabel',
        };
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabelExpression).to.equal(undefined);
        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabel).to.equal('qLabel');
      });

      it('should copy qLabelExpression and qLabel correctly from base, case 3', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
          qDef: 'Sum(Sales)',
        };
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabelExpression).to.equal(undefined);
        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabel).to.equal('Sum(Sales)');
      });
    });

    describe('library item', () => {
      let cb;
      let subscriber;
      beforeEach(() => {
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';
        sandbox.stub(MasterItemSubscriber, 'default').callsFake(({ callback }) => {
          cb = callback;
          subscriber = {
            subscribe: sinon.stub().callsFake(() => Promise.resolve()),
            unsubscribe: sinon.stub().callsFake(() => Promise.resolve()),
          };
          return subscriber;
        });
      });

      it('should clear undo-stack after applying modifiers on library measure change', async () => {
        await Modifiers.apply({ model });
        await cb();

        expect(model.app.clearUndoBuffer).to.have.been.calledOnce;
      });

      it('should unsubscribe measure subscriptions on destroy call', () => {
        Modifiers.destroy(model);

        expect(subscriber.unsubscribe).to.have.been.calledOnce;
      });

      it('should init a base object correctly when library item', async () => {
        await Modifiers.apply({ model }).then(() => {
          expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base.qDef).to.eql('Sum(Sales)');
          expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base.qLibraryId).to.eql('libId1');
        });
      });

      it('should remove qLibraryId', async () => {
        await Modifiers.apply({ model }).then(() => {
          expect(model.properties.qHyperCubeDef.qMeasures[0].qLibraryId).to.be.undefined;
        });
      });

      it('should modify qDef.qDef correctly for library item', async () => {
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Count(Sales))');
      });

      it('should copy color properties correctly for library item', async () => {
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.coloring).to.eql({
          blabla: 'bla',
        });
      });

      it('should copy qLabelExpression and qLabel correctly for library item', async () => {
        await Modifiers.apply({ model });

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabelExpression).to.equal('qLabelExpression_Lib');
        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qLabel).to.equal('qLabel_Lib');
      });
    });
  });

  describe('updateProps (persistance)', () => {
    it('should call softPropertyHandler.saveSoftProperties when there are no update privileges', async () => {
      await Modifiers.apply({ model });

      expect(SoftPropertyHandler.saveSoftProperties).to.have.been.calledOnce;
    });

    it('should call model.setProperties when there are update privileges', async () => {
      model.layout.qMeta = {
        privileges: ['remove', 'update'],
      };

      await Modifiers.apply({ model });

      expect(model.setProperties).to.have.been.calledOnce;
    });
  });

  describe('clean up', () => {
    it('should remove base if no active modifiers', async () => {
      delete model.layout.qHyperCube.qMeasureInfo[0].modifiers;

      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base).to.be.undefined;
    });

    it('should reset to original qDef if no active modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].base = {
        qDef: 'Sum(Sales)',
      };
      model.layout.qHyperCube.qMeasureInfo[0].modifiers = [];
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef = 'accumulate(Sum(Sales))';
      model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
        qDef: 'Sum(Sales)',
      };

      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base).to.be.undefined;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('Sum(Sales)');
    });

    it('should reset to original qLibraryId if no active modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].base = {
        qLibraryId: 'libId1',
      };
      model.layout.qHyperCube.qMeasureInfo[0].modifiers = [];
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef = 'accumulate(Count(Sales))';
      model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
        qLibraryId: 'libId1',
      };

      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base).to.be.undefined;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.be.undefined;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qLibraryId).to.equal('libId1');
    });

    it('should remove coloring props if no active modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].base = {
        qLibraryId: 'libId1',
      };
      model.layout.qHyperCube.qMeasureInfo[0].modifiers = [];
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef = 'accumulate(Count(Sales))';
      model.properties.qHyperCubeDef.qMeasures[0].qDef.base = {
        qLibraryId: 'libId1',
      };
      model.properties.qHyperCubeDef.qMeasures[0].qDef.coloring = {
        color: 'bla bla',
      };

      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.coloring).to.be.undefined;
    });
  });

  describe('updateTotalsFunction', () => {
    it('should update totals function when qAggrFunc === Expr', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc = 'Expr';
      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc).to.equal('None');
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base.qAggrFunc).to.equal('Expr');
    });

    it('should update totals function when qAggrFunc === None', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc = 'None';
      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc).to.equal('None');
    });

    it('should update totals function when qAggrFunc !== Expr and !== None', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc = 'Avg';
      await Modifiers.apply({ model });

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qAggrFunc).to.equal('Avg');
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base.qAggrFunc).to.be.undefined;
    });
  });
});
