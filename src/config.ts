export interface Config {
  // The URL which will provide the constraints over a GET request.
  constraintsUrl: string;
}

let config: Config | null = null;

/**
 * Configures the Constraint libary.
 *
 * @param {Config} c The new configuration
 */
export function configureConstraint(c: Config): void {
  config = c;
}

/**
 * Either returns the a Config or throws an error when the
 * config is not yet initialized.
 *
 * @returns The Config
 */
export function getConfig(): Config {
  if (config === null) {
    throw new Error('The constraint service is not initialized.');
  } else {
    return config;
  }
}
