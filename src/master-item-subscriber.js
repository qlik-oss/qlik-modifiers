import util from './utils/util';

export default function MasterItemSubscriber({ model, callback }) {
  let subscriptions = {};
  let effectiveMeasureLibraryIds = {};
  let effectiveDimensionLibraryIds = {};
  const mainProperties = {
    dimension: ['qDim.qFieldDefs'],
    measure: ['qMeasure.qDef', 'qMeasure.qLabel', 'qMeasure.qLabelExpression', 'qMeasure.coloring', 'qMeasure.qNumFormat', 'qMeasure.isCustomFormatted'],
  };

  function getPropertiesString(layout) {
    const properties = {};
    const type = util.getValue(layout, 'qInfo.qType');
    if (type && mainProperties[type]) {
      mainProperties[type].forEach((item) => {
        properties[item] = util.getValue(layout, item);
      });
    }
    return JSON.stringify(properties);
  }

  function onMasterItemChange(itemLayout) {
    const { qId } = itemLayout.qInfo;
    if (subscriptions[qId]) {
      const properties = getPropertiesString(itemLayout);
      if (subscriptions[qId].properties !== properties) {
        subscriptions[qId].properties = properties;
        if (typeof callback === 'function' && subscriptions[qId].enabled) {
          callback(itemLayout);
        }
      }
      subscriptions[qId].enabled = true;
    }
  }

  function setEffectiveLibraryIds({ measureLibraryIds, dimensionLibraryIds }) {
    effectiveMeasureLibraryIds = {};
    measureLibraryIds.forEach((libraryId) => {
      effectiveMeasureLibraryIds[libraryId] = true;
    });
    effectiveDimensionLibraryIds = {};
    dimensionLibraryIds.forEach((libraryId) => {
      effectiveDimensionLibraryIds[libraryId] = true;
    });
  }

  function unsubscribeUnusedIds() {
    Object.keys(subscriptions).forEach((libraryId) => {
      if (!effectiveMeasureLibraryIds[libraryId] && !effectiveDimensionLibraryIds[libraryId]) {
        subscriptions[libraryId].listener.dispose();
        delete subscriptions[libraryId];
      }
    });
  }

  function subscribeLibraryId(libraryId, methodName) {
    return model.app[methodName](libraryId).then((itemModel) => {
      subscriptions[libraryId] = {
        listener: itemModel.layoutSubscribe(onMasterItemChange),
        enabled: false,
        properties: getPropertiesString(itemModel.layout),
      };
    });
  }

  return {
    subscribe({ measureLibraryIds, dimensionLibraryIds }) {
      const dfds = [];

      setEffectiveLibraryIds({ measureLibraryIds, dimensionLibraryIds });
      unsubscribeUnusedIds();

      if (model.app) {
        Object.keys(effectiveMeasureLibraryIds).forEach((libraryId) => {
          if (effectiveMeasureLibraryIds[libraryId] && !subscriptions[libraryId]) {
            dfds.push(subscribeLibraryId(libraryId, 'getMeasure'));
          }
        });
        Object.keys(effectiveDimensionLibraryIds).forEach((libraryId) => {
          if (effectiveDimensionLibraryIds[libraryId] && !subscriptions[libraryId]) {
            dfds.push(subscribeLibraryId(libraryId, 'getDimension'));
          }
        });
      }

      return Promise.all(dfds);
    },

    unsubscribe() {
      Object.keys(subscriptions).forEach((libraryId) => {
        subscriptions[libraryId].listener.dispose();
      });
      subscriptions = {};
    },
  };
}
