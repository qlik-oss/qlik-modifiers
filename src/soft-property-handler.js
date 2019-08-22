import JSONPatch from './utils/json-patch';
import util from './utils/util';

const softPropertyHandler = {
  saveSoftProperties(model, prevEffectiveProperties, effectiveProperties) {
    if (!model) {
      return Promise.resolve(false);
    }

    let patches = JSONPatch.generate(model, prevEffectiveProperties, effectiveProperties);
    util.extend(true, prevEffectiveProperties, effectiveProperties);

    if (patches && patches.length) {
      patches = patches.map(p => ({
        qOp: p.op,
        qValue: JSON.stringify(p.value),
        qPath: p.path,
      }));

      return model.applyPatches(patches, true).then(() => true);
    }
    return Promise.resolve(false);
  },

  mergeSoftPatches(model) {
    if (!model) {
      return Promise.resolve();
    }

    return Promise.all({
      properties: model.getProperties(),
      effective: model.getEffectiveProperties(),
    }).then((args) => {
      if (args.properties.qExtendsId) {
        return;
      }
      const patches = JSONPatch.generate(args.properties, args.effective);
      JSONPatch.apply(args.properties, patches);
      model.setProperties(args.properties).then(() => {
        model.clearSoftPatches();
      });
    });
  },
};

export default softPropertyHandler;
