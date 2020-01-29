import { FieldValidator } from 'final-form';
import * as patterns from './regex';
import {
  RequiredError,
  MinimumLengthError,
  MaximumLengthError,
  MinValueError,
  MaxValueError,
  NumberError,
  NumberFractionError
} from './errors';

export function makeRequired(label: string): FieldValidator<any> {
  return function validateRequired(
    value: any
  ): Promise<RequiredError | undefined> {
    if (value == null || value === '' || typeof value === 'boolean') {
      const error: RequiredError = {
        type: 'ERROR_REQUIRED',
        label,
        value,
        reasons: {
          required: 'required'
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeBooleanRequired(label: string): FieldValidator<any> {
  return function validateBooleanRequired(
    value: any
  ): Promise<RequiredError | undefined> {
    if (value === true || value === false) {
      return Promise.resolve(undefined);
    }

    const error: RequiredError = {
      type: 'ERROR_REQUIRED',
      label,
      value,
      reasons: {
        required: 'required'
      }
    };

    return Promise.resolve(error);
  };
}

export function makeMinimumLength(
  label: string,
  minimumLength: number
): FieldValidator<any> {
  return function checkMinimumLength(
    value
  ): Promise<MinimumLengthError | undefined> {
    if (value != null && value.length < minimumLength) {
      const error: MinimumLengthError = {
        type: 'ERROR_MINIMUM_LENGTH',
        label,
        value,
        reasons: {
          minimumLength
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeMaximumLength(
  label: string,
  maximumLength: number
): FieldValidator<any> {
  return function validateMaximumLength(
    value: any
  ): Promise<MaximumLengthError | undefined> {
    if (value != null && value.length > maximumLength) {
      const error: MaximumLengthError = {
        type: 'ERROR_MAXIMUM_LENGTH',
        label,
        value,
        reasons: {
          maximumLength
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeMinValue(
  label: string,
  minValue: number
): FieldValidator<any> {
  return function validateMinValue(
    value: any
  ): Promise<MinValueError | undefined> {
    if (value != null && value < minValue) {
      const error: MinValueError = {
        type: 'ERROR_MIN_VALUE',
        label,
        value,
        reasons: {
          minValue
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeMaxValue(
  label: string,
  maxValue: number
): FieldValidator<any> {
  return function validateMaxValue(
    value: any
  ): Promise<MaxValueError | undefined> {
    if (value != null && value > maxValue) {
      const error: MaxValueError = {
        type: 'ERROR_MAX_VALUE',
        label,
        value,
        reasons: {
          maxValue
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeNumber(label: string): FieldValidator<any> {
  const regex = patterns.numberRegex;

  return function validateNumber(value: any): Promise<NumberError | undefined> {
    if (value != null && regex.test(`${value}`) === false) {
      const error: NumberError = {
        type: 'ERROR_NUMBER',
        label,
        value,
        reasons: {
          regex
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}

export function makeNumberFraction(
  label: string,
  fractionLength: number
): FieldValidator<any> {
  const regex = patterns.fractionNumberRegex(fractionLength);

  return function validiateNumberFraction(
    value: any
  ): Promise<NumberFractionError | undefined> {
    if (value != null && regex.test(`${value}`) === false) {
      const error: NumberFractionError = {
        type: 'ERROR_NUMBER_FRACTION',
        label,
        value,
        reasons: {
          regex,
          fractionLength
        }
      };

      return Promise.resolve(error);
    }

    return Promise.resolve(undefined);
  };
}
