import {
  makeRequired,
  makeBooleanRequired,
  makeMinValue,
  makeMaxValue,
  makeMinimumLength,
  makeMaximumLength,
  makeNumber,
  makeNumberFraction
} from '../src/validators';
import { ValidationError } from '../src/errors';
import { defaultFractionNumberRegex } from '../src/regex';

type Validator = (
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
  form: object
) => Promise<ValidationError | undefined>;

type CheckValidator = {
  value: unknown;
  expected: unknown;
};

function makeValidatorChecker(
  validator: Validator
): (options: CheckValidator) => Promise<unknown> {
  return async function checkValidator(args: CheckValidator): Promise<void> {
    const { value, expected } = args;

    const result = await validator(value, {});
    expect(result).toEqual(expected);
  };
}

test('required', async () => {
  expect.assertions(16);

  const validator = makeRequired('Name');

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: undefined,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: undefined,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: null,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: null,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: '',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: '',
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: ' ',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: ' ',
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: '  ',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: '  ',
      reasons: { required: 'required' }
    }
  });

  // Prevent users from validating boolean values by always
  // considering it an error, they should use `makeBooleanRequired`
  // instead.
  await checkValidator({
    value: true,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: true,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: false,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: false,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: [],
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: [],
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: {},
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: {},
      reasons: { required: 'required' }
    }
  });

  await checkValidator({ value: 'h', expected: undefined });
  await checkValidator({ value: 'h ', expected: undefined });
  await checkValidator({ value: ' h ', expected: undefined });
  await checkValidator({ value: 'henkie', expected: undefined });
  await checkValidator({ value: { test: true }, expected: undefined });
  await checkValidator({ value: ['test'], expected: undefined });
  await checkValidator({ value: new Date(), expected: undefined });
});

test('booleanRequired', async () => {
  expect.assertions(5);

  const validator = makeBooleanRequired('Name');

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: undefined,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: undefined,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: null,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: null,
      reasons: { required: 'required' }
    }
  });

  await checkValidator({
    value: '',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: '',
      reasons: { required: 'required' }
    }
  });

  await checkValidator({ value: true, expected: undefined });
  await checkValidator({ value: false, expected: undefined });
});

test('minimumLength', async () => {
  expect.assertions(7);

  const validator = makeMinimumLength('Description', 3);

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: '',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: '',
      reasons: { minimumLength: 3 }
    }
  });

  await checkValidator({
    value: 'a',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: 'a',
      reasons: { minimumLength: 3 }
    }
  });

  await checkValidator({
    value: 'aa',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: 'aa',
      reasons: { minimumLength: 3 }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: 'aaa', expected: undefined });
  await checkValidator({ value: 'aaaa', expected: undefined });
});

test('maximumLength', async () => {
  expect.assertions(8);

  const validator = makeMaximumLength('Info', 3);

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: 'aaaa',
    expected: {
      type: 'ERROR_MAXIMUM_LENGTH',
      label: 'Info',
      value: 'aaaa',
      reasons: { maximumLength: 3 }
    }
  });

  await checkValidator({
    value: 'aaaaa',
    expected: {
      type: 'ERROR_MAXIMUM_LENGTH',
      label: 'Info',
      value: 'aaaaa',
      reasons: { maximumLength: 3 }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: '', expected: undefined });
  await checkValidator({ value: 'a', expected: undefined });
  await checkValidator({ value: 'aa', expected: undefined });
  await checkValidator({ value: 'aaa', expected: undefined });
});

test('minValue', async () => {
  expect.assertions(6);

  const validator = makeMinValue('Age', 15);

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: 1,
    expected: {
      type: 'ERROR_MIN_VALUE',
      label: 'Age',
      value: 1,
      reasons: { minValue: 15 }
    }
  });

  await checkValidator({
    value: 14,
    expected: {
      type: 'ERROR_MIN_VALUE',
      label: 'Age',
      value: 14,
      reasons: { minValue: 15 }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: 15, expected: undefined });
  await checkValidator({ value: 16, expected: undefined });
});

test('maxValue', async () => {
  expect.assertions(6);

  const validator = makeMaxValue('Amount', 15);

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: 99,
    expected: {
      type: 'ERROR_MAX_VALUE',
      label: 'Amount',
      value: 99,
      reasons: { maxValue: 15 }
    }
  });

  await checkValidator({
    value: 16,
    expected: {
      type: 'ERROR_MAX_VALUE',
      label: 'Amount',
      value: 16,
      reasons: { maxValue: 15 }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: 15, expected: undefined });
  await checkValidator({ value: 14, expected: undefined });
});

test('number', async () => {
  expect.assertions(5);

  const validator = makeNumber('Telephone');

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: 'noot',
    expected: {
      type: 'ERROR_NUMBER',
      label: 'Telephone',
      value: 'noot',
      reasons: { regex: /^-?\d+$/ }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: 15, expected: undefined });
  await checkValidator({ value: 14, expected: undefined });
});

test('numberFraction', async () => {
  expect.assertions(5);

  const validator = makeNumberFraction(
    'Telephone',
    10,
    defaultFractionNumberRegex
  );

  const checkValidator = makeValidatorChecker(validator);

  await checkValidator({
    value: 'noot',
    expected: {
      type: 'ERROR_NUMBER_FRACTION',
      label: 'Telephone',
      value: 'noot',
      reasons: { regex: /^-?\d+(\.\d{1,10})?$/, fractionLength: 10 }
    }
  });

  await checkValidator({ value: undefined, expected: undefined });
  await checkValidator({ value: null, expected: undefined });
  await checkValidator({ value: 15, expected: undefined });
  await checkValidator({ value: 14, expected: undefined });
});
