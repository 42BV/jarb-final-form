export interface RequiredError {
  type: 'ERROR_REQUIRED';
  label: string;
  value: any;
  reasons: {
    required: 'required';
  };
}

export interface MinimumLengthError {
  type: 'ERROR_MINIMUM_LENGTH';
  label: string;
  value: any;
  reasons: {
    minimumLength: number;
  };
}

export interface MaximumLengthError {
  type: 'ERROR_MAXIMUM_LENGTH';
  label: string;
  value: any;
  reasons: {
    maximumLength: number;
  };
}

export interface MinValueError {
  type: 'ERROR_MIN_VALUE';
  label: string;
  value: any;
  reasons: {
    minValue: number;
  };
}

export interface MaxValueError {
  type: 'ERROR_MAX_VALUE';
  label: string;
  value: any;
  reasons: {
    maxValue: number;
  };
}

export interface NumberError {
  type: 'ERROR_NUMBER';
  label: string;
  value: any;
  reasons: {
    regex: RegExp;
  };
}

export interface NumberFractionError {
  type: 'ERROR_NUMBER_FRACTION';
  label: string;
  value: any;
  reasons: {
    regex: RegExp;
    fractionLength: number;
  };
}

export type ValidationError =
  | RequiredError
  | MinimumLengthError
  | MaximumLengthError
  | MinValueError
  | MaxValueError
  | NumberError
  | NumberFractionError;
