import {
  FieldType,
  Constraints,
  ConstraintModel,
  FieldConstraints
} from './models';
import { getConstraints } from './constraints';

// List of <input> types sorted on most specific first.
const inputTypes: FieldType[] = [
  'enum',
  'boolean',
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
];

/**
 * Finds the most specific <input> type for the types parameter. For example if
 * types is ['email', 'text'] the function returns 'email' because 'email'
 * is the most specific input type. If nothing is found returns 'text'.
 *
 * @param  {Array<string>} The types you want the closest type for.
 * @return {FieldType} The closest <input> type, based on the types parameter.
 */
export function mostSpecificInputTypeFor(types: FieldType[]): FieldType {
  // Default to the last inputType which should be 'text'.
  let index = inputTypes.length - 1;

  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    for (let j = 0; j < inputTypes.length; j += 1) {
      const inputType = inputTypes[j];

      //console.log(`${type} === ${inputType}`);
      if (type === inputType) {
        index = Math.min(index, j);
        break;
      }
    }
  }

  return inputTypes[index];
}

/**
 * Finds the FieldConstraints rules for a specific validator in the
 * Constraints object.
 *
 * If no constraints can be found for a validator the boolean false
 * is returned.
 *
 * @param  {validator} 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @param  {Constraints} The constraints to find the validator in.
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 * @returns {FieldConstraints | false} The constraints for the specific field
 */
export function getFieldConstraintsFor(
  validator: string,
  constraints: Constraints
): FieldConstraints | false {
  const [className] = validator.split('.', 1);
  const propertyName = validator.substring(className.length + 1);

  const classConstraints: ConstraintModel = constraints[className];

  if (classConstraints !== undefined) {
    const fieldConstraints = classConstraints[propertyName];

    return fieldConstraints !== undefined ? fieldConstraints : false;
  } else {
    return false;
  }
}

/**
 * Finds the FieldConstraints rules for a specific validator.
 *
 * If no constraints can be found for a validator the boolean false
 * is returned.
 *
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 * @returns FieldConstraints | false The constraints for the specific field
 */
export function getFieldConstraints(
  validator: string
): FieldConstraints | false {
  const constraints = getConstraints();
  if (!constraints) {
    return false;
  }

  return getFieldConstraintsFor(validator, constraints);
}

/**
 * Determine if constraints tell a specific validator makes a field required.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function isRequired(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && fieldConstraints.required === true;
}

/**
 * Determine if constraints tell a specific validator makes a field have a minimum length.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasMinimumLength(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.minimumLength === 'number';
}

/**
 * Determine if constraints tell a specific validator makes a field have a maximum length.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasMaximumLength(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.maximumLength === 'number';
}

/**
 * Determine if constraints tell a specific validator makes a field have a fraction length.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasFractionLength(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return (
    fieldConstraints && typeof fieldConstraints.fractionLength === 'number'
  );
}

/**
 * Determine if constraints tell a specific validator makes a field have a radix.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasRadix(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.radix === 'number';
}

/**
 * Determine if constraints tell a specific validator makes a field comply to a pattern.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasPattern(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.pattern === 'string';
}

/**
 * Determine if constraints tell a specific validator makes a field have a minimum.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasMin(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.min === 'number';
}

/**
 * Determine if constraints tell a specific validator makes a field have a maximum.
 * @param  validator 'validator' is a string with the format: 'Class.field' for example: 'User.age'
 * @throws {error} When the validator doesn't match the format 'className.fieldName'.
 */
export function hasMax(validator: string): boolean {
  const fieldConstraints = getFieldConstraints(validator);
  return fieldConstraints && typeof fieldConstraints.max === 'number';
}
