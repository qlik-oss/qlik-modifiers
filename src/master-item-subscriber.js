import measureBase from './base';
import measureBaseAdapter from './base-adapter';

export default function MasterItemSubscriber({ model, callback }) {
  let subscriptions = {};
  let effectiveMeasureLibraryIds = {};
  let effectiveDimensionLibraryIds = {};

  function onMasterItemChange(itemLayout) {
    const { qId } = itemLayout.qInfo;
    if (subscriptions[qId]) {
      if (typeof callback === 'function' && subscriptions[qId].enabled) {
        callback();
      }
      subscriptions[qId].enabled = true;
    }
  }

  function setEffectiveLibraryIds(properties) {
    effectiveMeasureLibraryIds = {};
    properties.qHyperCubeDef.qMeasures.forEach((measure) => {
      if (measureBase.isValid(measure) && measureBaseAdapter.getLibraryId(measure)) {
        effectiveMeasureLibraryIds[measureBaseAdapter.getLibraryId(measure)] = true;
      }
    });
    effectiveDimensionLibraryIds = {};
    properties.qHyperCubeDef.qDimensions.forEach((dimension) => {
      if (dimension.qLibraryId) {
        effectiveDimensionLibraryIds[dimension.qLibraryId] = true;
      }
    });
  }

  function unsubscribeUnusedIds() {
    Object.keys(subscriptions).forEach((libraryId) => {
      if (!effectiveMeasureLibraryIds[libraryId]) {
        subscriptions[libraryId].listener.dispose();
        delete subscriptions[libraryId];
      }
    });
  }

  function subscribeMeasureLibraryId(libraryId) {
    return model.app.getMeasure(libraryId).then(() => {
      subscriptions[libraryId] = {
        listener: model.layoutSubscribe(onMasterItemChange),
        enabled: false,
      };
    });
  }

  function subscribeDimensionLibraryId(libraryId) {
    return model.app.getDimension(libraryId).then(() => {
      subscriptions[libraryId] = {
        listener: model.layoutSubscribe(onMasterItemChange),
        enabled: false,
      };
    });
  }

  return {
    subscribe(properties) {
      const dfds = [];

      setEffectiveLibraryIds(properties);
      unsubscribeUnusedIds();

      if (model.app) {
        Object.keys(effectiveMeasureLibraryIds).forEach((libraryId) => {
          if (effectiveMeasureLibraryIds[libraryId] && !subscriptions[libraryId]) {
            dfds.push(subscribeMeasureLibraryId(libraryId));
          }
        });
        Object.keys(effectiveDimensionLibraryIds).forEach((libraryId) => {
          if (effectiveDimensionLibraryIds[libraryId] && !subscriptions[libraryId]) {
            dfds.push(subscribeDimensionLibraryId(libraryId));
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
