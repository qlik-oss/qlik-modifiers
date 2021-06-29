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

    it('should return expression from base if present even base.qDef is empty string', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          qDef: '=Avg(Sales)',
          base: {
            qDef: '',
          },
        },
      };
      measure.qDef.qDef = '=RangeSum(Above(Avg(Sales), 0, 12))';

      expect(measureBaseAdapter.getExpression(measure)).to.equal('');
    });
  });

  describe('get expression ref', () => {
    it('should return expression ref as usual unless there is a base with qDef', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          qDef: '=Sum(Salesssss)',
        },
      };

      expect(measureBaseAdapter.getExpressionRef(measure)).to.equal('qDef.qDef');
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

      expect(measureBaseAdapter.getExpressionRef(measure)).to.equal('qDef.base.qDef');
    });

    it('should return expression from base if present even base.qDef is empty string', () => {
      const measure = {
        qLibraryId: '',
        qDef: {
          qDef: '=Avg(Sales)',
          base: {
            qDef: '',
          },
        },
      };
      measure.qDef.qDef = '=RangeSum(Above(Avg(Sales), 0, 12))';

      expect(measureBaseAdapter.getExpressionRef(measure)).to.equal('qDef.base.qDef');
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
