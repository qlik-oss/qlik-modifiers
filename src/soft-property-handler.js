function DUMMYHANDLER(model) {
  // TODO: implement
  this.model = model;
}

DUMMYHANDLER.prototype.saveSoftProperties = (/* prevProperties, properties */) => Promise.resolve();

export default DUMMYHANDLER;
