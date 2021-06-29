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

/**
 * Utility functions for accessing input/base properties of a measure
 * @memberof module:Modifiers
 */
const measureBase = {
  /**
   * Get the qDef property - from the base if it exists, otherwise returns qDef.qDef of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} The original/input expression
   */
  getExpression(measure) {
    const exp = util.getValue(measure, EXPRESSION_BASE_REF);
    return typeof exp !== 'undefined' ? exp : util.getValue(measure, EXPRESSION_REF);
  },

  /**
   * Get path to expression (e.g. "qDef.qDef")
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} Reference to the the original/input expression property (qDef)
   */
  getExpressionRef(measure) {
    return typeof util.getValue(measure, EXPRESSION_BASE_REF) !== 'undefined' ? EXPRESSION_BASE_REF : EXPRESSION_REF;
  },

  /**
   * Get path to the qLibraryId property - from the base if it exists, otherwise from the measure as normal
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} Reference to the original/input libraryId property (qLibraryId)
   */
  getLibraryIdRef(measure) {
    return util.getValue(measure, LIB_BASE_REF) ? LIB_BASE_REF : LIB_REF;
  },

  /**
   * Get the qLibraryId property - from the base if it exists, otherwise returns qLibraryId of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} The original/input libraryId
   */
  getLibraryId(measure) {
    return util.getValue(measure, LIB_BASE_REF) || util.getValue(measure, LIB_REF);
  },

  /**
   * Get the qLabel property - from the base if it exists, otherwise returns qLabel of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} Reference to the original/input label property (qLabel)
   */
  getLabelRef(measure) {
    return util.getValue(measure, BASE_REF) ? LABEL_BASE_REF : LABEL_REF;
  },

  /**
   * Get the qLabelExpression property - from the base if it exists, otherwise returns qLabelExpression of the measure
   * @param {Object} measure - Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array)
   * @returns {string} Reference to the original/input labelExpression property (qLabelExpression)
   */
  getLabelExpressionRef(measure) {
    return util.getValue(measure, BASE_REF) ? LABEL_EXPRESSION_BASE_REF : LABEL_EXPRESSION_REF;
  },
};

export default measureBase;
