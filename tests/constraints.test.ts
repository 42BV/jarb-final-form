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
    test('200 with authentication', async done => {
      setup({ needsAuthentication: true });

      fetchMock.get(
        '/api/constraints',
        { fake: 'constraints' },
        {
          // @ts-ignore
          credentials: 'include'
        }
      );

      await loadConstraints();

      expect(getConstraints()).toEqual({
        fake: 'constraints'
      });

      done();
    });

    test('200 without authentication', async done => {
      setup({ needsAuthentication: false });

      fetchMock.get('/api/constraints', { fake: 'constraints' }, {});

      await loadConstraints();

      expect(getConstraints()).toEqual({
        fake: 'constraints'
      });

      done();
    });

    test('500', async done => {
      setup({ needsAuthentication: false });

      fetchMock.get('/api/constraints', 500);

      try {
        await loadConstraints();
        done.fail();
      } catch (response) {
        expect(getConstraints()).toEqual(undefined);
        done();
      }
    });
  });
});
