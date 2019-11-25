import util from '../../utils/util';
import helper from '../helper';

const MODIFIER_TYPE = 'normalization';
const NORMALIZATION_TYPES = {
  RELATIVE_TO_TOTAL_SELECTION: 0,
  RELATIVE_TO_DIM_UNIVERSE: 1,
  RELATIVE_TO_TOTAL_UNIVERSE: 2,
};

function getModifierIndex(measure, modifiersRef) {
  const modifiers = util.getValue(measure, modifiersRef);
  if (!modifiers) {
    return -1;
  }
  for (let i = 0; i < modifiers.length; i++) {
    if (modifiers[i].type === MODIFIER_TYPE) {
      return i;
    }
  }
  return -1;
}

function getModifier(measure, modifiersRef) {
  const modifiers = util.getValue(measure, modifiersRef);
  if (!modifiers) {
    return;
  }
  for (let i = 0; i < modifiers.length; i++) {
    if (modifiers[i].type === MODIFIER_TYPE) {
      // eslint-disable-next-line consistent-return
      return modifiers[i];
    }
  }
}

function getRef(measure, modifiersRef) {
  const index = getModifierIndex(measure, modifiersRef);
  return index > -1 ? `${modifiersRef}.${index}` : modifiersRef;
}

export default function (rootPath) {
  const modifierProperties = {
    type: 'items',
    items: {
      disclaimer: {
        component: 'text',
        translation: 'properties.modifier.normalization.disclaimer',
        show(itemData, handler) {
          return !helper.isApplicable({ properties: handler.properties });
        },
      },
      settings: {
        type: 'items',
        items: {
          primaryDimension: {
            refFn: data => `${getRef(data, rootPath)}.primaryDimension`,
            type: 'integer',
            translation: 'properties.modifier.primaryDimension',
            title: {
              translation:
                'properties.modifier.normalization.primaryDimension.tooltip',
            },
            component: 'dropdown',
            schemaIgnore: true,
            defaultValue: 1,
            options(itemData, handler) {
              const { qDimensionInfo } = handler.layout.qHyperCube;
              return qDimensionInfo.map((dim, idx) => ({
                value: idx,
                label: dim.qGroupFallbackTitles[0],
              })); // To avoid depending on the layout, we use the first dimension in the drill down dimension
            },
            show(itemData, handler) {
              return handler.layout.qHyperCube.qDimensionInfo.length > 1;
            },
          },
          relativeNumbers: {
            refFn: data => `${getRef(data, rootPath)}.relativeNumbers`,
            type: 'string',
            translation: 'properties.modifier.relativeNumbers',
            title: {
              translation:
                'properties.modifier.relativeNumbers.tooltip',
            },
            component: 'dropdown',
            schemaIgnore: true,
            defaultValue: NORMALIZATION_TYPES.RELATIVE_TO_TOTAL_SELECTION,
            options: [
              {
                value: NORMALIZATION_TYPES.RELATIVE_TO_TOTAL_SELECTION,
                translation: 'properties.modifier.relativeNumbers.total.selection',
              },
              {
                value: NORMALIZATION_TYPES.RELATIVE_TO_DIM_UNIVERSE,
                translation: 'properties.modifier.relativeNumbers.dimensional.universe',
              },
              {
                value: NORMALIZATION_TYPES.RELATIVE_TO_TOTAL_UNIVERSE,
                translation: 'properties.modifier.relativeNumbers.total.universe',
              },
            ],
          },
          crossAllDimensions: {
            refFn: data => `${getRef(data, rootPath)}.crossAllDimensions`,
            type: 'boolean',
            translation: 'properties.modifier.crossAllDimensions',
            title: {
              translation:
                'properties.modifier.normalization.crossAllDimensions.tooltip',
            },
            schemaIgnore: true,
            defaultValue: false,
            show(itemData, handler) {
              return handler.layout.qHyperCube.qDimensionInfo.length > 1;
            },
          },
          showExcludedValues: {
            refFn: data => `${getRef(data, rootPath)}.showExcludedValues`,
            type: 'boolean',
            translation: 'properties.modifier.showExcludedValues',
            schemaIgnore: true,
            defaultValue: true,
          },
        },
        show(itemData, handler) {
          return helper.isApplicable({ properties: handler.properties });
        },
      },
    },
    show(itemData) {
      const modifier = getModifier(itemData, rootPath);
      return modifier && !modifier.disabled;
    },
  };

  return modifierProperties;
}
