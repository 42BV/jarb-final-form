import * as SpringConnect from '@42.nl/spring-connect';

import {
  loadConstraints,
  getConstraints,
  setConstraints
} from '../src/constraints';
import { configureConstraint } from '../src/config';

vi.mock('@42.nl/spring-connect');

describe('ConstraintsService', () => {
  function setup(): void {
    setConstraints(undefined);

    configureConstraint({
      constraintsUrl: '/api/constraints'
    });
  }

  describe('loadConstraints', () => {
    test('200', async () => {
      expect.assertions(1);

      setup();

      vi.spyOn(SpringConnect, 'get').mockResolvedValue({ fake: 'constraints' });

      await loadConstraints();

      expect(getConstraints()).toEqual({
        fake: 'constraints'
      });
    });

    test('500', async () => {
      setup();

      vi.spyOn(SpringConnect, 'get').mockRejectedValue('');

      await expect(loadConstraints()).rejects.toBe('');
      expect(getConstraints()).toEqual(undefined);
    });
  });
});
