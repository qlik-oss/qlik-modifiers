import measureBaseAdapter from '../base-adapter';


describe('measure-base-adapter', () => {
  describe('get expression', () => {
    it('should return expression (qDef.qDef) as usual unless there is a base with qDef', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          qDef: '=Sum(Salesssss)',
        },
      };

      expect(measureBaseAdapter.getExpression(measure)).to.equal('=Sum(Salesssss)');
    });

    it('should return expression from base if present', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          qDef: '=Avg(Sales)',
          base: {
            qDef: '=Avg(Sales)',
          },
        },
      };
      measure.qDef.qDef = '=RangeSum(Above(Avg(Sales), 0, 12))';

      expect(measureBaseAdapter.getExpression(measure)).to.equal('=Avg(Sales)');
    });
  });

  describe('get library id', () => {
    it('should return qLibraryId as usual unless there is a base with a qLibraryId', () => {
      const measure = {
        qLibraryId: 'libid1221',
        qDef: {},
      };

      expect(measureBaseAdapter.getLibraryId(measure)).to.equal('libid1221');
    });

    it('should return qLibraryId from the base if present', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          base: {
            qLibraryId: 'libraryitem111',
          },
        },
      };

      expect(measureBaseAdapter.getLibraryId(measure)).to.equal('libraryitem111');
    });
  });
});
