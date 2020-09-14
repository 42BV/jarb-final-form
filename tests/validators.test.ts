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

type Validator = (
  value: any,
  form: any
) => Promise<ValidationError | undefined>;

interface CheckValidator {
  value: any;
  expected: any;
}

function makeValidatorChecker(
  done: jest.DoneCallback,
  validator: Validator
): (options: CheckValidator) => Promise<any> {
  return async function checkValidator(args: CheckValidator): Promise<any> {
    const { value, expected } = args;

    try {
      const result = await validator(value, {});
      expect(result).toEqual(expected);
    } catch (e) {
      done.fail(e);
    }
  };
}

test('required', async done => {
  const validator = makeRequired('Name');

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: undefined,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: undefined,
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: null,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: null,
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: '',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: '',
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: ' ',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: ' ',
      reasons: { required: 'required' }
    }
  });

  checkValidator({
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
  checkValidator({
    value: true,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: true,
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: false,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: false,
      reasons: { required: 'required' }
    }
  });

  checkValidator({ value: 'h', expected: undefined });
  checkValidator({ value: 'h ', expected: undefined });
  checkValidator({ value: ' h ', expected: undefined });
  checkValidator({ value: 'henkie', expected: undefined });

  done();
});

test('booleanRequired', async done => {
  const validator = makeBooleanRequired('Name');

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: undefined,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: undefined,
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: null,
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: null,
      reasons: { required: 'required' }
    }
  });

  checkValidator({
    value: '',
    expected: {
      type: 'ERROR_REQUIRED',
      label: 'Name',
      value: '',
      reasons: { required: 'required' }
    }
  });

  checkValidator({ value: true, expected: undefined });
  checkValidator({ value: false, expected: undefined });

  done();
});

test('minimumLength', async done => {
  const validator = makeMinimumLength('Description', 3);

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: '',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: '',
      reasons: { minimumLength: 3 }
    }
  });

  checkValidator({
    value: 'a',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: 'a',
      reasons: { minimumLength: 3 }
    }
  });

  checkValidator({
    value: 'aa',
    expected: {
      type: 'ERROR_MINIMUM_LENGTH',
      label: 'Description',
      value: 'aa',
      reasons: { minimumLength: 3 }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: 'aaa', expected: undefined });
  checkValidator({ value: 'aaaa', expected: undefined });

  done();
});

test('maximumLength', done => {
  const validator = makeMaximumLength('Info', 3);

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: 'aaaa',
    expected: {
      type: 'ERROR_MAXIMUM_LENGTH',
      label: 'Info',
      value: 'aaaa',
      reasons: { maximumLength: 3 }
    }
  });

  checkValidator({
    value: 'aaaaa',
    expected: {
      type: 'ERROR_MAXIMUM_LENGTH',
      label: 'Info',
      value: 'aaaaa',
      reasons: { maximumLength: 3 }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: '', expected: undefined });
  checkValidator({ value: 'a', expected: undefined });
  checkValidator({ value: 'aa', expected: undefined });
  checkValidator({ value: 'aaa', expected: undefined });

  done();
});

test('minValue', done => {
  const validator = makeMinValue('Age', 15);

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: 1,
    expected: {
      type: 'ERROR_MIN_VALUE',
      label: 'Age',
      value: 1,
      reasons: { minValue: 15 }
    }
  });

  checkValidator({
    value: 14,
    expected: {
      type: 'ERROR_MIN_VALUE',
      label: 'Age',
      value: 14,
      reasons: { minValue: 15 }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: 15, expected: undefined });
  checkValidator({ value: 16, expected: undefined });

  done();
});

test('maxValue', done => {
  const validator = makeMaxValue('Amount', 15);

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: 99,
    expected: {
      type: 'ERROR_MAX_VALUE',
      label: 'Amount',
      value: 99,
      reasons: { maxValue: 15 }
    }
  });

  checkValidator({
    value: 16,
    expected: {
      type: 'ERROR_MAX_VALUE',
      label: 'Amount',
      value: 16,
      reasons: { maxValue: 15 }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: 15, expected: undefined });
  checkValidator({ value: 14, expected: undefined });

  done();
});

test('number', done => {
  const validator = makeNumber('Telephone');

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: 'noot',
    expected: {
      type: 'ERROR_NUMBER',
      label: 'Telephone',
      value: 'noot',
      reasons: { regex: /^-?\d+$/ }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: 15, expected: undefined });
  checkValidator({ value: 14, expected: undefined });

  done();
});

test('numberFraction', done => {
  const validator = makeNumberFraction('Telephone', 10);

  const checkValidator = makeValidatorChecker(done, validator);

  checkValidator({
    value: 'noot',
    expected: {
      type: 'ERROR_NUMBER_FRACTION',
      label: 'Telephone',
      value: 'noot',
      reasons: { regex: /^-?\d+(\.\d{1,10})?$/, fractionLength: 10 }
    }
  });

  checkValidator({ value: undefined, expected: undefined });
  checkValidator({ value: null, expected: undefined });
  checkValidator({ value: 15, expected: undefined });
  checkValidator({ value: 14, expected: undefined });

  done();
});
