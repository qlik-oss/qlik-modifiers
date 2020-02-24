import util from '../../utils/util';
import helper from '../helper';
import SCOPE from './constants';

const MODIFIER_TYPE = 'normalization';

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

function findOptionIndex(options, value) {
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === value) return i;
  }
  return -1;
}

function getDimOptionsByNumOfDim(numberOfDim, options, removeOption) {
  if (numberOfDim < 2) {
    const index = findOptionIndex(options, removeOption);
    options.splice(index, 1);
  }
  return options;
}

function getDimOptionsBySelectionScope(selectionScope, options, removeOption) {
  if (selectionScope === 0) {
    const index = findOptionIndex(options, removeOption);
    options.splice(index, 1);
  }
  return options;
}

function getSelectionOptionsByDimScope(dimensionalScope, options, removeOption) {
  if (dimensionalScope === 1) {
    const index = findOptionIndex(options, removeOption);
    options.splice(index, 1);
  }
  return options;
}

function getDimensionalOptions(itemData, handler, translationKeys, rootPath) {
  const numberOfDim = handler.layout.qHyperCube.qDimensionInfo.length;
  let options = [
    {
      value: SCOPE.DIMENSION.ONE_DIMENSION,
      translation: translationKeys.dimensionalScopeOneDimension || `properties.modifier.dimensionalScope.${numberOfDim === 2 ? 'respectOneDimension' : 'respectDimension'}`,
      tooltipTranslation: translationKeys.dimensionalScopeOneDimensionTooltip || `properties.modifier.dimensionalScope.${numberOfDim === 2 ? 'respectOneDimension' : 'respectDimension'}.tooltip`,
    },
    {
      value: SCOPE.DIMENSION.ALL_DIMENSIOANS,
      translation: translationKeys.dimensionalScopeAllDimensions || 'properties.modifier.dimensionalScope.respectAllDimensions',
      tooltipTranslation: translationKeys.dimensionalScopeAllDimensionsTooltip || 'properties.modifier.dimensionalScope.respectAllDimensions.tooltip',
    },
    {
      value: SCOPE.DIMENSION.DISREGARD_ALL_DIMENSIONS,
      translation: translationKeys.dimensionalScopeDisregardAllDimensions || `properties.modifier.dimensionalScope.${numberOfDim === 2 ? 'disregardAllDimensions' : 'disregardDimension'}`,
      tooltipTranslation: translationKeys.dimensionalScopeDisregardAllDimensionsTooltip || `properties.modifier.dimensionalScope.${numberOfDim === 2 ? 'disregardAllDimensions' : 'disregardDimension'}.tooltip`,
    },
  ];
  options = getDimOptionsByNumOfDim(numberOfDim, options, 0);

  const { selectionScope } = getModifier(itemData, rootPath);
  options = getDimOptionsBySelectionScope(selectionScope, options, 1);

  return options;
}

function getSelectionOptions(itemData, translationKeys, rootPath) {
  let options = [
    {
      value: SCOPE.SELECTION.CURRENT_SELECTION,
      translation: translationKeys.selectionScopeCurrentSelection || 'properties.modifier.selectionScope.currentSelection',
    },
    {
      value: SCOPE.SELECTION.SELECT_FIELD_VALUE,
      translation: translationKeys.selectionScopeSpecificValue || 'properties.modifier.selectionScope.selectAField',
    },
    {
      value: SCOPE.SELECTION.DISREGARD_SELECTION,
      translation: translationKeys.selectionScopeTotal || 'properties.modifier.selectionScope.total',
    },
  ];
  const { dimensionalScope } = getModifier(itemData, rootPath);
  options = getSelectionOptionsByDimScope(dimensionalScope, options, 0);

  return options;
}

export default function (rootPath, translationKeys = {}) {
  const modifierProperties = {
    type: 'items',
    items: {
      disclaimer: {
        component: 'text',
        translation: translationKeys.disclaimer || 'properties.modifier.normalization.disclaimer',
        show(itemData, handler) {
          return !helper.isApplicable({ properties: handler.properties });
        },
      },
      settings: {
        type: 'items',
        items: {
          selectionScope: {
            refFn: data => `${getRef(data, rootPath)}.selectionScope`,
            type: 'string',
            translation: translationKeys.modifierSelectionScope || 'properties.modifier.selectionScope',
            title: {
              translation: translationKeys.modifierSelectionScopeTooltip || 'properties.modifier.selectionScope.tooltip',
            },
            component: 'dropdown',
            schemaIgnore: true,
            defaultValue: SCOPE.SELECTION.DISREGARD_SELECTION,
            options(itemData) {
              return getSelectionOptions(itemData, translationKeys, rootPath);
            },
          },
          field: {
            refFn: data => `${getRef(data, rootPath)}.field`,
            type: 'string',
            component: 'expression-with-dropdown',
            translation: 'Common.Field',
            defaultValue: '',
            dropdownOnly: true,
            options: (action, hyperCubeHandler, args) => args.app.getFieldList().then(fields => fields.map(field => ({
              label: field.qName,
              value: field.qName,
            }))),
            show(itemData) {
              const modifier = getModifier(itemData, rootPath);
              return modifier.selectionScope === SCOPE.SELECTION.SELECT_FIELD_VALUE;
            },
          },
          value: {
            refFn: data => `${getRef(data, rootPath)}.value`,
            type: 'string',
            ref: 'value',
            component: 'string',
            translation: 'properties.value',
            expression: 'optional',
            show(itemData) {
              const modifier = getModifier(itemData, rootPath);
              return modifier.selectionScope === SCOPE.SELECTION.SELECT_FIELD_VALUE;
            },
          },
          dimensionalScope: {
            refFn: data => `${getRef(data, rootPath)}.dimensionalScope`,
            type: 'string',
            translation: translationKeys.modifierDimensionalScope || 'properties.modifier.dimensionalScope',
            title: {
              translation: translationKeys.modifierDimensionalScopeTooltip || 'properties.modifier.dimensionalScope.tooltip',
            },
            component: 'dropdown',
            schemaIgnore: true,
            defaultValue: SCOPE.DIMENSION.DISREGARD_ALL_DIMENSIONS,
            options(itemData, handler) {
              return getDimensionalOptions(itemData, handler, translationKeys, rootPath);
            },
          },
          primaryDimension: {
            refFn: data => `${getRef(data, rootPath)}.primaryDimension`,
            type: 'integer',
            translation: translationKeys.primaryDimension || 'properties.modifier.primaryDimension',
            title: {
              translation:
              translationKeys.primaryDimensionTooltip || 'properties.modifier.normalization.primaryDimension.tooltip',
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
              const modifier = getModifier(itemData, rootPath);
              return (modifier.dimensionalScope || 0) === SCOPE.DIMENSION.ONE_DIMENSION && handler.layout.qHyperCube.qDimensionInfo.length > 1;
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
