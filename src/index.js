/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
import extend from 'extend';
import util from './utils/util';
import SoftPropertyHandler from './soft-property-handler';
import accumulation from './expression-modifiers/accumulation';
import MasterItemSubscriber from './master-item-subscriber';
import measureBaseAdapter from './base-adapter';
import measureBase from './base';

const availableModifiers = {
  accumulation,
};
const objects = {};

function getModifiers(measure) {
  return measure.modifiers || (measure.qDef && measure.qDef.modifiers);
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

          if (typeof Modifiers.modifiers[modifier.type] !== 'object') {
            throw new Error(`Modifier "${modifier.type}" is not available`);
          }
          if (activeModifiersPerMeasure > 1) {
            throw new Error('More than 1 modifier on a measure! (not yet supported)');
          }
          const inputExpr = Modifiers.modifiers[modifier.type].extractInputExpression({
            outputExpression: measure.qDef.qDef,
            modifier,
            properties,
          });
          if (
            typeof inputExpr !== 'undefined'
            && getBase(measure)
            && Modifiers.modifiers[modifier.type].simplifyExpression(measure.qDef.base.qDef)
              !== Modifiers.modifiers[modifier.type].simplifyExpression(inputExpr)
          ) {
            measure.qDef.base.qDef = inputExpr;
          }
        }
      });
  }
}

function updateFieldNames({ properties }) {
  const measures = util.getValue(properties, 'qHyperCubeDef.qMeasures', []);
  measures.forEach(measure => updateMeasureFieldName({ measure, properties }));
}

function isActiveModifiers({ modifiers, properties, layout }) {
  const supportedTypes = {};
  return (
    Array.isArray(modifiers)
    && modifiers.some((modifier) => {
      if (typeof modifier === 'object' && !modifier.disabled && availableModifiers[modifier.type]) {
        if (typeof supportedTypes[modifier.type] === 'undefined') {
          supportedTypes[modifier.type] = availableModifiers[modifier.type].isApplicable({ properties, layout });
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

  return isFirstTime || masterItem || measures.some(measure => needToUpdateMeasure({ measure, layout }));
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

  return SoftPropertyHandler.saveSoftProperties(model, oldProperties, newProperties);
}

function getLibraryItemsProperties({ libraryIds, model }) {
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
  measure, modifier, libraryId, properties, libraryItemsProps,
}) {
  const props = libraryItemsProps[libraryId];
  const generatedExpression = availableModifiers[modifier.type].generateExpression({
    expression: props.qMeasure.qDef,
    modifier,
    properties,
    libraryItemsProps,
  });
  modifier.outputExpression = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression;
  if (measure.qDef.qLabel || props.qMeasure.qLabel) {
    measure.qDef.qLabel = props.qMeasure.qLabel;
  }
  if (measure.qDef.qLabelExpression || props.qMeasure.qLabelExpression) {
    measure.qDef.qLabelExpression = props.qMeasure.qLabelExpression;
  }
  delete measure.qLibraryId;
  measure.qDef.coloring = props.qMeasure.coloring;
  measure.qDef.base.inputExpression = props.qMeasure.qDef;
}

function modifyExpression({
  measure, modifier, properties, libraryItemsProps,
}) {
  const expression = measureBaseAdapter.getExpression(measure);
  const generatedExpression = availableModifiers[modifier.type].generateExpression({
    expression,
    modifier,
    properties,
    libraryItemsProps,
  });
  modifier.outputExpression = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression;
  if (measure.qDef.base.qLabelExpression) {
    measure.qDef.qLabelExpression = measure.qDef.base.qLabelExpression;
  } else {
    measure.qDef.qLabel = measure.qDef.base.qLabel || expression;
  }
  measure.qDef.base.inputExpression = expression;
}

function updateTotalsFunction(measure) {
  const qAggrFunc = util.getValue(measure, 'qDef.qAggrFunc');
  if (qAggrFunc === 'Expr') {
    measure.qDef.qAggrFunc = 'None';
    measure.qDef.base.qAggrFunc = 'Expr';
  } else if (qAggrFunc !== 'None') {
    delete measure.qDef.base.qAggrFunc;
  }
}

function updateIfChanged({ oldProperties, newProperties, model }) {
  const hasChanged = JSON.stringify(util.getValue(oldProperties, 'qHyperCubeDef.qMeasures'))
      !== JSON.stringify(util.getValue(newProperties, 'qHyperCubeDef.qMeasures'))
    || JSON.stringify(util.getValue(oldProperties, 'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures'))
      !== JSON.stringify(util.getValue(newProperties, 'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures'));
  if (!hasChanged) {
    return Promise.resolve();
  }
  return updateProperties({ model, oldProperties, newProperties });
}

function applyMeasureModifiers({ measure, properties, libraryItemsProps }) {
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
          throw new Error('More than 1 modifier on a measure! (not yet supported)');
        }
        availableModifiers[modifier.type].initModifier(modifier);

        const libraryId = measure.qLibraryId || (base && base.qLibraryId);
        if (libraryId) {
          modifyMeasure({
            measure, modifier, libraryId, properties, libraryItemsProps,
          });
        } else {
          modifyExpression({
            measure, modifier, properties, libraryItemsProps,
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
        && availableModifiers[modifier.type].needDimension({ modifier, properties, layout }),
    )
  );
}

function getLibraryIds(properties) {
  const measures = util
    .getValue(properties, 'qHyperCubeDef.qMeasures', [])
    .concat(util.getValue(properties, 'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures', []));
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
  if (needDims) {
    const dimensions = util.getValue(properties, 'qHyperCubeDef.qDimensions', []);
    dimensions.forEach((dimension) => {
      const libraryId = dimension.qLibraryId;
      if (libraryId) {
        dimensionLibraryIds.push(libraryId);
      }
    });
  }
  return { measureLibraryIds, dimensionLibraryIds };
}

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

function cleanUpMeasure(measure) {
  measureBase.restoreBase(measure);
  measure.qDef.coloring && delete measure.qDef.coloring; // eslint-disable-line no-param-reassign
}

function apply({
  model, properties, isSnapshot = false, masterItem,
} = {}) {
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
    return Promise.resolve();
  }

  const measures = util.getValue(layout, 'qHyperCube.qMeasureInfo');
  const { lastReloadTime } = objects[model.id];
  objects[model.id].lastReloadTime = util.getValue(model, 'app.layout.qLastReloadTime');

  if (hasActiveModifiers({ measures, layout })) {
    const dataReloaded = isDataReloaded({
      measures, layout, model, lastReloadTime,
    });
    if (dataReloaded || needToUpdateMeasures({
      measures, layout, masterItem, isFirstTime,
    })) {
      return model.getEffectiveProperties().then((effectiveProperties) => {
        if (dataReloaded) {
          updateFieldNames({ properties: effectiveProperties });
        }
        return applyModifiers({
          model,
          properties: effectiveProperties,
          runUpdateIfChange: true,
          masterItem,
        });
      });
    }
    return Promise.resolve();
  }

  if (hasSomethingToRemove(measures)) {
    return model.getEffectiveProperties().then(props => cleanUpModifiers({ model, properties: props }));
  }

  return Promise.resolve();
}

function updateMasterItemsSubscription({ model, libraryIds, masterItem }) {
  if (!masterItem) {
    if (libraryIds && (libraryIds.measureLibraryIds.length || libraryIds.dimensionLibraryIds.length)) {
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

function cleanUpModifiers({ model, properties }) {
  const libraryIds = getLibraryIds(properties);
  return updateMasterItemsSubscription({ model, libraryIds }).then(() => {
    // restore original
    const oldProperties = extend(true, {}, properties);
    const measures = util.getValue(properties, 'qHyperCubeDef.qMeasures', []);
    measures.forEach(measure => cleanUpMeasure(measure));
    return updateIfChanged({ oldProperties, newProperties: properties, model });
  });
}

function updateMeasuresProperties({ measures, properties, model }) {
  if (!measures) {
    measures = util
      .getValue(properties, 'qHyperCubeDef.qMeasures', [])
      .concat(util.getValue(properties, 'qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures', []));
  }

  if (!measures.length) {
    return Promise.resolve();
  }

  if (!hasActiveModifiers({ measures, properties })) {
    measures.forEach(measure => cleanUpMeasure(measure));
    return Promise.resolve();
  }

  const libraryIds = getLibraryIds(properties);
  return getLibraryItemsProperties({ libraryIds, model }).then((libraryItemsProps) => {
    measures.forEach((measure) => {
      const { modifiers } = measure.qDef;
      if (isActiveModifiers({ modifiers, properties })) {
        applyMeasureModifiers({ measure, properties, libraryItemsProps });
      }
    });
  });
}

function applyModifiers({
  model, properties, measures, runUpdateIfChange = false, masterItem,
}) {
  const libraryIds = getLibraryIds(properties);

  return updateMasterItemsSubscription({ model, libraryIds, masterItem }).then(() => {
    const oldProperties = runUpdateIfChange ? extend(true, {}, properties) : properties; // Copy the current porperties and use the current properties to update values. This will work for 'set property' here or later through a change in property panel
    return updateMeasuresProperties({ measures, properties, model }).then(() => {
      if (runUpdateIfChange) {
        return updateIfChanged({ oldProperties, newProperties: properties, model });
      }
      return Promise.resolve();
    });
  });
}

function isSupportedModifiers(modifierTypes) {
  return Array.isArray(modifierTypes) && modifierTypes.some(modifierType => availableModifiers[modifierType]);
}

function isApplicableSupportedModifiers({ modifierTypes, properties, layout }) {
  return (
    Array.isArray(modifierTypes)
    && modifierTypes.some(
      type => availableModifiers[type] && availableModifiers[type].isApplicable({ properties, layout }),
    )
  );
}

function showSortingDisclaimer({ measures, properties, layout }) {
  let hasActive = false;
  let needDims = false;
  measures.forEach((measure) => {
    const modifiers = getModifiers(measure);
    if (isActiveModifiers({ modifiers, properties, layout })) {
      hasActive = true;
      needDims = needDims || needDimensionForGeneration({ modifiers, properties, layout });
    }
  });
  return hasActive && !needDims;
}

function destroy(model) {
  if (model && objects[model.id] && objects[model.id].masterItemSubscriber) {
    if (objects[model.id].masterItemSubscriber) {
      objects[model.id].masterItemSubscriber.unsubscribe();
    }
    delete objects[model.id];
  }
}

const Modifiers = {
  modifiers: availableModifiers,

  apply,

  hasActiveModifiers,

  applyModifiers,

  isSupportedModifiers,

  isApplicableSupportedModifiers,

  cleanUpMeasure,

  measureBase: measureBaseAdapter,

  initBase: measureBase.initBase,

  showSortingDisclaimer,

  destroy,
};

export default Modifiers;
