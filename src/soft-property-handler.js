import extend from 'extend';
import JSONPatch from './utils/json-patch';

const softPropertyHandler = {
  saveSoftProperties(model, prevEffectiveProperties, effectiveProperties) {
    if (!model) {
      return Promise.resolve(false);
    }

    let patches = JSONPatch.generate(model, prevEffectiveProperties, effectiveProperties);
    extend(true, prevEffectiveProperties, effectiveProperties);

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
};

export default softPropertyHandler;
