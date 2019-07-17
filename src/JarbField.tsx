import React, { Component } from 'react';
import { getConstraints } from './constraints';
import { FieldValidator, FieldState } from 'final-form';
import { Field, FieldProps } from 'react-final-form';

import { getFieldConstraintsFor, mostSpecificInputTypeFor } from './utils';
import { FieldType } from './models';
import * as Validators from './validators';

export interface JarbProps {
  validator: string;
  label: string;
}

export interface JarbFieldProps<FieldValue, T extends HTMLElement>
  extends FieldProps<FieldValue, T> {
  jarb: JarbProps;
  validators?: FieldValidator<FieldValue>[];
}

/**
 * JarbField wrappes final-form's Field, and adds the auto validation
 * from the constraints. In fact it is a very thin wrapper around
 * Field.
 *
 * It only demands one extra property called 'jarb' which is used
 * to to configure the Field. The 'jarb' object needs two keys:
 * the 'validator' and the 'label'. 
 *
 * The 'validator' follows the following format: {Entity}.{Property}. 
 * For example if the validator property is 'SuperHero.name' this means that
 * the Field will apply the constraints for the 'name' property of
 * the 'SuperHero' entity.
 * 
 * The 'label' is used to inform you which field was wrong, when errors occur.
 * You will receive the 'label' when an error occurs to create a nice
 * error message.
 * 
 * It is also possible to add custom field validators. Since 
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
 *
 * @export
 * @param {Props.jarb} object Object containing the 'label' and 'validator'.

 * @returns
 */
export class JarbField<FieldValue, T extends HTMLElement> extends Component<
  JarbFieldProps<FieldValue, T>
> {
  private enhancedValidate: FieldValidator<FieldValue> | null = null;

  public getEnhancedValidate(): FieldValidator<FieldValue> | null {
    if (this.enhancedValidate !== null) {
      return this.enhancedValidate;
    }

    const { jarb, validators } = this.props;
    const { label, validator } = jarb;

    const validatorFunctions =
      Array.isArray(validators) && validators ? [...validators] : [];

    const constraints = getConstraints();

    if (constraints !== undefined) {
      const fieldConstraints = getFieldConstraintsFor(validator, constraints);

      if (fieldConstraints !== false) {
        const field: FieldType = mostSpecificInputTypeFor(
          fieldConstraints.types
        );

        if (fieldConstraints.required) {
          if (field === 'boolean') {
            const requiredValidator = Validators.makeBooleanRequired(label);
            validatorFunctions.push(requiredValidator);
          } else {
            const requiredValidator = Validators.makeRequired(label);
            validatorFunctions.push(requiredValidator);
          }
        }

        if (field === 'text') {
          if (fieldConstraints.minimumLength) {
            const minimumLengthValidator = Validators.makeMinimumLength(
              label,
              fieldConstraints.minimumLength
            );

            validatorFunctions.push(minimumLengthValidator);
          }

          if (fieldConstraints.maximumLength) {
            const maximumLengthValidator = Validators.makeMaximumLength(
              label,
              fieldConstraints.maximumLength
            );

            validatorFunctions.push(maximumLengthValidator);
          }
        }

        if (fieldConstraints.min) {
          const minValueValidator = Validators.makeMinValue(
            label,
            fieldConstraints.min
          );

          validatorFunctions.push(minValueValidator);
        }

        if (fieldConstraints.max) {
          const maxValueValidator = Validators.makeMaxValue(
            label,
            fieldConstraints.max
          );

          validatorFunctions.push(maxValueValidator);
        }

        if (
          field === 'number' &&
          fieldConstraints.fractionLength &&
          fieldConstraints.fractionLength > 0
        ) {
          const patternValidator = Validators.makeNumberFraction(
            label,
            fieldConstraints.fractionLength
          );

          validatorFunctions.push(patternValidator);
        } else if (field === 'number') {
          const patternValidator = Validators.makeNumber(label);

          validatorFunctions.push(patternValidator);
        }
      } else {
        console.warn(
          `jarb-final-form: constraints for "${validator}" not found, but a JarbField was rendered, this should not occur, check your validator.`
        );
      }
    } else {
      console.warn(
        'jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
      );
    }

    if (validatorFunctions.length === 0) {
      return null;
    }

    this.enhancedValidate = (
      value: FieldValue,
      allValues: object,
      meta?: FieldState<FieldValue>
    ) => {
      const promises = validatorFunctions.map(validator =>
        validator(value, allValues, meta)
      );
      return Promise.all(promises).then(values => {
        const errors = values.filter(v => v !== undefined);

        // If there are no errors return undefined to indicate
        // that everything is a-ok.
        return errors.length === 0 ? undefined : errors;
      });
    };

    return this.enhancedValidate;
  }

  public render(): React.ReactNode {
    const validate = this.getEnhancedValidate();

    const props = {
      validate: validate !== null ? validate : undefined,
      ...this.props
    };

    return <Field {...props} />;
  }
}
