import { Config, configureConstraint, getConfig } from '../src/config';

test('configuration lifecycle', () => {
  // When not initialized it should throw an error.
  expect(() => getConfig()).toThrow(
    'The constraint service is not initialized.'
  );

  // Next we initialize the config.
  const config: Config = {
    constraintsUrl: '/api/constraints',
    needsAuthentication: false
  };

  configureConstraint(config);

  // Now we expect the config to be set.
  expect(getConfig()).toBe(config);
});
