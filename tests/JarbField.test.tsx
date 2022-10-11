import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FieldValidator } from 'final-form';
import { Form } from 'react-final-form';

import { configureConstraint } from '../src/config';
import { setConstraints } from '../src/constraints';
import { JarbField, JarbProps } from '../src/JarbField';
import * as validators from '../src/validators';
import { Constraints } from '../src/models';
import { defaultFractionNumberRegex } from '../lib/regex';

describe('Component: JarbField', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  function setup({
    constraints,
    jarb,
    fieldValidators
  }: {
    constraints?: Constraints;
    jarb: JarbProps;
    fieldValidators?: FieldValidator<string>[];
  }) {
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
      constraintsUrl: '/api/constraints'
    });

    setConstraints(constraints);

    const renderSpy = jest
      .fn()
      .mockImplementation(({ input, meta: { error } }) => (
        <div>
          <input {...input} />
          <div data-testid="errors">{error && error.join(', ')}</div>
        </div>
      ));

    render(
      <Form onSubmit={jest.fn()}>
        {() => (
          <JarbField name="Name" jarb={jarb} validators={fieldValidators}>
            {renderSpy}
          </JarbField>
        )}
      </Form>
    );

    return { renderSpy };
  }

  describe('the validators prop', () => {
    it('should include all validators when validators are provided by the user', async () => {
      expect.assertions(0);

      // Should work with FieldValidators which return a Promise
      const isBatman: FieldValidator<string> = (value) =>
        value !== 'Batman'
          ? Promise.resolve('Not Batman')
          : Promise.resolve(undefined);

      // Should work with FieldValidators which do not return a promise
      const isRobin: FieldValidator<string> = (value) =>
        value !== 'Robin' ? 'Not Robin' : Promise.resolve(undefined);

      setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.name', label: 'Name' },
        fieldValidators: [isBatman, isRobin]
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' }
      });

      await screen.findAllByText(
        'Not Batman, Not Robin, required, minimumLength, maximumLength, required, minimumLength, maximumLength'
      );
    });

    it('should render without errors when no custom validators are defined', async () => {
      expect.assertions(3);

      const { renderSpy } = setup({
        jarb: { validator: 'Hero.name', label: 'Name' }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' }
      });

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(4);
      });

      expect(screen.getByTestId('errors').innerText).toBeUndefined();
    });

    it('should render without errors when empty array is passed as validators', async () => {
      expect.assertions(3);

      const { renderSpy } = setup({
        jarb: { validator: 'Hero.name', label: 'Name' },
        fieldValidators: []
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' }
      });

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(4);
      });

      expect(screen.getByTestId('errors').innerText).toBeUndefined();
    });
  });

  describe('situations when validation is not applied', () => {
    it('should warn the user when the constraints are empty', async () => {
      expect.assertions(4);

      const { renderSpy } = setup({
        jarb: { validator: 'Hero.name', label: 'Name' }
      });

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(3);
      });

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenLastCalledWith(
        '@42.nl/jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
      );
    });

    it('should warn the user when there are no FieldConstraints', async () => {
      expect.assertions(4);

      const { renderSpy } = setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.favoriteFood', label: 'Name' }
      });

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(3);
      });

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenLastCalledWith(
        '@42.nl/jarb-final-form: constraints for "Hero.favoriteFood" not found, but a JarbField was rendered, this should not occur, check your validator.'
      );
    });
  });

  describe('adding jarb validators', () => {
    test('string which is required, and has minimumLength and maximumLength', async () => {
      expect.assertions(6);

      setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.name', label: 'Name' }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' }
      });

      await screen.findAllByText('required, minimumLength, maximumLength');

      expect(validators.makeRequired).toHaveBeenCalled();
      expect(validators.makeRequired).toHaveBeenLastCalledWith('Name');

      expect(validators.makeMinimumLength).toHaveBeenCalled();
      expect(validators.makeMinimumLength).toHaveBeenLastCalledWith('Name', 3);

      expect(validators.makeMaximumLength).toHaveBeenCalled();
      expect(validators.makeMaximumLength).toHaveBeenLastCalledWith(
        'Name',
        255
      );
    });

    test('string without minimumLength and maximumLength', async () => {
      expect.assertions(5);

      const { renderSpy } = setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.description', label: 'Description' }
      });

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(3);
      });

      expect(validators.makeRequired).toHaveBeenCalledTimes(0);
      expect(validators.makeMinimumLength).toHaveBeenCalledTimes(0);
      expect(validators.makeMaximumLength).toHaveBeenCalledTimes(0);
    });

    test('number with a min and max value', async () => {
      expect.assertions(6);

      setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.age', label: 'Age' }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '4' }
      });

      await screen.findAllByText('minValue, maxValue, number');

      expect(validators.makeMinValue).toHaveBeenCalled();
      expect(validators.makeMinValue).toHaveBeenLastCalledWith('Age', 16);
      expect(validators.makeMaxValue).toHaveBeenCalled();
      expect(validators.makeMaxValue).toHaveBeenLastCalledWith('Age', 99);
      expect(validators.makeNumber).toHaveBeenCalled();
      expect(validators.makeNumber).toHaveBeenLastCalledWith('Age');
    });

    test('number with a fraction (default pattern)', async () => {
      expect.assertions(2);

      setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.salary', label: 'Salary' }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'abc' }
      });

      await screen.findAllByText('numberFractions');

      expect(validators.makeNumberFraction).toHaveBeenCalled();
      expect(validators.makeNumberFraction).toHaveBeenLastCalledWith(
        'Salary',
        4,
        defaultFractionNumberRegex
      );
    });

    test('number with a fraction (custom pattern)', async () => {
      expect.assertions(2);

      const func = (fractionLength: number) =>
        new RegExp('^-?([\\d.]+,\\d{1,' + fractionLength + '}|\\d+)$');

      setup({
        constraints: filledConstraints(),
        jarb: {
          validator: 'Hero.salary',
          label: 'Salary',
          fractionalNumberRegex: func
        }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'abc' }
      });

      await screen.findAllByText('numberFractions');

      expect(validators.makeNumberFraction).toHaveBeenCalled();
      expect(validators.makeNumberFraction).toHaveBeenLastCalledWith(
        'Salary',
        4,
        func
      );
    });

    test('boolean which is required', async () => {
      expect.assertions(2);

      setup({
        constraints: filledConstraints(),
        jarb: { validator: 'Hero.partOfHeroAssociation', label: 'Name' }
      });

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Superman' }
      });

      await screen.findAllByText('booleanRequired');

      expect(validators.makeBooleanRequired).toHaveBeenCalled();
      expect(validators.makeBooleanRequired).toHaveBeenLastCalledWith('Name');
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
