import fetchMock from 'fetch-mock';

import {
  loadConstraints,
  getConstraints,
  setConstraints
} from '../src/constraints';
import { configureConstraint } from '../src/config';

describe('ConstraintsService', () => {
  function setup({
    needsAuthentication
  }: {
    needsAuthentication: boolean;
  }): void {
    setConstraints(undefined);

    configureConstraint({
      constraintsUrl: '/api/constraints',
      needsAuthentication
    });
  }

  afterEach(() => {
    fetchMock.restore();
  });

  describe('loadConstraints', () => {
    test('200 with authentication', async () => {
      expect.assertions(1);

      setup({ needsAuthentication: true });

      fetchMock.get(
        '/api/constraints',
        { fake: 'constraints' },
        {
          // @ts-expect-error The "credentials" do actually exist
          credentials: 'include'
        }
      );

      await loadConstraints();

      expect(getConstraints()).toEqual({
        fake: 'constraints'
      });
    });

    test('200 without authentication', async () => {
      expect.assertions(1);

      setup({ needsAuthentication: false });

      fetchMock.get('/api/constraints', { fake: 'constraints' }, {});

      await loadConstraints();

      expect(getConstraints()).toEqual({
        fake: 'constraints'
      });
    });

    test('500', async () => {
      expect.assertions(1);

      setup({ needsAuthentication: false });

      fetchMock.get('/api/constraints', 500);

      try {
        await loadConstraints();
      } catch (response) {
        expect(getConstraints()).toEqual(undefined);
      }
    });
  });
});
