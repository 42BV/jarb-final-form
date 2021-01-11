export type FieldType =
  | 'enum'
  | 'color'
  | 'datetime-local'
  | 'datetime'
  | 'month'
  | 'week'
  | 'date'
  | 'time'
  | 'email'
  | 'tel'
  | 'number'
  | 'url'
  | 'password'
  | 'file'
  | 'image'
  | 'boolean'
  | 'text';

export type FieldConstraints = {
  javaType: string;
  types?: FieldType[] | null;
  required?: boolean | null;
  minimumLength?: number | null;
  maximumLength?: number | null;
  fractionLength?: number | null;
  radix?: number | null;
  pattern?: string | null;
  min?: number | null;
  max?: number | null;
  name: string;
};

export type ConstraintModel = Record<string, FieldConstraints>;

/**
 * The constraints should have the following signature:
 *
 * {
 *   "SuperHero": {
 *     "name": {
 *       "javaType": "java.lang.String",
 *       "types": ["text"],
 *       "required": true,
 *       "minimumLength": null,
 *       "maximumLength": 50,
 *       "fractionLength": null,
 *       "radix": null,
 *       "pattern": null,
 *       "min": null,
 *       "max": null,
 *       "name": "name"
 *     },
 *     "email": {
 *       "javaType": "java.lang.String",
 *       "types": ["email", "text"],
 *       "required": true,
 *       "minimumLength": null,
 *       "maximumLength": 255,
 *       "fractionLength": null,
 *       "radix": null,
 *       "pattern": null,
 *       "min": null,
 *       "max": null,
 *       "name": "email"
 *     }
 * }
 *
 * The keys represent the name of the class, in the above case 'SuperHero', each class
 * has fields such as the 'name', and 'email', these are described in an object of the
 * same name. These 'validator' objects look like this:
 *
 * {
 *   "javaType": string,          // The Java class name of this validator
 *   "types":Array<string>,       // The type that closest represents this validator
 *   "required":true,             // Wether or not the validator is required.
 *   "minimumLength":int,         // Minimum length of the input string.
 *   "maximumLength":int,         // Maximum length of the input string.
 *   "fractionLength":int,        // The number of numbers after the dot if input is a number.
 *   "radix": int,                // Radix for the when type is number: @See http://en.wikipedia.org/wiki/Radix. Is not used.
 *   "pattern": string,           // The regex in Java form the input must be valid for. Is not used.
 *   "min": int,                  // The maximum int value, is not used.
 *   "max": int,                  // The minimum int value, is not used.
 *   "name": string               // The name of the property this validator represents.
 * }
 *
 */
export type Constraints = {
  [key: string]: ConstraintModel;
};
