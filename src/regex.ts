/**
 * Returns a regex that checks if the it is a valid number
 * which can have fractions. Which are the numbers behind
 * the decimal. So if the fractionLength is 5 you accept:
 * #.#####, which means 5 numbers after the decimals.
 *
 * The number can be negative or positive.
 *
 * @param  {number} fractionLength The length of the fraction which is considered valid.
 * @return {regex}                 A regex which checks for fraction numbers.
 */
export function fractionNumberRegex(fractionLength: number): RegExp {
  return new RegExp('^-?\\d+(\\.\\d{1,' + fractionLength + '})?$');
}

/**
 * A regex which checks for a positive or negative number
 * without fractions.
 */
export const numberRegex: RegExp = /^-?\d+$/;
