import React from 'react';
import { shallow } from 'enzyme';
import { Field } from 'react-final-form';

import { configureConstraint } from '../src/config';
import { setConstraints } from '../src/constraints';
import { JarbField } from '../src/JarbField';
import * as validators from '../src/validators';
import { Constraints } from '../src/models';
import { FieldValidator } from 'final-form';

describe('Component: JarbField', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
  });

  function setup(constraints?: Constraints): void {
    jest
      .spyOn(validators, 'makeRequired')
      .mockImplementation(() => () => 'required');
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

  describe('The validators prop', () => {
    it('should when validators are provided by the user include them in the validation', async done => {
      setup(filledConstraints());

      // Should work with FieldValidators which return a Promise
      const isBatman: FieldValidator<string> = value =>
        value !== 'Batman'
          ? Promise.resolve('Not Batman')
          : Promise.resolve(undefined);

      // Should work with FieldValidators which do not return a promise
      const isRobin: FieldValidator<string> = value =>
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
        try {
          const errors = await validate('H', {});

          expect(errors).toEqual([
            'Not Batman',
            'Not Robin',
            'required',
            'minimumLength',
            'maximumLength'
          ]);
          done();
        } catch (error) {
          done.fail(error);
        }
      } else {
        done.fail();
      }
    });

    it('should when no custom validators are defined pass along undefined to Field ', () => {
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
        'jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
      );
    });

    it('should when there are no FieldConstraints warn the user', () => {
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
        'jarb-final-form: constraints for "Hero.favoriteFood" not found, but a JarbField was rendered, this should not occur, check your validator.'
      );
    });
  });

  describe('validators', () => {
    test('string which is required, and has minimumLength and maximumLength', async done => {
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
        try {
          const errors = await validate('Superman', {});

          expect(errors).toEqual([
            'required',
            'minimumLength',
            'maximumLength'
          ]);
          done();
        } catch (error) {
          done.fail(error);
        }
      } else {
        done.fail();
      }
    });

    test('string without minimumLength and maximumLength', () => {
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

    test('number with a min and max value', async done => {
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
        try {
          const errors = await validate('Superman', {});

          expect(errors).toEqual(['minValue', 'maxValue', 'number']);
          done();
        } catch (error) {
          done.fail(error);
        }
      } else {
        done.fail();
      }
    });

    test('number with a fraction', async done => {
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
        try {
          const errors = await validate('Superman', {});

          expect(errors).toEqual(['numberFractions']);
          done();
        } catch (error) {
          done.fail(error);
        }
      } else {
        done.fail();
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
      }
    }
  };
}
