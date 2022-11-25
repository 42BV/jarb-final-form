import React from 'react';
import { getConstraints } from './constraints';
import { Field, FieldProps } from '@42.nl/final-form-field-validation';

import { getFieldConstraintsFor, mostSpecificInputTypeFor } from './utils';
import { FieldType } from './models';
import * as Validators from './validators';
import { defaultFractionNumberRegex } from './regex';

export type JarbProps = {
  validator: string;
  label: string;

  /*
   * Function used to define the regular expression against
   * which fractional numbers are validated. The fractional
   * length differs per field and is thus supplied, the implementing
   * function should use that in its implementation.
   * If not supplied, the default implementation which uses periods
   * for fractions is used.
   */
  fractionalNumberRegex?: (fractionLength: number) => RegExp;
};

export interface JarbFieldProps<FieldValue, T extends HTMLElement>
  extends FieldProps<FieldValue, T> {
  jarb: JarbProps;
}

/**
 * JarbField wraps final-form's Field, and adds the auto validation
 * from the constraints. In fact it is a very thin wrapper around
 * Field.
 *
 * It only demands one extra property called `jarb` which is used
 * to to configure the Field. The `jarb` object needs two keys:
 * the `validator` and the `label`.
 *
 * The `validator` follows the following format: `{Entity}.{Property}`.
 * For example if the validator property is 'SuperHero.name' this means that
 * the Field will apply the constraints for the 'name' property of
 * the `SuperHero` entity.
 *
 * The `label` is used to inform you which field was wrong, when errors occur.
 * You will receive the 'label' when an error occurs to create a nice
 * error message.
 *
 * It is also possible to add custom field validators and async validators
 * via the `validators` and `asyncValidators` props. The `asyncValidators`
 * are only ran when the all synchronous `validators` have declared the
 * field valid.
 *
 * See the documentation for some examples on how to create custom
 * validators.
 *
 * @example
 * ```JavaScript
 * <JarbField
 *   name="Name"
 *   jarb={{ validator: 'SuperHero.name', label: "Name" }}
 *   component="input"
 *   type="text"
 * />
 * ```
 */
export function JarbField<FieldValue, T extends HTMLElement>(
  props: JarbFieldProps<FieldValue, T>
) {
  const {
    jarb: {
      label,
      validator,
      fractionalNumberRegex = defaultFractionNumberRegex
    },
    ...fieldProps
  } = props;

  // Validator array must be copied to prevent duplicates when pushing validators
  const validators = props.validators ? [...props.validators] : [];

  const constraints = getConstraints();

  if (constraints !== undefined) {
    const fieldConstraints = getFieldConstraintsFor(validator, constraints);

    if (fieldConstraints !== false) {
      const field: FieldType = mostSpecificInputTypeFor(fieldConstraints.types);

      if (fieldConstraints.required) {
        if (field === 'boolean') {
          const requiredValidator = Validators.makeBooleanRequired(label);
          validators.push(requiredValidator);
        } else {
          const requiredValidator = Validators.makeRequired(label);
          validators.push(requiredValidator);
        }
      }

      if (field === 'text') {
        if (fieldConstraints.minimumLength) {
          const minimumLengthValidator = Validators.makeMinimumLength(
            label,
            fieldConstraints.minimumLength
          );

          validators.push(minimumLengthValidator);
        }

        if (fieldConstraints.maximumLength) {
          const maximumLengthValidator = Validators.makeMaximumLength(
            label,
            fieldConstraints.maximumLength
          );

          validators.push(maximumLengthValidator);
        }
      }

      if (fieldConstraints.min) {
        const minValueValidator = Validators.makeMinValue(
          label,
          fieldConstraints.min
        );

        validators.push(minValueValidator);
      }

      if (fieldConstraints.max) {
        const maxValueValidator = Validators.makeMaxValue(
          label,
          fieldConstraints.max
        );

        validators.push(maxValueValidator);
      }

      if (
        field === 'number' &&
        fieldConstraints.fractionLength &&
        fieldConstraints.fractionLength > 0
      ) {
        const patternValidator = Validators.makeNumberFraction(
          label,
          fieldConstraints.fractionLength,
          fractionalNumberRegex
        );

        validators.push(patternValidator);
      } else if (field === 'number') {
        const patternValidator = Validators.makeNumber(label);

        validators.push(patternValidator);
      }
    } else {
      console.warn(
        `@42.nl/jarb-final-form: constraints for "${validator}" not found, but a JarbField was rendered, this should not occur, check your validator.`
      );
    }
  } else {
    console.warn(
      '@42.nl/jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
    );
  }

  return <Field {...fieldProps} validators={validators} />;
}
