import util from '../utils/util';

export default function (rootPath) {
  const accumulationProperties = {
    accumulationMessage: {
      component: 'text',
      translation: 'properties.modifier.accumulation.disclaimer',
      show(itemData, handler) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled && handler.maxDimensions() > 2;
      },
    },
    accumulationDimension: {
      ref: `${rootPath}.accumulationDimension`,
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
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled && handler.layout.qHyperCube.qDimensionInfo.length > 1;
      },
    },
    crossAllDimensions: {
      ref: `${rootPath}.crossAllDimensions`,
      type: 'boolean',
      translation: 'properties.modifier.accumulation.crossAllDimensions',
      title: {
        translation: 'properties.modifier.accumulation.crossAllDimensions.tooltip',
      },
      schemaIgnore: true,
      defaultValue: false,
      show(itemData, handler) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled && handler.layout.qHyperCube.qDimensionInfo.length > 1;
      },
    },

    fullAccumulation: {
      ref: `${rootPath}.fullAccumulation`,
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
      show(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled;
      },
    },
    steps: {
      ref: `${rootPath}.steps`,
      type: 'integer',
      translation: 'properties.modifier.accumulation.steps',
      schemaIgnore: true,
      defaultValue: 6,
      change(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        const { steps } = modifier;
        modifier.steps = typeof steps === 'number' && !Number.isNaN(steps) ? Math.abs(steps) : 6;
      },
      show(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled && !modifier.fullAccumulation;
      },
    },
    showExcludedValues: {
      ref: `${rootPath}.showExcludedValues`,
      type: 'boolean',
      translation: 'properties.modifier.accumulation.showExcludedValues',
      schemaIgnore: true,
      defaultValue: true,
      show(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled;
      },
    },
  };

  return accumulationProperties;
}
