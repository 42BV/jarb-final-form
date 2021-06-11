import React from 'react';
import { shallow } from 'enzyme';
import { Field } from 'react-final-form';
import { FieldValidator } from 'final-form';

import { configureConstraint } from '../src/config';
import { setConstraints } from '../src/constraints';
import { JarbField } from '../src/JarbField';
import * as validators from '../src/validators';
import { Constraints } from '../src/models';

describe('Component: JarbField', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  function setup(constraints?: Constraints): void {
    jest
      .spyOn(validators, 'makeRequired')
      .mockImplementation(() => () => 'required');
    jest
      .spyOn(validators, 'makeBooleanRequired')
      .mockImplementation(() => () => 'booleanRequired');
    jest
      .spyOn(validators, 'makeMinimumLength')
      .mockImplementation(() => () => 'minimumLength');
    jest
      .spyOn(validators, 'makeMaximumLength')
      .mockImplementation(() => () => 'maximumLength');
    jest
      .spyOn(validators, 'makeMinValue')
      .mockImplementation(() => () => 'minValue');
    jest
      .spyOn(validators, 'makeMaxValue')
      .mockImplementation(() => () => 'maxValue');
    jest
      .spyOn(validators, 'makeNumber')
      .mockImplementation(() => () => 'number');

    jest
      .spyOn(validators, 'makeNumberFraction')
      .mockImplementation(() => () => 'numberFractions');

    configureConstraint({
      constraintsUrl: '/api/constraints',
      needsAuthentication: true
    });

    setConstraints(constraints);
  }

  describe('the validators prop', () => {
    it('should when validators are provided by the user include them in the validation', async () => {
      expect.assertions(1);

      setup(filledConstraints());

      // Should work with FieldValidators which return a Promise
      const isBatman: FieldValidator<string> = (value) =>
        value !== 'Batman'
          ? Promise.resolve('Not Batman')
          : Promise.resolve(undefined);

      // Should work with FieldValidators which do not return a promise
      const isRobin: FieldValidator<string> = (value) =>
        value !== 'Robin' ? 'Not Robin' : Promise.resolve(undefined);

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          validators={[isBatman, isRobin]}
          component="input"
        />
      );

      const { validate } = jarbField.find(Field).props();
      if (validate) {
        const errors = await validate('H', {});

        expect(errors).toEqual([
          'Not Batman',
          'Not Robin',
          'required',
          'minimumLength',
          'maximumLength'
        ]);
      }
    });

    it('should when no custom validators are defined pass along undefined to Field ', () => {
      expect.assertions(1);

      setup({});

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          component="input"
        />
      );

      const { validate } = jarbField.find(Field).props();
      expect(validate).toBe(undefined);
    });

    it('should when empty validators are defined pass along undefined to Field ', () => {
      expect.assertions(1);

      setup({});

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          validators={[]}
          component="input"
        />
      );

      const { validate } = jarbField.find(Field).props();
      expect(validate).toBe(undefined);
    });
  });

  describe('situations when validation is not applied', () => {
    it('should when the constraints are empty warn the user', () => {
      expect.assertions(5);

      setup(undefined);

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          component="input"
        />
      );

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Name');
      expect(validate).toBe(undefined);
      expect(component).toBe('input');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        '@42.nl/jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
      );
    });

    it('should when there are no FieldConstraints warn the user', () => {
      expect.assertions(5);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="FavoriteFood"
          jarb={{ validator: 'Hero.favoriteFood', label: 'Name' }}
          validators={[]}
          component="input"
        />
      );

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('FavoriteFood');
      expect(validate).toEqual(undefined);
      expect(component).toBe('input');

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        '@42.nl/jarb-final-form: constraints for "Hero.favoriteFood" not found, but a JarbField was rendered, this should not occur, check your validator.'
      );
    });
  });

  describe('adding jarb validators', () => {
    test('string which is required, and has minimumLength and maximumLength', async () => {
      expect.assertions(9);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          component="input"
        />
      );

      // Trigger the render again to check if it re-uses the validators correctly.
      jarbField.setState({});

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Name');
      expect(component).toBe('input');

      expect(validators.makeRequired).toHaveBeenCalledTimes(1);
      expect(validators.makeRequired).toHaveBeenCalledWith('Name');

      expect(validators.makeMinimumLength).toHaveBeenCalledTimes(1);
      expect(validators.makeMinimumLength).toHaveBeenCalledWith('Name', 3);

      expect(validators.makeMaximumLength).toHaveBeenCalledTimes(1);
      expect(validators.makeMaximumLength).toHaveBeenCalledWith('Name', 255);

      if (validate) {
        const errors = await validate('Superman', {});

        expect(errors).toEqual(['required', 'minimumLength', 'maximumLength']);
      }
    });

    test('string without minimumLength and maximumLength', () => {
      expect.assertions(6);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="Description"
          jarb={{ validator: 'Hero.description', label: 'Description' }}
          component="input"
        />
      );

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Description');
      expect(validate).toEqual(undefined);
      expect(component).toBe('input');

      expect(validators.makeRequired).toHaveBeenCalledTimes(0);
      expect(validators.makeMinimumLength).toHaveBeenCalledTimes(0);
      expect(validators.makeMaximumLength).toHaveBeenCalledTimes(0);
    });

    test('number with a min and max value', async () => {
      expect.assertions(9);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="Age"
          jarb={{ validator: 'Hero.age', label: 'Age' }}
          component="input"
        />
      );

      // Trigger the render again to check if it re-uses the validators correctly.
      jarbField.setState({});

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Age');
      expect(component).toEqual('input');

      expect(validators.makeMinValue).toHaveBeenCalledTimes(1);
      expect(validators.makeMinValue).toHaveBeenCalledWith('Age', 16);

      expect(validators.makeMaxValue).toHaveBeenCalledTimes(1);
      expect(validators.makeMaxValue).toHaveBeenCalledWith('Age', 99);

      expect(validators.makeNumber).toHaveBeenCalledTimes(1);
      expect(validators.makeNumber).toHaveBeenCalledWith('Age');

      if (validate) {
        const errors = await validate('Superman', {});

        expect(errors).toEqual(['minValue', 'maxValue', 'number']);
      }
    });

    test('number with a fraction', async () => {
      expect.assertions(5);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="Salary"
          jarb={{ validator: 'Hero.salary', label: 'Salary' }}
          component="input"
        />
      );

      // Trigger the render again to check if it re-uses the validators correctly.
      jarbField.setState({});

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Salary');
      expect(component).toBe('input');

      expect(validators.makeNumberFraction).toHaveBeenCalledTimes(1);
      expect(validators.makeNumberFraction).toHaveBeenCalledWith('Salary', 4);

      if (validate) {
        const errors = await validate('Superman', {});

        expect(errors).toEqual(['numberFractions']);
      }
    });

    test('boolean which is required', async () => {
      expect.assertions(5);

      setup(filledConstraints());

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.partOfHeroAssociation', label: 'Name' }}
          component="input"
        />
      );

      // Trigger the render again to check if it re-uses the validators correctly.
      jarbField.setState({});

      const { name, validate, component } = jarbField.find(Field).props();
      expect(name).toBe('Name');
      expect(component).toBe('input');

      expect(validators.makeBooleanRequired).toHaveBeenCalledTimes(1);
      expect(validators.makeBooleanRequired).toHaveBeenCalledWith('Name');
      if (validate) {
        const errors = await validate('Superman', {});

        expect(errors).toEqual(['booleanRequired']);
      }
    });
  });

  describe('enhancedValidate', () => {
    let validate: FieldValidator<number>;
    let isNumber8Spy: jest.Mock;

    function setupEnhancedValidate({
      asyncValidatorsDebounce
    }: {
      asyncValidatorsDebounce?: number;
    }) {
      setup({});

      const isNumber8: FieldValidator<number> = async (value) => {
        return new Promise((resolve) => {
          setTimeout(
            () => resolve(value === 8 ? undefined : 'Value is not 8'),
            100
          );
        });
      };

      isNumber8Spy = jest.fn(isNumber8);

      const isEven: FieldValidator<number> = (value) =>
        value % 2 === 0 ? undefined : 'Not even';

      const isSmallerThan10: FieldValidator<number> = (value) =>
        value < 10 ? undefined : 'Bigger than 10';

      const jarbField = shallow(
        <JarbField
          name="Name"
          jarb={{ validator: 'Hero.name', label: 'Name' }}
          validators={[isEven, isSmallerThan10]}
          asyncValidators={[isNumber8Spy]}
          asyncValidatorsDebounce={asyncValidatorsDebounce}
          component="input"
        />
      );

      const props = jarbField.find(Field).props();

      validate = props.validate as FieldValidator<number>;
    }

    it('should filter out results which return undefined so only errors remain', async () => {
      expect.assertions(1);

      setupEnhancedValidate({});

      if (validate) {
        const errors = await validate(12, {});
        expect(errors).toEqual(['Bigger than 10']);
      }
    });

    it('should when there are no errors perform async validations', async () => {
      expect.assertions(1);

      setupEnhancedValidate({});

      if (validate) {
        // @ts-expect-error Mock fieldstate
        const errors = await validate(2, {}, { name: 'Name' });

        expect(errors).toEqual(['Value is not 8']);
      }
    });

    it('should return undefined when both async and sync validation have no errors', async () => {
      expect.assertions(1);

      setupEnhancedValidate({});

      if (validate) {
        // @ts-expect-error Mock fieldstate
        const errors = await validate(8, {}, { name: 'Name' });
        expect(errors).toEqual(undefined);
      }
    });

    it('should debounce with 200 milliseconds by default', (done) => {
      expect.assertions(3);

      setupEnhancedValidate({});

      if (validate) {
        // @ts-expect-error Mock fieldstate
        validate(2, {}, { name: 'Name' });

        setTimeout(() => {
          expect(isNumber8Spy).toBeCalledTimes(0);
        }, 10);

        setTimeout(() => {
          expect(isNumber8Spy).toBeCalledTimes(0);
        }, 199);

        setTimeout(() => {
          expect(isNumber8Spy).toBeCalledTimes(1);
          done();
        }, 215);
        // ideally we would set this on 201, but we have to wait for the async validation
        // timeout which is started after a non-async validation promise is resolved
      }
    });

    it('should accept a custom debounce', (done) => {
      expect.assertions(3);

      setupEnhancedValidate({ asyncValidatorsDebounce: 300 });

      if (validate) {
        // @ts-expect-error Mock fieldstate
        validate(2, {}, { name: 'Name' });

        expect(isNumber8Spy).toBeCalledTimes(0);

        setTimeout(() => {
          expect(isNumber8Spy).toBeCalledTimes(0);
        }, 299);

        setTimeout(() => {
          expect(isNumber8Spy).toBeCalledTimes(1);
          done();
        }, 315);
        // ideally we would set this on 301, but we have to wait for the async validation
        // timeout which is started after a non-async validation promise is resolved
      }
    });

    it('should when two async validations happen after each other cancel the first one', async () => {
      expect.assertions(1);

      setupEnhancedValidate({});

      const validatePromises = [];

      if (validate) {
        // @ts-expect-error Mock fieldstate
        validatePromises.push(validate(2, {}, { name: 'Name' }));
        // @ts-expect-error Mock fieldstate
        validatePromises.push(validate(2, {}, { name: 'Name' }));

        await Promise.all(validatePromises);

        expect(isNumber8Spy).toBeCalledTimes(1);
      }
    });

    it('should when two async validations happen after each and they both get called it should ignore the results from the first one', (done) => {
      expect.assertions(3);

      setupEnhancedValidate({});

      if (validate) {
        // Perform the initial call which should get ignored.

        // @ts-expect-error Mock fieldstate
        const first = validate(2, {}, { name: 'Name' });

        // Perform the second call after the debounce period, this
        // should make it ignore the first result.

        let second: Promise<unknown>;

        setTimeout(() => {
          // @ts-expect-error Mock fieldstate
          second = validate(4, {}, { name: 'Name' });
        }, 250);

        setTimeout(() => {
          // They both should get called.
          expect(isNumber8Spy).toBeCalledTimes(2);

          Promise.all([first, second]).then(([firstResult, secondResult]) => {
            // This call should not pass the identity check
            expect(firstResult).toBe(undefined);

            // This error does exists.
            expect(secondResult).toEqual(['Value is not 8']);

            done();
          });
        }, 1000);
      }
    });
  });
});

function filledConstraints(): Constraints {
  return {
    Hero: {
      name: {
        javaType: 'java.lang.String',
        types: ['text'],
        required: true,
        minimumLength: 3,
        maximumLength: 255,
        fractionLength: null,
        radix: null,
        pattern: null,
        min: null,
        max: null,
        name: 'name'
      },
      description: {
        javaType: 'java.lang.String',
        types: ['text'],
        required: false,
        minimumLength: null,
        maximumLength: null,
        fractionLength: null,
        radix: null,
        pattern: null,
        min: null,
        max: null,
        name: 'description'
      },
      age: {
        javaType: 'java.lang.Integer',
        types: ['number'],
        required: null,
        minimumLength: null,
        maximumLength: null,
        fractionLength: null,
        radix: null,
        pattern: null,
        min: 16,
        max: 99,
        name: 'age'
      },
      salary: {
        javaType: 'java.lang.Integer',
        types: ['number'],
        required: null,
        minimumLength: null,
        maximumLength: null,
        fractionLength: 4,
        radix: null,
        pattern: null,
        min: null,
        max: null,
        name: 'salary'
      },
      partOfHeroAssociation: {
        javaType: 'boolean',
        types: ['boolean'],
        required: true,
        minimumLength: null,
        maximumLength: null,
        fractionLength: null,
        radix: null,
        pattern: null,
        min: null,
        max: null,
        name: 'partOfHeroAssociation'
      }
    }
  };
}
