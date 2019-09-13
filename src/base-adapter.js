/**
 * A tool for handling the base/input of a measure. To be used when generating new expression (expression modifiers etc).
 */
import util from './utils/util';

const BASE_REF = 'qDef.base';
const EXPRESSION_REF = 'qDef.qDef';
const EXPRESSION_BASE_REF = 'qDef.base.qDef';
const LIB_REF = 'qLibraryId';
const LIB_BASE_REF = 'qDef.base.qLibraryId';
const LABEL_REF = 'qDef.qLabel';
const LABEL_EXPRESSION_REF = 'qDef.qLabelExpression';
const LABEL_BASE_REF = 'qDef.base.qLabel';
const LABEL_EXPRESSION_BASE_REF = 'qDef.base.qLabelExpression';

export default {
  /**
   * Get the qDef property - from the base if it exists, otherwise returns qDef.qDef of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  getExpression(measure) {
    return util.getValue(measure, EXPRESSION_BASE_REF) || util.getValue(measure, EXPRESSION_REF);
  },

  /**
   * Get path to expression (e.g. "qDef.qDef")
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  getExpressionRef(measure) {
    return util.getValue(measure, EXPRESSION_BASE_REF) ? EXPRESSION_BASE_REF : EXPRESSION_REF;
  },

  /**
   * Get path to the qLibraryId property - from the base if it exists, otherwise from the measure as normal
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  getLibraryIdRef(measure) {
    return util.getValue(measure, LIB_BASE_REF) ? LIB_BASE_REF : LIB_REF;
  },

  /**
   * Get the qLibraryId property - from the base if it exists, otherwise returns qLibraryId of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   */
  getLibraryId(measure) {
    return util.getValue(measure, LIB_BASE_REF) || util.getValue(measure, LIB_REF);
  },

  getLabelRef(measure) {
    return util.getValue(measure, BASE_REF) ? LABEL_BASE_REF : LABEL_REF;
  },

  getLabelExpressionRef(measure) {
    return util.getValue(measure, BASE_REF) ? LABEL_EXPRESSION_BASE_REF : LABEL_EXPRESSION_REF;
  },
};
