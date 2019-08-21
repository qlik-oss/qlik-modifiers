import util from '../util';

export default function (rootPath) {
  const accumulationProperties = {
    accumulationDimension: {
      ref: `${rootPath}.accumulationDimension`,
      type: 'integer',
      translation: '$Accumulation on dimension',
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
    restartAfterAcumulationDimension: {
      ref: `${rootPath}.restartAfterAcumulationDimension`,
      type: 'boolean',
      translation: '$Restart accumulation after dimension',
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
      translation: '$Steps back',
      component: 'dropdown',
      schemaIgnore: true,
      defaultValue: false,
      options: [
        {
          value: true,
          translation: '$Full',
        },
        {
          value: false,
          translation: '$Custom',
        },
      ],
      show(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled;
      },
    },
    stepsBack: {
      ref: `${rootPath}.stepsBack`,
      type: 'integer',
      schemaIgnore: true,
      defaultValue: 0,
      show(itemData) {
        const modifier = util.getValue(itemData, rootPath);
        return modifier && !modifier.disabled && !modifier.fullAccumulation;
      },
    },
  };

  return accumulationProperties;
}
