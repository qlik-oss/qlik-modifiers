import util from '../utils/util';

function getModifierIndex(measure, modifiersRef, type) {
  const modifiers = util.getValue(measure, modifiersRef);
  if (!modifiers) {
    return -1;
  }
  for (let i = 0; i < modifiers.length; i++) {
    if (modifiers[i].type === type) {
      return i;
    }
  }
  return -1;
}

function getModifier(measure, modifiersRef, type) {
  const modifiers = util.getValue(measure, modifiersRef);
  if (!modifiers) {
    return;
  }
  for (let i = 0; i < modifiers.length; i++) {
    if (modifiers[i].type === type) {
      // eslint-disable-next-line consistent-return
      return modifiers[i];
    }
  }
}

function getRef(measure, modifiersRef, type) {
  const index = getModifierIndex(measure, modifiersRef, type);
  return index > -1 ? `${modifiersRef}.${index}` : modifiersRef;
}

export default function (rootPath, type = 'accumulation') {
  const modifierProperties = {
    type: 'items',
    items: {
      accumulationMessage: {
        component: 'text',
        translation: 'properties.modifier.accumulation.disclaimer',
        show(itemData, handler) {
          return handler.maxDimensions() > 2;
        },
      },
      accumulationDimension: {
        refFn: data => `${getRef(data, rootPath, type)}.accumulationDimension`,
        type: 'integer',
        translation: 'properties.modifier.accumulation.dimension',
        title: {
          translation: 'properties.modifier.accumulation.dimension.tooltip',
        },
        component: 'dropdown',
        schemaIgnore: true,
        defaultValue: 1,
        options(itemData, handler) {
          const { qDimensionInfo } = handler.layout.qHyperCube;
          return qDimensionInfo.map((dim, idx) => ({ value: idx, label: dim.qGroupFallbackTitles[0] })); // To avoid depending on the layout, we use the first dimension in the drill down dimension
        },
        show(itemData, handler) {
          return handler.layout.qHyperCube.qDimensionInfo.length > 1;
        },
      },
      crossAllDimensions: {
        refFn: data => `${getRef(data, rootPath, type)}.crossAllDimensions`,
        type: 'boolean',
        translation: 'properties.modifier.accumulation.crossAllDimensions',
        title: {
          translation: 'properties.modifier.accumulation.crossAllDimensions.tooltip',
        },
        schemaIgnore: true,
        defaultValue: false,
        show(itemData, handler) {
          return handler.layout.qHyperCube.qDimensionInfo.length > 1;
        },
      },

      fullAccumulation: {
        refFn: data => `${getRef(data, rootPath, type)}.fullAccumulation`,
        type: 'boolean',
        translation: 'properties.modifier.accumulation.range',
        component: 'dropdown',
        schemaIgnore: true,
        defaultValue: false,
        options: [
          {
            value: true,
            translation: 'properties.modifier.accumulation.full',
          },
          {
            value: false,
            translation: 'properties.modifier.accumulation.custom',
          },
        ],
      },
      steps: {
        refFn: data => `${getRef(data, rootPath, type)}.steps`,
        type: 'integer',
        translation: 'properties.modifier.accumulation.steps',
        schemaIgnore: true,
        defaultValue: 6,
        change(itemData) {
          const modifier = getModifier(itemData, rootPath, type);
          if (modifier) {
            const { steps } = modifier;
            modifier.steps = typeof steps === 'number' && !Number.isNaN(steps) ? Math.abs(steps) : 6;
          }
        },
        show(itemData) {
          const modifier = getModifier(itemData, rootPath, type);
          return modifier && !modifier.fullAccumulation;
        },
      },
      showExcludedValues: {
        refFn: data => `${getRef(data, rootPath, type)}.showExcludedValues`,
        type: 'boolean',
        translation: 'properties.modifier.accumulation.showExcludedValues',
        schemaIgnore: true,
        defaultValue: true,
      },
    },
    show(itemData) {
      const modifier = getModifier(itemData, rootPath, type);
      return modifier && !modifier.disabled;
    },
  };

  return modifierProperties;
}
