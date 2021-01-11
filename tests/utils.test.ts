import {
  mostSpecificInputTypeFor,
  getFieldConstraintsFor,
  isRequired,
  hasFractionLength,
  hasMaximumLength,
  hasMinimumLength,
  hasRadix,
  hasPattern,
  hasMin,
  hasMax,
  getFieldConstraints
} from '../src/utils';
import { Constraints } from '../src/models';
import { setConstraints } from '../src';

test('mostSpecificInputTypeFor', () => {
  expect(mostSpecificInputTypeFor(undefined)).toBe('text');
  expect(mostSpecificInputTypeFor(null)).toBe('text');

  expect(mostSpecificInputTypeFor([])).toBe('text');
  expect(
    mostSpecificInputTypeFor([
      'color',
      'datetime-local',
      'datetime',
      'month',
      'week',
      'date',
      'time',
      'email',
      'tel',
      'number',
      'url',
      'password',
      'file',
      'image',
      'text'
    ])
  ).toBe('color');
  expect(
    mostSpecificInputTypeFor([
      'text',
      'image',
      'file',
      'password',
      'url',
      'number',
      'tel',
      'email',
      'time',
      'date',
      'week',
      'month',
      'datetime',
      'datetime-local',
      'color'
    ])
  ).toBe('color');
  expect(mostSpecificInputTypeFor(['color', 'text'])).toBe('color');
});

const constraints: Constraints = {
  SuperHero: {
    name: {
      javaType: 'java.lang.String',
      types: ['text'],
      required: true,
      minimumLength: 4,
      maximumLength: 50,
      fractionLength: null,
      radix: null,
      pattern: null,
      min: null,
      max: null,
      name: 'name'
    },
    email: {
      javaType: 'java.lang.String',
      types: ['email', 'text'],
      required: true,
      minimumLength: null,
      maximumLength: 255,
      fractionLength: null,
      radix: null,
      pattern: '/^.+@.+..+$/',
      min: null,
      max: null,
      name: 'email'
    },
    'address.city': {
      javaType: 'java.lang.String',
      types: ['text'],
      required: false,
      minimumLength: null,
      maximumLength: null,
      fractionLength: 1337,
      radix: null,
      pattern: null,
      min: null,
      max: null,
      name: 'address.city'
    },
    test: {
      javaType: 'java.lang.Long',
      types: ['number'],
      required: false,
      minimumLength: null,
      maximumLength: null,
      fractionLength: null,
      radix: 20,
      pattern: null,
      min: 1,
      max: 50,
      name: 'test'
    }
  }
};

test('getFieldConstraintsFor', () => {
  expect(getFieldConstraintsFor('Villain.email', constraints)).toBe(false);
  expect(getFieldConstraintsFor('SuperHero.secrectIdentity', constraints)).toBe(
    false
  );

  expect(getFieldConstraintsFor('SuperHero.email', constraints)).toEqual({
    javaType: 'java.lang.String',
    types: ['email', 'text'],
    required: true,
    minimumLength: null,
    maximumLength: 255,
    fractionLength: null,
    radix: null,
    pattern: '/^.+@.+..+$/',
    min: null,
    max: null,
    name: 'email'
  });

  expect(getFieldConstraintsFor('SuperHero.address.city', constraints)).toEqual(
    {
      javaType: 'java.lang.String',
      types: ['text'],
      required: false,
      minimumLength: null,
      maximumLength: null,
      fractionLength: 1337,
      radix: null,
      pattern: null,
      min: null,
      max: null,
      name: 'address.city'
    }
  );
});

test('getFieldConstraints', () => {
  setConstraints(undefined);
  expect(getFieldConstraints('SuperHero.email')).toBe(false);
  expect(getFieldConstraints('SuperHero.secrectIdentity')).toBe(false);

  setConstraints(constraints);
  expect(getFieldConstraints('SuperHero.email')).toEqual({
    javaType: 'java.lang.String',
    types: ['email', 'text'],
    required: true,
    minimumLength: null,
    maximumLength: 255,
    fractionLength: null,
    radix: null,
    pattern: '/^.+@.+..+$/',
    min: null,
    max: null,
    name: 'email'
  });
  expect(getFieldConstraints('SuperHero.secrectIdentity')).toBe(false);
});

test('isRequired', () => {
  setConstraints(constraints);
  expect(isRequired('SuperHero.email')).toBe(true);
  expect(isRequired('SuperHero.secrectIdentity')).toBe(false);
  expect(isRequired('SuperHero.address.city')).toBe(false);
});

test('hasMinimumLength', () => {
  setConstraints(constraints);
  expect(hasMinimumLength('SuperHero.email')).toBe(false);
  expect(hasMinimumLength('SuperHero.secrectIdentity')).toBe(false);
  expect(hasMinimumLength('SuperHero.name')).toBe(true);
});

test('hasMaximumLength', () => {
  setConstraints(constraints);
  expect(hasMaximumLength('SuperHero.email')).toBe(true);
  expect(hasMaximumLength('SuperHero.secrectIdentity')).toBe(false);
  expect(hasMaximumLength('SuperHero.address.city')).toBe(false);
});

test('hasFractionLength', () => {
  setConstraints(constraints);
  expect(hasFractionLength('SuperHero.email')).toBe(false);
  expect(hasFractionLength('SuperHero.secrectIdentity')).toBe(false);
  expect(hasFractionLength('SuperHero.address.city')).toBe(true);
});

test('hasRadix', () => {
  setConstraints(constraints);
  expect(hasRadix('SuperHero.email')).toBe(false);
  expect(hasRadix('SuperHero.secrectIdentity')).toBe(false);
  expect(hasRadix('SuperHero.test')).toBe(true);
});

test('hasPattern', () => {
  setConstraints(constraints);
  expect(hasPattern('SuperHero.email')).toBe(true);
  expect(hasPattern('SuperHero.secrectIdentity')).toBe(false);
  expect(hasPattern('SuperHero.test')).toBe(false);
});

test('hasMin', () => {
  setConstraints(constraints);
  expect(hasMin('SuperHero.email')).toBe(false);
  expect(hasMin('SuperHero.secrectIdentity')).toBe(false);
  expect(hasMin('SuperHero.test')).toBe(true);
});

test('hasMax', () => {
  setConstraints(constraints);
  expect(hasMax('SuperHero.email')).toBe(false);
  expect(hasMax('SuperHero.secrectIdentity')).toBe(false);
  expect(hasMax('SuperHero.test')).toBe(true);
});
