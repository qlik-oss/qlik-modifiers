/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
import extend from 'extend';
import util from './utils/util';
import helper from './expression-modifiers/helper';
import SoftPropertyHandler from './soft-property-handler';
import accumulation from './expression-modifiers/accumulation';
import movingAverage from './expression-modifiers/moving-average';
import difference from './expression-modifiers/difference';
import normalization from './expression-modifiers/normalization';
import MasterItemSubscriber from './master-item-subscriber';
import measureBaseAdapter from './base-adapter';
import measureBase from './base';

const availableModifiers = {
  accumulation,
  movingAverage,
  difference,
  normalization,
};

/**
 * @module Modifiers
 */
export default {
  /**
   * An object literal containing all available modifiers
   * @type {Object}
   * @name modifiers
   * @static
   */
  modifiers: availableModifiers,

  apply,

  applyModifiers,

  cleanUpMeasure,

  destroy,

  hasActiveModifiers,

  getActiveModifier,

  initBase: measureBase.initBase,

  isSupportedModifiers,

  isApplicableSupportedModifiers,

  measureBase: measureBaseAdapter,

  limitedSorting,

  ifEnableTotalsFunction,
};

const objects = {};

/**
 * Applies defined modifiers to measures in hypercubeDef
 * (!subscribes to master items layout changes, call destroy function to unsubscribe)
 * @param {Object} options - An object with all input parameters
 * @param {Object} options.model - Enigma model of the object fetched from engine (mandatory)
 * @param {Object} [options.properties] - object properties.
 * @param {boolean} [options.isSnapshot=false] - is it a snapshot or not?
 * @param {Object} [options.masterItem] - layout of master item
 * @returns {Promise} Promise resolving with a boolean - modified: true/false (true if a setProperties or applyPatches has run)
 * @static
 */
function apply({
  model, properties, isSnapshot = false, masterItem,
} = {}) {
  const modified = false;
  objects[model.id] = objects[model.id] || {
    isFirstTime: true,
  };
  const { isFirstTime } = objects[model.id];
  objects[model.id].isFirstTime = false;

  if (properties && typeof properties === 'object') {
    return applyModifiers({ model, properties });
  }

  const layout = model ? model.layout : undefined;
  const inSelections = util.getValue(layout, 'qSelectionInfo.qInSelections');

  if (isSnapshot || inSelections) {
    return Promise.resolve(modified);
  }

  const measures = util.getValue(layout, 'qHyperCube.qMeasureInfo');
  const { lastReloadTime } = objects[model.id];
  objects[model.id].lastReloadTime = util.getValue(
    model,
    'app.layout.qLastReloadTime',
  );

  if (hasActiveModifiers({ measures, layout })) {
    const dataReloaded = isDataReloaded({
      measures,
      layout,
      model,
      lastReloadTime,
    });
    if (
      dataReloaded
      || needToUpdateMeasures({
        measures,
        layout,
        masterItem,
        isFirstTime,
      })
    ) {
      return model.getEffectiveProperties().then((effectiveProperties) => {
        const newProperties = extend(true, {}, effectiveProperties);
        // For forward and backward compatibility
        updateBase(newProperties);

        const libraryIds = getLibraryIds(newProperties);
        return getDimensionAndFieldList({ model }).then(dimensionAndFieldList => getLibraryItemsProperties({ libraryIds, model }).then(
          (libraryItemsProps) => {
            if (dataReloaded) {
              updateFieldNames({ properties: newProperties });
            }
            return applyModifiers({
              model,
              oldProperties: effectiveProperties,
              properties: newProperties,
              runUpdateIfChange: true,
              masterItem,
              libraryItemsProps,
              dimensionAndFieldList,
            });
          },
        ));
      });
    }
    return Promise.resolve(modified);
  }

  if (hasSomethingToRemove(measures)) {
    return model
      .getEffectiveProperties()
      .then(props => cleanUpModifiers({ model, properties: props }));
  }

  return Promise.resolve(modified);
}

/**
 * Applies defined modifiers to measures in hypercubeDef
 * (!subscribes to master items layout changes, call destroy function to unsubscribe)
 * @param {Object} options - An object with all input parameters
 * @param {Object} options.model - Enigma model of the object fetched from engine (mandatory)
 * @param {Object} [options.properties] - Object properties
 * @param {Object[]} [options.measures] - An array of measure properties
 * @param {boolean} [options.runUpdateIfChange=false] - Wether of not properties should be persisted (soft patched when readonly access)
 * @param {Object} [options.masterItem] - layout of master item
 * @returns {Promise} Promise resolving with a boolean - modified: true/false (true if a setProperties or applyPatches has run)
 * @static
 */
function applyModifiers({
  model,
  oldProperties,
  properties,
  measures,
  runUpdateIfChange = false,
  masterItem,
  libraryItemsProps,
  dimensionAndFieldList,
}) {
  if (oldProperties === undefined) {
    oldProperties = runUpdateIfChange
      ? extend(true, {}, properties)
      : properties; // Copy the current porperties and use the current properties to update values. This will work for 'set property' here or later through a change in property panel
  }

  // For forward and backward compatibility
  updateBase(properties);

  const libraryIds = getLibraryIds(properties);

  return updateMasterItemsSubscription({ model, libraryIds, masterItem }).then(
    () => updateMeasuresProperties({
      measures,
      properties,
      model,
      libraryItemsProps,
      dimensionAndFieldList,
    }).then(() => {
      if (runUpdateIfChange) {
        return updateIfChanged({
          oldProperties,
          newProperties: properties,
          model,
        }); // returns promise with modified: true/false
      }
      return Promise.resolve(false);
    }),
  );
}

/**
 * Restores the measure properties to how it was before modifiers were applied
 * @param {Object} measure - The measure properties object from the enigma model
 * @static
 */
function cleanUpMeasure(measure) {
  // For forward and backward compatibility
  if (!hasEnabledUnsupportedModifier(measure)) {
    measureBase.restoreBase(measure);
  } else {
    delete measure.qDef.base;
  }
  measure.qDef.coloring && delete measure.qDef.coloring;
  updateMeasureModifiers(measure);
}

/**
 * Removes layout subscribers (listeners for master items).
 * Make sure to run this when not using the object any longer to avoid memory leaks.
 * @param {Object} model - Enigma model of the object fetched from engine (mandatory)
 * @static
 */
function destroy(model) {
  if (model && objects[model.id] && objects[model.id].masterItemSubscriber) {
    if (objects[model.id].masterItemSubscriber) {
      objects[model.id].masterItemSubscriber.unsubscribe();
    }
    delete objects[model.id];
  }
}

/**
 * Checks if there is some active modifier in any of the provided measures
 * @param {Object} options - An object with all input parameters
 * @param {Object[]} options.measures - Array with measure properties or layout
 * @param {Object} [options.properties] - object properties (needs either this or the layout)
 * @param {Object} [options.layout] - object layout (needs either this or the properties)
 * @returns {Boolean} true if the there are any active modifiers
 * @static
 */
function hasActiveModifiers({ measures, properties, layout }) {
  if (!Array.isArray(measures)) {
    return false;
  }
  return measures.some(measure => isActiveModifiers({
    modifiers: getModifiers(measure),
    properties,
    layout,
  }));
}

function isSupportedModifiers(modifierTypes) {
  return (
    Array.isArray(modifierTypes)
    && modifierTypes.some(modifierType => availableModifiers[modifierType])
  );
}

function isApplicableSupportedModifiers({ modifierTypes, properties, layout }) {
  return (
    Array.isArray(modifierTypes)
    && modifierTypes.some(
      type => availableModifiers[type]
        && availableModifiers[type].isApplicable({ properties, layout }),
    )
  );
}

/**
 * Is sorting capabilities limited due to applied modifier?
 * Can operate either on layout or properties
 * @param {Object} options - An object with all input parameters
 * @param {Object[]} options.measures - Array with measure properties or layout
 * @param {Object} [options.properties] - object properties (needs either this or the layout)
 * @param {Object} [options.layout] - object layout (needs either this or the properties)
 * @static
 */
function limitedSorting({ measures, properties, layout }) {
  let hasActive = false;
  let needDims = false;
  measures.forEach((measure) => {
    const modifiers = getModifiers(measure);
    if (isActiveModifiers({ modifiers, properties, layout })) {
      hasActive = true;
      needDims = needDims
        || needDimensionForGeneration({ modifiers, properties, layout });
    }
  });
  return hasActive && !needDims;
}

/**
 * Get active modifier
 * @param {Object} measure - The measure properties object
 * @static
 */
function getActiveModifier(measure) {
  const modifiers = getModifiers(measure);
  if (Array.isArray(modifiers)) {
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      if (availableModifiers[modifier.type] && !modifier.disabled) {
        return modifier;
      }
    }
  }
  return undefined;
}

/**
 * Check if one type of modifier should enable totals function in table
 * @param {Object} measure - The measure properties object
 * @static
 */
function ifEnableTotalsFunction(measure) {
  const activeModifier = getActiveModifier(measure);
  return !activeModifier || availableModifiers[activeModifier.type].enableTotalsFunction(measure);
}

/* ----------------------- Private functions ------------------------ */

function getMeasures(properties) {
  const measures = util
    .getValue(properties, 'qHyperCubeDef.qMeasures', [])
    .concat(
      util.getValue(
        properties,
        'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures',
        [],
      ),
    );
  return measures;
}

function getModifiers(measure) {
  return measure.modifiers || (measure.qDef && measure.qDef.modifiers);
}

function getOutputExpression(modifier) {
  return util.getValue(modifier, 'outputExpression.qValueExpression.qExpr') || util.getValue(modifier, 'outputExpression');
}

function updateMeasureBase(measure) {
  // For forward and backward compatibility
  const activeModifier = getActiveModifier(measure);
  if (activeModifier) {
    if (activeModifier.outputExpression !== undefined && getOutputExpression(activeModifier) !== measure.qDef.qDef) {
      delete measure.qDef.base;
    } else if (!measureBase.isValid(measure) && activeModifier.base) {
      measure.qDef.base = extend(true, {}, activeModifier.base);
    }
  }
}

function updateBase(properties) {
  const measures = getMeasures(properties);
  measures.forEach(measure => updateMeasureBase(measure));
}

function updateMeasureModifiers(measure) {
  // For forward and backward compatibility
  const modifiers = getModifiers(measure);
  if (Array.isArray(modifiers)) {
    modifiers.forEach((modifier) => {
      if (typeof modifier === 'object') {
        if (modifier.disabled || (!availableModifiers[modifier.type] && getOutputExpression(modifier) !== measure.qDef.qDef)) {
          modifier.disabled = true;
          delete modifier.base;
        }
      }
    });
  }
}

function getBase(measure) {
  return measure.base || (measure.qDef && measure.qDef.base);
}

function getLibraryId(measure) {
  const base = getBase(measure);
  return measure.qLibraryId || (base && base.qLibraryId);
}

function isNormalMeasureWithActiveModifiers({ measure, properties, layout }) {
  const libraryId = getLibraryId(measure);
  return (
    !libraryId
    && isActiveModifiers({
      modifiers: getModifiers(measure),
      properties,
      layout,
    })
  );
}

function hasNormalMeasureWithActiveModifiers({ measures, properties, layout }) {
  if (!Array.isArray(measures)) {
    return false;
  }
  return measures.some(measure => isNormalMeasureWithActiveModifiers({ measure, properties, layout }));
}

function isDataReloaded({
  measures, layout, model, lastReloadTime,
}) {
  const qLastReloadTime = util.getValue(model, 'app.layout.qLastReloadTime');
  const reloaded = qLastReloadTime !== lastReloadTime;
  return reloaded && hasNormalMeasureWithActiveModifiers({ measures, layout });
}

function updateMeasureFieldName({ measure, properties }) {
  if (isNormalMeasureWithActiveModifiers({ measure, properties })) {
    let activeModifiersPerMeasure = 0;
    const { modifiers } = measure.qDef;

    Array.isArray(modifiers)
      && modifiers.forEach((modifier) => {
        if (typeof modifier === 'object' && !modifier.disabled) {
          activeModifiersPerMeasure++;

          if (typeof availableModifiers[modifier.type] !== 'object') {
            throw new Error(`Modifier "${modifier.type}" is not available`);
          }
          if (activeModifiersPerMeasure > 1) {
            throw new Error(
              'More than 1 modifier on a measure! (not yet supported)',
            );
          }
          const inputExpr = availableModifiers[
            modifier.type
          ].extractInputExpression({
            outputExpression: measure.qDef.qDef,
            modifier,
          });
          if (
            typeof inputExpr !== 'undefined'
            && getBase(measure)
            && helper.simplifyExpression(measure.qDef.base.qDef)
              !== helper.simplifyExpression(inputExpr)
          ) {
            measure.qDef.base.qDef = inputExpr;
          }
        }
      });
  }
}

function updateFieldNames({ properties }) {
  const measures = getMeasures(properties);
  measures.forEach(measure => updateMeasureFieldName({ measure, properties }));
}

function hasEnabledUnsupportedModifier(measure) {
  const modifiers = getModifiers(measure);
  return Array.isArray(modifiers) && modifiers.some(modifier => typeof modifier === 'object' && !modifier.disabled && !availableModifiers[modifier.type]);
}

function isActiveModifiers({ modifiers, properties, layout }) {
  const supportedTypes = {};
  return (
    Array.isArray(modifiers)
    && modifiers.some((modifier) => {
      if (
        typeof modifier === 'object'
        && !modifier.disabled
        && availableModifiers[modifier.type]
      ) {
        if (typeof supportedTypes[modifier.type] === 'undefined') {
          supportedTypes[modifier.type] = availableModifiers[
            modifier.type
          ].isApplicable({ properties, layout });
        }
        return supportedTypes[modifier.type];
      }
      return false;
    })
  );
}

function hasSomethingToRemove(measures) {
  if (!Array.isArray(measures)) {
    return false;
  }

  return measures.some(measure => typeof measure.base === 'object');
}

function needToUpdateMeasure({ measure, layout }) {
  const modifiers = getModifiers(measure);
  if (isActiveModifiers({ modifiers, layout })) {
    return !measure.base;
  }
  return !!measure.base;
}

function needToUpdateMeasures({
  measures, layout, masterItem, isFirstTime,
}) {
  if (!Array.isArray(measures)) {
    return false;
  }

  // measures using modifiers needs to be updated in the following cases:
  // 1: on the first time the object is rendered based on the layout, or
  // 2: a master measure or a master dimension (which is used for generation of the expression) is changed, or
  // 3: (TODO) data is reloaded (e.g. a field is renamed and then reloaded)

  return (
    isFirstTime
    || masterItem
    || measures.some(measure => needToUpdateMeasure({ measure, layout }))
  );
}

function updateProperties({ model, oldProperties, newProperties }) {
  const { layout } = model;
  if (
    layout
    && !layout.qHasSoftPatches
    && !layout.qExtendsId
    && util.getValue(layout, 'qMeta.privileges', []).indexOf('update') > -1
  ) {
    return model.setProperties(newProperties);
  }

  return SoftPropertyHandler.saveSoftProperties(
    model,
    oldProperties,
    newProperties,
  );
}

function getDimensionAndFieldList({ model, dimensionAndFieldList }) {
  if (dimensionAndFieldList) {
    return Promise.resolve(dimensionAndFieldList);
  }
  const promises = [];
  const items = {};
  const p1 = model.app.getDimensionList().then((dimensionList) => {
    items.dimensionList = dimensionList;
  });
  promises.push(p1);
  const p2 = model.app.getFieldList().then((fieldList) => {
    items.fieldList = fieldList;
  });
  promises.push(p2);
  return Promise.all(promises).then(() => items);
}

function getLibraryItemsProperties({ libraryIds, model, libraryItemsProps }) {
  if (libraryItemsProps) {
    return Promise.resolve(libraryItemsProps);
  }
  const { measureLibraryIds, dimensionLibraryIds } = libraryIds;
  const masterItems = {};
  const promises = [];
  measureLibraryIds.forEach((libraryId) => {
    const p = model.app.getMeasure(libraryId).then(item => item.getProperties().then((props) => {
      masterItems[libraryId] = props;
    }));
    promises.push(p);
  });
  dimensionLibraryIds.forEach((libraryId) => {
    const p = model.app.getDimension(libraryId).then(item => item.getProperties().then((props) => {
      masterItems[libraryId] = props;
    }));
    promises.push(p);
  });
  return Promise.all(promises).then(() => masterItems);
}

function modifyMeasure({
  measure,
  modifier,
  libraryId,
  properties,
  libraryItemsProps,
  dimensionAndFieldList,
}) {
  const props = libraryItemsProps[libraryId];
  const inputExpression = props.qMeasure.qDef;
  const generatedExpression = availableModifiers[
    modifier.type
  ].generateExpression({
    expression: inputExpression,
    modifier,
    properties,
    dimensionAndFieldList,
  });
  modifier.outputExpression = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression;
  if (measure.qDef.qLabel || props.qMeasure.qLabel) {
    measure.qDef.qLabel = props.qMeasure.qLabel;
  }
  if (measure.qDef.qLabelExpression || props.qMeasure.qLabelExpression) {
    measure.qDef.qLabelExpression = props.qMeasure.qLabelExpression;
  }
  if (measure.qDef.quarantine && measure.qDef.quarantine.qNumFormat && props.qMeasure.qNumFormat) {
    measure.qDef.qNumFormat = props.qMeasure.qNumFormat;
    measure.qDef.isCustomFormatted = props.qMeasure.isCustomFormatted;
  }
  delete measure.qLibraryId;
  measure.qDef.coloring = props.qMeasure.coloring;
  modifier.base = extend(true, {}, measure.qDef.base);
}

function modifyExpression({
  measure,
  modifier,
  properties,
  dimensionAndFieldList,
}) {
  if (typeof availableModifiers[
    modifier.type
  ].updateModifier === 'function') {
    availableModifiers[
      modifier.type
    ].updateModifier(modifier, properties.qHyperCubeDef);
  }
  const inputExpression = measureBaseAdapter.getExpression(measure);
  const generatedExpression = availableModifiers[
    modifier.type
  ].generateExpression({
    expression: inputExpression,
    modifier,
    properties,
    dimensionAndFieldList,
  });
  modifier.outputExpression = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression;
  if (measure.qDef.base.qLabelExpression) {
    measure.qDef.qLabelExpression = measure.qDef.base.qLabelExpression;
  } else {
    measure.qDef.qLabel = measure.qDef.base.qLabel || inputExpression;
  }
  modifier.base = extend(true, {}, measure.qDef.base);
}

function updateTotalsFunction(measure) {
  const qAggrFunc = util.getValue(measure, 'qDef.qAggrFunc');
  if (qAggrFunc === 'Expr' && !ifEnableTotalsFunction(measure)) {
    measure.qDef.qAggrFunc = 'None';
    measure.qDef.base.qAggrFunc = 'Expr';
  } else if (qAggrFunc !== 'None') {
    delete measure.qDef.base.qAggrFunc;
  } else if (qAggrFunc === 'None' && ifEnableTotalsFunction(measure) && measure.qDef.base.qAggrFunc === 'Expr') {
    measure.qDef.qAggrFunc = 'Expr';
    delete measure.qDef.base.qAggrFunc;
  }
}

function ingnoreEmptyNumFormatProps(key, value) {
  const props = ['qFmt', 'qDec', 'qThou'];
  if (value === '' && props.indexOf(key) !== -1) {
    return undefined;
  }
  return value;
}

/**
 * @returns {Promise} Promise resolving with a boolean - modified: true/false
 * @private
 */
function updateIfChanged({ oldProperties, newProperties, model }) {
  const modified = JSON.stringify(util.getValue(oldProperties, 'qHyperCubeDef.qMeasures'), ingnoreEmptyNumFormatProps)
      !== JSON.stringify(util.getValue(newProperties, 'qHyperCubeDef.qMeasures'), ingnoreEmptyNumFormatProps)
    || JSON.stringify(
      util.getValue(
        oldProperties,
        'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures',
      ),
      ingnoreEmptyNumFormatProps,
    )
      !== JSON.stringify(
        util.getValue(
          newProperties,
          'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures',
        ),
        ingnoreEmptyNumFormatProps,
      );
  if (!modified) {
    return Promise.resolve(modified);
  }
  return updateProperties({ model, oldProperties, newProperties }).then(
    () => modified,
  );
}

function applyMeasureModifiers({
  measure,
  properties,
  libraryItemsProps,
  dimensionAndFieldList,
}) {
  let activeModifiersPerMeasure = 0;
  if (!measureBase.isValid(measure)) {
    measureBase.initBase(measure, true);
  }
  const { modifiers, base } = measure.qDef;

  Array.isArray(modifiers)
    && modifiers.forEach((modifier) => {
      if (typeof modifier === 'object' && !modifier.disabled) {
        activeModifiersPerMeasure++;

        if (typeof availableModifiers[modifier.type] !== 'object') {
          throw new Error(`Modifier "${modifier.type}" is not available`);
        }
        if (activeModifiersPerMeasure > 1) {
          throw new Error(
            'More than 1 modifier on a measure! (not yet supported)',
          );
        }
        availableModifiers[modifier.type].initModifier(modifier);

        const libraryId = measure.qLibraryId || (base && base.qLibraryId);
        if (libraryId) {
          modifyMeasure({
            measure,
            modifier,
            libraryId,
            properties,
            libraryItemsProps,
            dimensionAndFieldList,
          });
        } else {
          modifyExpression({
            measure,
            modifier,
            properties,
            dimensionAndFieldList,
          });
        }
        updateTotalsFunction(measure);
      }
    });
}

function needDimensionForGeneration({ modifiers, properties, layout }) {
  return (
    Array.isArray(modifiers)
    && modifiers.some(
      modifier => typeof modifier === 'object'
        && !modifier.disabled
        && availableModifiers[modifier.type]
        && availableModifiers[modifier.type].needDimension({
          modifier,
          properties,
          layout,
        }),
    )
  );
}

function getLibraryIds(properties) {
  const measures = getMeasures(properties);
  const measureLibraryIds = [];
  const dimensionLibraryIds = [];
  let needDims = false;
  measures.forEach((measure) => {
    const modifiers = getModifiers(measure);
    if (isActiveModifiers({ modifiers, properties })) {
      const libraryId = getLibraryId(measure);
      if (libraryId) {
        measureLibraryIds.push(libraryId);
      }
      needDims = needDims || needDimensionForGeneration({ modifiers, properties });
    }
  });
  const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
  dimensions.forEach((dimension) => {
    const libraryId = dimension.qLibraryId;
    if (libraryId) {
      dimensionLibraryIds.push(libraryId);
    }
  });
  return { measureLibraryIds, dimensionLibraryIds };
}

function updateMasterItemsSubscription({ model, libraryIds, masterItem }) {
  if (!masterItem) {
    if (
      libraryIds
      && (libraryIds.measureLibraryIds.length
        || libraryIds.dimensionLibraryIds.length)
    ) {
      objects[model.id].masterItemSubscriber = objects[model.id].masterItemSubscriber
        || MasterItemSubscriber({
          model,
          callback: itemLayout => apply({ model, masterItem: itemLayout }).then(() => model.app.clearUndoBuffer()),
        });

      return objects[model.id].masterItemSubscriber.subscribe(libraryIds);
    }
  }
  return Promise.resolve();
}

/**
 * @returns {Promise} Promise resolving with a boolean - modified: true/false
 * @private
 */
function cleanUpModifiers({ model, properties }) {
  const libraryIds = getLibraryIds(properties);
  return updateMasterItemsSubscription({ model, libraryIds }).then(() => {
    // restore original
    const oldProperties = extend(true, {}, properties);
    const measures = getMeasures(properties);
    measures.forEach(measure => cleanUpMeasure(measure));
    return updateIfChanged({ oldProperties, newProperties: properties, model }); // returns promise with modified: true/false
  });
}

function updateMeasuresProperties({
  measures,
  properties,
  model,
  libraryItemsProps,
  dimensionAndFieldList,
}) {
  if (!measures) {
    measures = getMeasures(properties);
  }

  if (!measures.length) {
    return Promise.resolve();
  }

  if (!hasActiveModifiers({ measures, properties })) {
    measures.forEach(measure => cleanUpMeasure(measure));
    return Promise.resolve();
  }

  const libraryIds = libraryItemsProps ? undefined : getLibraryIds(properties);
  return getDimensionAndFieldList({ model, dimensionAndFieldList }).then(list => getLibraryItemsProperties({ libraryIds, model, libraryItemsProps }).then(
    (libraryItems) => {
      measures.forEach((measure) => {
        const { modifiers } = measure.qDef;
        if (isActiveModifiers({ modifiers, properties })) {
          applyMeasureModifiers({
            measure,
            properties,
            libraryItemsProps: libraryItems,
            dimensionAndFieldList: list,
          });
          updateMeasureModifiers(measure);
        } else {
          cleanUpMeasure(measure);
        }
      });
    },
  ));
}
