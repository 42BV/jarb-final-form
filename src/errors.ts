export type RequiredError = {
  type: 'ERROR_REQUIRED';
  label: string;
  value: unknown;
  reasons: {
    required: 'required';
  };
};

export type MinimumLengthError = {
  type: 'ERROR_MINIMUM_LENGTH';
  label: string;
  value: unknown;
  reasons: {
    minimumLength: number;
  };
};

export type MaximumLengthError = {
  type: 'ERROR_MAXIMUM_LENGTH';
  label: string;
  value: unknown;
  reasons: {
    maximumLength: number;
  };
};

export type MinValueError = {
  type: 'ERROR_MIN_VALUE';
  label: string;
  value: unknown;
  reasons: {
    minValue: number;
  };
};

export type MaxValueError = {
  type: 'ERROR_MAX_VALUE';
  label: string;
  value: unknown;
  reasons: {
    maxValue: number;
  };
};

export type NumberError = {
  type: 'ERROR_NUMBER';
  label: string;
  value: unknown;
  reasons: {
    regex: RegExp;
  };
};

export type NumberFractionError = {
  type: 'ERROR_NUMBER_FRACTION';
  label: string;
  value: unknown;
  reasons: {
    regex: RegExp;
    fractionLength: number;
  };
};

export type ValidationError =
  | RequiredError
  | MinimumLengthError
  | MaximumLengthError
  | MinValueError
  | MaxValueError
  | NumberError
  | NumberFractionError;
