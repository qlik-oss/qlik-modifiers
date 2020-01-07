import util from '../../utils/util';
import helper from '../helper';

const MODIFIER_TYPE = 'difference';

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

export default function (rootPath, translationKeys = {}) {
  const modifierProperties = {
    type: 'items',
    items: {
      disclaimer: {
        component: 'text',
        translation: translationKeys.disclaimer || 'properties.modifier.difference.disclaimer',
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
            translation: translationKeys.primaryDimension || 'properties.modifier.primaryDimension',
            title: {
              translation: translationKeys.primaryDimensionTooltip || 'properties.modifier.difference.primaryDimension.tooltip',
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
            refFn: data => `${getRef(data, rootPath)}.crossAllDimensions`,
            type: 'boolean',
            translation: translationKeys.crossAllDimensions || 'properties.modifier.crossAllDimensions',
            title: {
              translation: translationKeys.crossAllDimensionsTooltip || 'properties.modifier.difference.crossAllDimensions.tooltip',
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
            translation: translationKeys.showExcludedValues || 'properties.modifier.showExcludedValues',
            schemaIgnore: true,
            defaultValue: true,
          },
        },
        show(itemData, handler) {
          return helper.isApplicable({ properties: handler.properties });
        },
      },
    },
    show(itemData, handler, args) {
      const modifierTypes = args.ext.support.modifiers;
      const supported = modifierTypes && Array.isArray(modifierTypes) && modifierTypes.indexOf(MODIFIER_TYPE) !== -1;
      if (!supported) {
        return false;
      }
      const modifier = getModifier(itemData, rootPath);
      return modifier && !modifier.disabled;
    },
  };

  return modifierProperties;
}
