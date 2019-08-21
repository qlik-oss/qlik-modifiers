import measureBase from '../base';

describe('measure-base', () => {
  it('should create a base property on measure object', () => {
    const measure = {
      qLibraryId: 'libId15243',
      qDef: {
        qDef: '=Sum(Sales)',
      },
    };
    measureBase.initBase(measure, true);

    expect(measure.qDef.base).to.be.an('object');
    expect(measure.qDef.base.qDef).to.equal('=Sum(Sales)');
    expect(measure.qDef.base.qLibraryId).to.equal('libId15243');
  });

  it('should not create a new base object unless forced through hardSet param', () => {
    const measure = {
      qLibraryId: 'libId15243',
      qDef: {
        qDef: '=Sum(Sales)',
      },
    };
    measureBase.initBase(measure);

    expect(measure.qDef.base).to.be.undefined;
  });
});
