import {
  FieldType,
  Constraints,
  ConstraintModel,
  FieldConstraints
} from './models';

// List of <input> types sorted on most specific first.
const inputTypes: FieldType[] = [
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
