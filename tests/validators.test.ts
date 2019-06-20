import {
  makeRequired,
  makeMinValue,
  makeMaxValue,
  makeMinimumLength,
  makeMaximumLength,
  makeNumber,
  makeNumberFraction
} from '../src/validators';

test('required', () => {
  const validator = makeRequired('Name');

  expect(validator(undefined, {})).resolves.toEqual({
    type: 'ERROR_REQUIRED',
    label: 'Name',
    value: undefined,
    reasons: { required: 'required' }
  });

  expect(validator(null, {})).resolves.toEqual({
    type: 'ERROR_REQUIRED',
    label: 'Name',
    value: null,
    reasons: { required: 'required' }
  });

  expect(validator('', {})).resolves.toEqual({
    type: 'ERROR_REQUIRED',
    label: 'Name',
    value: '',
    reasons: { required: 'required' }
  });

  expect(validator('h', {})).resolves.toBe(undefined);
  expect(validator('henkie', {})).resolves.toBe(undefined);
});

test('minimumLength', () => {
  const validator = makeMinimumLength('Description', 3);

  expect(validator('', {})).resolves.toEqual({
    type: 'ERROR_MINIMUM_LENGTH',
    label: 'Description',
    value: '',
    reasons: { minimumLength: 3 }
  });
  expect(validator('a', {})).resolves.toEqual({
    type: 'ERROR_MINIMUM_LENGTH',
    label: 'Description',
    value: 'a',
    reasons: { minimumLength: 3 }
  });
  expect(validator('aa', {})).resolves.toEqual({
    type: 'ERROR_MINIMUM_LENGTH',
    label: 'Description',
    value: 'aa',
    reasons: { minimumLength: 3 }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator('aaa', {})).resolves.toBe(undefined);
  expect(validator('aaaa', {})).resolves.toBe(undefined);
});

test('maximumLength', () => {
  const validator = makeMaximumLength('Info', 3);

  expect(validator('aaaa', {})).resolves.toEqual({
    type: 'ERROR_MAXIMUM_LENGTH',
    label: 'Info',
    value: 'aaaa',
    reasons: { maximumLength: 3 }
  });

  expect(validator('aaaaa', {})).resolves.toEqual({
    type: 'ERROR_MAXIMUM_LENGTH',
    label: 'Info',
    value: 'aaaaa',
    reasons: { maximumLength: 3 }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator('', {})).resolves.toBe(undefined);
  expect(validator('a', {})).resolves.toBe(undefined);
  expect(validator('aa', {})).resolves.toBe(undefined);
  expect(validator('aaa', {})).resolves.toBe(undefined);
});

test('minValue', () => {
  const validator = makeMinValue('Age', 15);

  expect(validator(1, {})).resolves.toEqual({
    type: 'ERROR_MIN_VALUE',
    label: 'Age',
    value: 1,
    reasons: { minValue: 15 }
  });

  expect(validator(14, {})).resolves.toEqual({
    type: 'ERROR_MIN_VALUE',
    label: 'Age',
    value: 14,
    reasons: { minValue: 15 }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator(15, {})).resolves.toBe(undefined);
  expect(validator(16, {})).resolves.toBe(undefined);
});

test('maxValue', () => {
  const validator = makeMaxValue('Amount', 15);

  expect(validator(99, {})).resolves.toEqual({
    type: 'ERROR_MAX_VALUE',
    label: 'Amount',
    value: 99,
    reasons: { maxValue: 15 }
  });

  expect(validator(16, {})).resolves.toEqual({
    type: 'ERROR_MAX_VALUE',
    label: 'Amount',
    value: 16,
    reasons: { maxValue: 15 }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator(15, {})).resolves.toBe(undefined);
  expect(validator(14, {})).resolves.toBe(undefined);
});

test('number', () => {
  const validator = makeNumber('Telephone');

  expect(validator('noot', {})).resolves.toEqual({
    type: 'ERROR_NUMBER',
    label: 'Telephone',
    value: 'noot',
    reasons: { regex: /^-?\d+$/ }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator(15, {})).resolves.toBe(undefined);
  expect(validator(14, {})).resolves.toBe(undefined);
});

test('numberFraction', () => {
  const validator = makeNumberFraction('Telephone', 10);

  expect(validator('noot', {})).resolves.toEqual({
    type: 'ERROR_NUMBER_FRACTION',
    label: 'Telephone',
    value: 'noot',
    reasons: { regex: /^-?\d+(\.\d{1,10})?$/, fractionLength: 10 }
  });

  expect(validator(undefined, {})).resolves.toBe(undefined);
  expect(validator(null, {})).resolves.toBe(undefined);
  expect(validator(15, {})).resolves.toBe(undefined);
  expect(validator(14, {})).resolves.toBe(undefined);
});
