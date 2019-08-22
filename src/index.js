/* eslint-disable no-param-reassign */
import extend from 'extend';
import util from './utils/util';
import softPropertyHandler from './soft-property-handler';
import accumulation from './expression-modifiers/accumulation';
import MasterItemSubscriber from './master-item-subscriber';
import measureBaseAdapter from './base-adapter';
import measureBase from './base';

const supportedModifiers = {
  accumulation,
};

function hasActiveSupportedModifier(modifiers) {
  return (
    Array.isArray(modifiers)
    && modifiers.some(mod => typeof mod === 'object' && !mod.disabled && supportedModifiers[mod.type])
  );
}

export function hasActiveModifiers(measures) {
  if (!Array.isArray(measures)) {
    return false;
  }
  return measures.some(measure => hasActiveSupportedModifier(measure.modifiers || (measure.qDef && measure.qDef.modifiers)));
}

function hasSomethingToRemove(measures) {
  if (!Array.isArray(measures)) {
    return false;
  }

  return measures.some(
    measure => (!Array.isArray(measure.modifiers) || !supportedModifiers.length) && typeof measure.base === 'object',
  );
}

function updateProps(model, prevProperties, properties) {
  if (util.getValue(model, 'layout.qMeta.privileges', []).indexOf('update') > -1) {
    return model.setProperties(properties);
  }

  return softPropertyHandler.saveSoftProperties(model, prevProperties, properties);
}

function getLibraryItemsProperties(model, measureLibraryIds = [], dimensionLibraryIds = []) {
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

function modifyMeasure(model, properties, measure, modifier, libraryId, libraryItemsProps) {
  const props = libraryItemsProps[libraryId];
  const generatedExpression = supportedModifiers[modifier.type].generateExpression(
    props.qMeasure.qDef,
    modifier,
    properties,
    libraryItemsProps,
  );
  modifier.outputExpression.qValueExpression.qExpr = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression.qValueExpression.qExpr;
  delete measure.qLibraryId;
  measure.qDef.coloring = props.qMeasure.coloring;
}

function modifyExpression(model, properties, measure, modifier, libraryItemsProps) {
  const expression = measureBaseAdapter.getExpression(measure);
  const generatedExpression = supportedModifiers[modifier.type].generateExpression(
    expression,
    modifier,
    properties,
    libraryItemsProps,
  );
  modifier.outputExpression.qValueExpression.qExpr = generatedExpression;
  measure.qDef.qDef = modifier.outputExpression.qValueExpression.qExpr;
}

function updateIfChanged(model, properties, newProperties) {
  const hasChanged = JSON.stringify(util.getValue(properties, 'qHyperCubeDef.qMeasures'))
    !== JSON.stringify(util.getValue(newProperties, 'qHyperCubeDef.qMeasures'));
  if (!hasChanged) {
    return Promise.resolve();
  }

  return updateProps(model, properties, newProperties);
}

function applyMeasureModifiers(model, properties, measure, libraryItemsProps) {
  let activeModifiersPerMeasure = 0;
  if (!measureBase.isValid(measure)) {
    measureBase.initBase(measure, true);
  }
  const { modifiers, base } = measure.qDef;

  Array.isArray(modifiers)
    && modifiers.forEach((modifier) => {
      if (typeof modifier === 'object' && !modifier.disabled) {
        activeModifiersPerMeasure++;

        if (typeof supportedModifiers[modifier.type] !== 'object') {
          throw new Error(`Modifier "${modifier.type}" is not available`);
        }
        if (activeModifiersPerMeasure > 1) {
          throw new Error('More than 1 modifier on a measure! (not yet supported)');
        }
        supportedModifiers[modifier.type].initModifier(modifier);

        const libraryId = measure.qLibraryId || (base && base.qLibraryId);
        if (libraryId) {
          modifyMeasure(model, properties, measure, modifier, libraryId, libraryItemsProps);
        } else {
          modifyExpression(model, properties, measure, modifier, libraryItemsProps);
        }
      }
    });
}

function getLibraryIds(properties, measureList) {
  const measures = measureList || util.getValue(properties, 'qHyperCubeDef.qMeasures', []);
  const measureLibraryIds = [];
  const dimensionLibraryIds = [];
  measures.forEach((measure) => {
    const { modifiers, base } = measure.qDef;
    if (hasActiveSupportedModifier(modifiers)) {
      const libraryId = measure.qLibraryId || (base && base.qLibraryId);
      if (libraryId) {
        measureLibraryIds.push(libraryId);
      }
    }
  });
  if (hasActiveModifiers(measures)) {
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

function updateMeasuresProperties(model, properties, measureList) {
  const measures = measureList || util.getValue(properties, 'qHyperCubeDef.qMeasures', []);
  if (!measures.length) {
    return Promise.resolve();
  }
  const libraryIds = getLibraryIds(properties, measureList);
  return getLibraryItemsProperties(model, libraryIds.measureLibraryIds, libraryIds.dimensionLibraryIds).then(
    (libraryItemsProps) => {
      measures.forEach((measure) => {
        const { modifiers } = measure.qDef;
        if (hasActiveSupportedModifier(modifiers)) {
          applyMeasureModifiers(model, properties, measure, libraryItemsProps);
        }
      });
    },
  );
}

export function applyModifiers(model, properties, measures, runUpdateIfChange = false) {
  const oldProperties = runUpdateIfChange ? extend(true, {}, properties) : properties; // Copy the current porperties and use the current properties to update values. This will work for 'set property' here or later through a change in property panel
  return updateMeasuresProperties(model, properties, measures).then(() => {
    if (runUpdateIfChange) {
      return updateIfChanged(model, oldProperties, properties);
    }
    return Promise.resolve();
  });
}

function cleanUpModifiers(model, properties) {
  const promise = Promise.resolve();

  // restore original
  const newProperties = extend(true, {}, properties);
  const measures = util.getValue(newProperties, 'qHyperCubeDef.qMeasures', []);
  measures.forEach(measureProps => measureBase.restoreBase(measureProps));
  measures.forEach(measureProps => measureProps.qDef.coloring && delete measureProps.qDef.coloring);

  promise.then(() => updateIfChanged(model, properties, newProperties));
  return promise;
}

export default function Modifiers(model) {
  this.apply = (runUpdateIfChange = true) => {
    const measures = util.getValue(model, 'layout.qHyperCube.qMeasureInfo');
    if (hasActiveModifiers(measures)) {
      return model.getEffectiveProperties().then(properties => this.masterItemSubscriber.subscribe(properties, model.layout).then(() => applyModifiers(model, properties, undefined, runUpdateIfChange)));
    }

    if (hasSomethingToRemove(measures)) {
      return model.getEffectiveProperties().then(properties => cleanUpModifiers(model, properties));
    }

    return Promise.resolve();
  };

  this.destroy = () => {
    this.masterItemSubscriber.unsubscribe();
  };

  this.masterItemSubscriber = MasterItemSubscriber({
    model,
    callback: () => this.apply().then(() => model.app.clearUndoBuffer()),
  });
}

export function storeMeasuresModifiers(measures) {
  measures.forEach((measure) => {
    measureBase.restoreBase(measure);
    measure.qDef.coloring && delete measure.qDef.coloring;
    if (measure.qDef.modifiers) {
      measure.store = { modifiers: measure.qDef.modifiers };
      delete measure.qDef.modifiers;
    }
  });
}

export function restoreMeasuresModifiers(measures) {
  measures.forEach((measure) => {
    if (measure.store && measure.store.modifiers) {
      measure.qDef.modifiers = measure.store.modifiers;
    }
    delete measure.store;
  });
}
