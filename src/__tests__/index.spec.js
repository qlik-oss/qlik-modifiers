import Modifiers from '..';
import SoftPropertyHandler from '../soft-property-handler';
import accumulation from '../expression-modifiers/accumulation';
import * as MasterItemSubscriber from '../master-item-subscriber';

describe('measure modifiers', () => {
  let sandbox;
  let model;
  let modifiers;
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
          },
        },
        getProperties() {
          return Promise.resolve(this.properties);
        },
      },
    };

    model = {
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

    modifiers = new Modifiers(model);
    modifiers.masterItemSubscriber.subscribe = sinon.stub().callsFake(() => Promise.resolve());
    sandbox.stub(SoftPropertyHandler.prototype, 'saveSoftProperties').callsFake((prevProperties, properties) => {
      model.properties = properties;
      return Promise.resolve();
    });
    sandbox.stub(accumulation, 'generateExpression').callsFake(expression => `accumulation(${expression})`);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve immediately if there is no qHyperCube in the root of the layout (for now...)', async () => {
    delete model.layout.qHyperCube;
    await modifiers.apply();

    expect(model.getEffectiveProperties).to.not.have.been.called;
  });

  it('should clear undo-stack after applying modifiers on library measure change', async () => {
    let cb;
    sandbox.stub(MasterItemSubscriber, 'default').callsFake(({ callback }) => {
      cb = callback;
      return {
        subscribe: sinon.stub().callsFake(() => Promise.resolve()),
      };
    });

    modifiers = new Modifiers(model);
    await cb();

    expect(model.app.clearUndoBuffer).to.have.been.calledOnce;
  });

  it('should unsubscribe measure subscriptions on destroy call', () => {
    modifiers.masterItemSubscriber.unsubscribe = sinon.spy();
    modifiers.destroy();

    expect(modifiers.masterItemSubscriber.unsubscribe).to.have.been.calledOnce;
  });

  describe('hasActiveModifiers', () => {
    it('should resolve promise immediately if there are no modifiers', async () => {
      delete model.layout.qHyperCube.qMeasureInfo[0].modifiers;
      await modifiers.apply();

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should resolve immediately if there are no enabled modifiers', async () => {
      model.layout.qHyperCube.qMeasureInfo[0].modifiers[0].disabled = true;
      await modifiers.apply();

      expect(model.getEffectiveProperties).to.not.have.been.called;
    });

    it('should call getEffectiveProperties and masterItemSubscriber.subscribe when there are active modifiers', async () => {
      await modifiers.apply();

      expect(model.getEffectiveProperties).to.have.been.called;
      expect(modifiers.masterItemSubscriber.subscribe).to.have.been.called;
    });
  });

  describe('applyModifiers', () => {
    it('should only apply enabled modifiers', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers[0].disabled = true;
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
        type: 'accumulation',
      });

      await modifiers.apply();

      expect(accumulation.generateExpression).to.have.been.calledOnce;
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

      await modifiers.apply();

      expect(accumulation.generateExpression).to.have.been.calledTwice;
      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
      expect(model.properties.qHyperCubeDef.qMeasures[1].qDef.qDef).to.equal('accumulation(Avg(Expression1))');
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

      await modifiers.apply();

      expect(SoftPropertyHandler.prototype.saveSoftProperties).to.have.been.calledOnce;
    });

    it.skip('should throw exception if modifier type is not available', async () => {
      // This test is not needed since hasActiveSupportedModifier check if modifier type is supported or not
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers[0].type = 'super-modifier';

      try {
        await modifiers.apply();
      } catch (error) {
        expect(error.message).to.contain('super-modifier');
      }
    });

    it('should throw exception if more than 1 active modifier on a measure (not supported yet!)', async () => {
      model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
        type: 'accumulation',
      });

      try {
        await modifiers.apply();
      } catch (error) {
        expect(error.message).to.contain('More than 1 modifier on a measure');
      }
    });

    describe('applyModifiers with runUpdateIfChange = false', () => {
      it('should only apply enabled modifiers', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers[0].disabled = true;
        model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
          type: 'accumulation',
        });

        await modifiers.apply(false);

        expect(accumulation.generateExpression).to.have.been.calledOnce;
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

        await modifiers.apply(false);

        expect(accumulation.generateExpression).to.have.been.calledTwice;
        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
        expect(model.properties.qHyperCubeDef.qMeasures[1].qDef.qDef).to.equal('accumulation(Avg(Expression1))');
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

        await modifiers.apply(false);

        expect(SoftPropertyHandler.prototype.saveSoftProperties).to.not.been.called;
      });

      it('should throw exception if more than 1 active modifier on a measure (not supported yet!)', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qDef.modifiers.push({
          type: 'accumulation',
        });

        try {
          await modifiers.apply(false);
        } catch (error) {
          expect(error.message).to.contain('More than 1 modifier on a measure');
        }
      });
    });

    describe('expression', () => {
      it('should init a base object correctly when expression', async () => {
        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base).to.eql({
          qDef: 'Sum(Sales)',
        });
      });

      it('should modify qDef.qDef correctly for expression', async () => {
        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Sum(Sales))');
      });
    });

    describe('library item', () => {
      it('should init a base object correctly when library item', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';

        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.base).to.eql({
          qDef: 'Sum(Sales)',
          qLibraryId: 'libId1',
        });
      });

      it('should remove qLibraryId', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';

        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qLibraryId).to.be.undefined;
      });

      it('should modify qDef.qDef correctly for library item', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';

        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.qDef).to.equal('accumulation(Count(Sales))');
      });

      it('should copy color properties correctly for library item', async () => {
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';
        model.properties.qHyperCubeDef.qMeasures[0].qLibraryId = 'libId1';

        await modifiers.apply();

        expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.coloring).to.eql({
          blabla: 'bla',
        });
      });
    });
  });

  describe('updateProps (persistance)', () => {
    it('should call softPropertyHandler.saveSoftProperties when there are no update privileges', async () => {
      await modifiers.apply();

      expect(SoftPropertyHandler.prototype.saveSoftProperties).to.have.been.calledOnce;
    });

    it('should call model.setProperties when there are update privileges', async () => {
      model.layout.qMeta = {
        privileges: ['remove', 'update'],
      };

      await modifiers.apply();

      expect(model.setProperties).to.have.been.calledOnce;
    });
  });

  describe('clean up', () => {
    it('should remove base if no active modifiers', async () => {
      delete model.layout.qHyperCube.qMeasureInfo[0].modifiers;

      await modifiers.apply();

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

      await modifiers.apply();

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

      await modifiers.apply();

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

      await modifiers.apply();

      expect(model.properties.qHyperCubeDef.qMeasures[0].qDef.coloring).to.be.undefined;
    });
  });
});
