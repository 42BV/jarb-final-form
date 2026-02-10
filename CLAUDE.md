# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@42.nl/jarb-final-form` is a library that bridges JaRB (Java database constraint validation) with react-final-form. It fetches validation constraints from a Spring Boot backend and auto-applies them as validators on form fields.

## Commands

- **Full test suite (lint + typecheck + coverage):** `npm test`
- **Unit tests only:** `npm run test:coverage`
- **Single test file:** `npx vitest run tests/validators.test.ts`
- **Watch mode:** `npm start`
- **Typecheck:** `npm run test:ts`
- **Lint:** `npm run lint`
- **Build (compile to lib/):** `npm run tsc`
- **Release:** `npm run release` (builds then runs `np`)

## Code Style

- Prettier: single quotes, no trailing commas
- ESLint: flat config with typescript-eslint, react, vitest, and prettier plugins
- Pre-commit hook (husky + lint-staged) auto-formats staged files in `src/` and `tests/`
- Zero ESLint warnings allowed (`--max-warnings=0`)
- **100% test coverage required** (branches, functions, lines, statements)

## Architecture

### Core Flow

1. **Config** (`config.ts`) — `configureConstraint({ constraintsUrl })` sets the endpoint URL
2. **Constraints** (`constraints.ts`) — `loadConstraints()` fetches the constraint JSON from the backend via `@42.nl/spring-connect`'s `get()`. Constraints are cached in a module-level variable, accessed via `getConstraints()`/`setConstraints()`
3. **JarbField** (`JarbField.tsx`) — React component wrapping `@42.nl/final-form-field-validation`'s `Field`. Reads constraints at render time and auto-builds a validators array based on the field's constraint properties (required, minLength, maxLength, min, max, number/fraction patterns)
4. **Validators** (`validators.ts`) — Factory functions (`makeRequired`, `makeMinimumLength`, etc.) that return `FieldValidator<any>` functions. Each returns a Promise resolving to a typed error object or undefined
5. **Utils** (`utils.ts`) — Constraint lookup helpers. `getFieldConstraintsFor(validator, constraints)` parses `"ClassName.fieldName"` format strings. `mostSpecificInputTypeFor()` resolves the most specific HTML input type from a types array

### Key Types

- **Constraints** (`models.ts`) — `{ [className: string]: { [fieldName: string]: FieldConstraints } }`
- **ValidationError** (`errors.ts`) — Discriminated union of typed error objects (`ERROR_REQUIRED`, `ERROR_MINIMUM_LENGTH`, etc.), each with `type`, `label`, `value`, and `reasons`
- **JarbProps** — `{ validator: "ClassName.fieldName", label: string }` passed via the `jarb` prop on `JarbField`

### Validator String Format

The `validator` prop uses `"ClassName.fieldName"` format (e.g., `"SuperHero.name"`). The class name maps to a top-level key in the constraints JSON; the field name maps to a nested key.

### Peer Dependencies

Requires `@42.nl/spring-connect`, `@42.nl/final-form-field-validation`, `final-form`, and `react-final-form` as peer dependencies.

## Testing

- Tests live in `tests/` (not co-located with source)
- Vitest with jsdom environment, globals enabled
- `tests/setupTests.ts` clears and resets all mocks before each test
- The index barrel test uses `toMatchSnapshot` — update snapshots with `npx vitest run -u` when exports change
