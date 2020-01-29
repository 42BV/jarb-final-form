import React, { Component } from 'react';
import { getConstraints } from './constraints';
import { FieldValidator, FieldState } from 'final-form';
import { Field, FieldProps, FieldRenderProps } from 'react-final-form';

import { getFieldConstraintsFor, mostSpecificInputTypeFor } from './utils';
import { FieldType } from './models';
import * as Validators from './validators';

export interface JarbProps {
  validator: string;
  label: string;
}
export interface JarbFieldProps<FieldValue, T extends HTMLElement>
  extends FieldProps<FieldValue, FieldRenderProps<FieldValue>, T> {
  jarb: JarbProps;

  /**
   * An array of custom validators to run whenever the field changes.
   *
   * @type {FieldValidator<FieldValue>[]}
   * @memberof JarbFieldProps
   */
  validators?: FieldValidator<FieldValue>[];

  /**
   * An array of custom async validators to run whenever the field changes
   * and the synchronous validators have declared the field valid.
   *
   * @type {FieldValidator<FieldValue>[]}
   * @memberof JarbFieldProps
   */
  asyncValidators?: FieldValidator<FieldValue>[];

  /**
   * The time after which the async validators are ran to prevent
   * to many validators from running at once.
   *
   * Defaults to 200 milliseconds.
   *
   * @type {number}
   * @memberof JarbFieldProps
   */
  asyncValidatorsDebounce?: number;
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
 *
 * @export
 * @param {Props.jarb} object Object containing the 'label' and 'validator'.

 * @returns
 */
export class JarbField<FieldValue, T extends HTMLElement> extends Component<
  JarbFieldProps<FieldValue, T>
> {
  private enhancedValidate: FieldValidator<FieldValue> | null = null;

  // Stores a resolver which is used to debounce async validations
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private debounceResolver = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value?: boolean | PromiseLike<boolean> | undefined
  ) => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  // Stores a ID for each async validation train.
  private validationId = Math.random();

  public getEnhancedValidate(): FieldValidator<FieldValue> | null {
    if (this.enhancedValidate !== null) {
      return this.enhancedValidate;
    }

    const {
      jarb,
      validators,
      asyncValidators,
      asyncValidatorsDebounce = 200
    } = this.props;
    const { label, validator } = jarb;

    const validatorFunctions =
      Array.isArray(validators) && validators ? [...validators] : [];

    const asyncValidatorFunctions =
      Array.isArray(asyncValidators) && asyncValidators
        ? [...asyncValidators]
        : [];

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
          `@42.nl/jarb-final-form: constraints for "${validator}" not found, but a JarbField was rendered, this should not occur, check your validator.`
        );
      }
    } else {
      console.warn(
        '@42.nl/jarb-final-form: constraints are empty, but a JarbField was rendered, this should not occur, make sure the constraints are loaded before the form is displayed.'
      );
    }

    if (validatorFunctions.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.enhancedValidate = async (
      value: FieldValue,
      allValues: object,
      meta?: FieldState<FieldValue>
    ) => {
      // Generate a new async id for this train of async validations.
      this.validationId = Math.random();

      // Store the id locally to this closure.
      const id = this.validationId;

      // Prevent the previous async check from occurring if possible.
      this.debounceResolver(false);

      // Perform synchronous validation
      const results = await Promise.all(
        validatorFunctions.map(validator => validator(value, allValues, meta))
      );

      const errors = results.filter(v => v !== undefined);

      // If there are no synchronous errors, perform the asynchronous validation
      if (errors.length > 0) {
        return errors;
      }

      // We will only perform the asynchronous validation after 200 milliseconds
      // to prevent repeatedly calling the back-end
      const debouncePromise = new Promise<boolean>(resolve => {
        // Prevent the previous async check from occurring if possible.
        this.debounceResolver(false);

        this.debounceResolver = resolve;

        // After a debounce resolve with true.
        window.setTimeout(() => {
          resolve(true);
        }, asyncValidatorsDebounce);
      });

      const shouldPerformAsyncValidation = await debouncePromise;

      if (!shouldPerformAsyncValidation) {
        return undefined;
      }

      const asyncResults = await Promise.all(
        asyncValidatorFunctions.map(validator =>
          validator(value, allValues, meta)
        )
      );

      // Only use the errors when they are still relevant.
      if (this.validationId !== id) {
        return undefined;
      }

      // If there are no errors return undefined to indicate
      // that everything is a-ok.
      const asyncErrors = asyncResults.filter(v => v !== undefined);

      return asyncErrors.length === 0 ? undefined : asyncErrors;
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
