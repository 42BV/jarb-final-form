import { getConfig } from './config';
import { Constraints } from './models';

let constraints: Constraints | undefined = undefined;

// Throw error when not 200 otherwise parse response.
function tryParse(response: Response): Promise<any> {
  if (response.status !== 200) {
    throw response;
  } else {
    return response.json();
  }
}

/**
 * Loads the constraints from the back-end.
 *
 * The URL it will send the request to is defined by the 'constraintsUrl'
 * from the Config object. The HTTP method it uses is 'get'.
 *
 * It will also send the credentials if 'needsAuthentication' from
 * the Config object is set to true.
 *
 * The entire response will be written to the `constraints` variable.
 * Whatever the JSON response is will be the constraints.
 *
 *  An example response:
 *
 * ```JSON
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
 *   }
 * }
 * ```
 *
 * @returns {Promise}
 */
export async function loadConstraints(): Promise<any> {
  const { constraintsUrl, needsAuthentication } = getConfig();
  const config: RequestInit = needsAuthentication
    ? { credentials: 'include' }
    : {};

  const response = await fetch(constraintsUrl, config);
  constraints = await tryParse(response);
}

/**
 * Sets the constraints.
 *
 * @param newConstraints The new constraints
 */
export function setConstraints(newConstraints: Constraints | undefined): void {
  constraints = newConstraints;
}

/**
 * Get the current constraints.
 *
 * @returns The current constraints
 */
export function getConstraints(): Constraints | undefined {
  return constraints;
}
