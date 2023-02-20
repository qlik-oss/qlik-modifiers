import util from '../../utils/util';
import helper from '../helper';

const MODIFIER_TYPE = 'timeSeriesDecomposition';

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
        translation: translationKeys.timeSeriesDecomposition || 'properties.modifier.timeSeriesDecomposition',
        show(itemData, handler) {
          return !helper.isApplicable({ properties: handler.properties });
        },
      },
      settings: {
        type: 'items',
        items: {
          decomposition: {
            refFn: data => `${getRef(data, rootPath)}.decomposition`,
            type: 'string',
            translation: translationKeys.trendDecompositionParametersDecomposition || 'cao.trendDecomposition.parameters.decomposition',
            component: 'dropdown',
            schemaIgnore: true,
            defaultValue: translationKeys.trendDecompositionParametersDecompositionObserved || 'cao.trendDecomposition.parameters.decomposition.observed',
            options(itemdata, handler) {
              const { options } = handler.layout.recommendation.matchRecord.parameters.find(item => item.name === 'vDecompositions');
              return options.map(option => ({ value: option.localizedMsg, translation: option.msgId }));
            },
          },
          steps: {
            refFn: data => `${getRef(data, rootPath)}.steps`,
            type: 'integer',
            translation: translationKeys.rangeSteps || 'properties.modifier.range.steps',
            schemaIgnore: true,
            defaultValue: 12,
            change(itemData) {
              const modifier = getModifier(itemData, rootPath);
              if (modifier) {
                const { steps } = modifier;
                modifier.steps = typeof steps === 'number' && !Number.isNaN(steps) ? Math.abs(steps) : 12;
              }
            },
            show(itemData) {
              const modifier = getModifier(itemData, rootPath);
              return modifier && !modifier.fullRange;
            },
          },
        },
        show(itemData, handler) {
          return helper.isApplicable({ properties: handler.properties });
        },
      },
    },
    show(itemData, handler, args) {
      const modifierTypes = args.ext.support.modifiers;
      const supported = Array.isArray(modifierTypes) && modifierTypes.indexOf(MODIFIER_TYPE) !== -1;
      if (!supported) {
        return false;
      }
      const modifier = getModifier(itemData, rootPath);
      return modifier && !modifier.disabled;
    },
  };

  return modifierProperties;
}
