import util from './utils/util';
import {
  EXPRESSION_REF,
  EXPRESSION_BASE_REF,
  LIB_REF,
  LIB_BASE_REF,
  LABEL_REF,
  LABEL_EXPRESSION_REF,
  LABEL_BASE_REF,
  LABEL_EXPRESSION_BASE_REF,
  AGGRFUNC_REF,
  AGGRFUNC_BASE_REF,
} from './constants';

const measureBase = {
  /**
   * Initialize the base for a measure - Creates a base object literal with the original qDef.qDef and qLibrary properties.
   * @memberof module:Modifiers
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @param {Boolean} hardSet - force initialize base
   */
  initBase(measure, hardSet) {
    if (hardSet || measureBase.isValid(measure)) {
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
    if (measureBase.isValid(measure)) {
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

export default measureBase;
