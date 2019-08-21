const util = {
  /**
    * Sets a value in a data object using a dot notated reference to point out the path.
    *
    * Example:
    * If data is an empty object, reference is "my.value" and value the is "x", then
    * the resulting data object will be: { my: { value: "x" } }
    *
    * @param data The data object. Must be an object.
    * @param reference Reference to the value.
    * @param value Arbitrary value to set. If the value is set to undefined, the value property will be removed.
  */
  setValue: (data, reference, value) => {
    if (!reference) {
      return false;
    }
    const steps = reference.split('.');
    const dataName = steps[steps.length - 1];
    let dataContainer = data;
    let i;

    for (i = 0; i < steps.length - 1; ++i) {
      if (typeof dataContainer[steps[i]] === 'undefined') {
        dataContainer[steps[i]] = Number.isNaN(+steps[i + 1]) ? {} : [];
      }
      dataContainer = dataContainer[steps[i]];
    }

    if (typeof value !== 'undefined') {
      const previous = dataContainer[dataName];
      dataContainer[dataName] = value;
      return { updated: value, previous };
    }

    delete dataContainer[dataName];
    return false;
  },

  /**
    * Gets a value from a data object structure.
    *
    * @param data The data object.
    * @param reference Reference to the value.
    * @param defaultValue Default value to return if no value was found.
    * @returns {*} The default value if specified, otherwise undefined.
  */
  getValue: (data, reference, defaultValue) => {
    const steps = reference.split('.');
    let dataContainer = data;
    let i;
    if (dataContainer === undefined) {
      return defaultValue;
    }
    for (i = 0; i < steps.length; ++i) {
      if (typeof dataContainer[steps[i]] === 'undefined') {
        return defaultValue;
      }
      dataContainer = dataContainer[steps[i]];
    }
    return dataContainer;
  },
};
export default util;
