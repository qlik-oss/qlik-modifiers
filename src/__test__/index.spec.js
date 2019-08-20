import Modifiers from '../index';

describe('modifiers', () => {
  let modifiersInstance;

  beforeEach(() => {
    modifiersInstance = new Modifiers();
  });

  it('should return dummy when calling apply on modifiers instance', () => {
    expect(modifiersInstance.apply()).to.equal('dummy');
  });
});
