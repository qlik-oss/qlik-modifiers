import util from './utils/util';

const EXPRESSION_REF = 'qDef.qDef';
const EXPRESSION_BASE_REF = 'qDef.base.qDef';
const LIB_REF = 'qLibraryId';
const LIB_BASE_REF = 'qDef.base.qLibraryId';
const LABEL_REF = 'qDef.qLabel';
const LABEL_EXPRESSION_REF = 'qDef.qLabelExpression';
const LABEL_BASE_REF = 'qDef.base.qLabel';
const LABEL_EXPRESSION_BASE_REF = 'qDef.base.qLabelExpression';
const AGGRFUNC_REF = 'qDef.qAggrFunc';
const AGGRFUNC_BASE_REF = 'qDef.base.qAggrFunc';

const base = {
  /**
   * Initialize the base for a measure - Creates a base object literal with the original qDef.qDef and qLibrary properties.
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @param {Boolean} hardSet - force initialize base
   */
  initBase(measure, hardSet) {
    if (hardSet || this.isValid(measure)) {
      util.setValue(measure, EXPRESSION_BASE_REF, util.getValue(measure, EXPRESSION_REF));
      util.setValue(measure, LIB_BASE_REF, util.getValue(measure, LIB_REF));
      util.setValue(measure, LABEL_BASE_REF, util.getValue(measure, LABEL_REF));
      util.setValue(measure, LABEL_EXPRESSION_BASE_REF, util.getValue(measure, LABEL_EXPRESSION_REF));
    }
  },

  /**
   * Restores original properties (qDef, qLibraryId) and removes base object.
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  restoreBase(measure) {
    if (this.isValid(measure)) {
      util.setValue(measure, EXPRESSION_REF, util.getValue(measure, EXPRESSION_BASE_REF));
      util.setValue(measure, LIB_REF, util.getValue(measure, LIB_BASE_REF));
      util.setValue(measure, LABEL_REF, util.getValue(measure, LABEL_BASE_REF));
      util.setValue(measure, LABEL_EXPRESSION_REF, util.getValue(measure, LABEL_EXPRESSION_BASE_REF));
      if (util.getValue(measure, AGGRFUNC_REF) && util.getValue(measure, AGGRFUNC_BASE_REF)) {
        util.setValue(measure, AGGRFUNC_REF, util.getValue(measure, AGGRFUNC_BASE_REF));
      }

      delete measure.qDef.base; // eslint-disable-line no-param-reassign
    }
  },
  /**
   * Validates if measure has a valid base property (either qDef or qLibraryId defined)
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  isValid(measure) {
    const def = util.getValue(measure, EXPRESSION_BASE_REF);
    const libraryId = util.getValue(measure, LIB_BASE_REF);
    return typeof def !== 'undefined' || typeof libraryId !== 'undefined';
  },
};

export default base;
