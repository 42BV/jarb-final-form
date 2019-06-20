import { fractionNumberRegex, numberRegex } from '../src/regex';

test('numberRegex', () => {
  expect(numberRegex.test('aap')).toBe(false);
  expect(numberRegex.test('100.0')).toBe(false);
  expect(numberRegex.test('24e')).toBe(false);
  expect(numberRegex.test('e52')).toBe(false);
  expect(numberRegex.test('2.5')).toBe(false);

  expect(numberRegex.test('9999')).toBe(true);
  expect(numberRegex.test('1')).toBe(true);
  expect(numberRegex.test('0')).toBe(true);
  expect(numberRegex.test('-1')).toBe(true);
  expect(numberRegex.test('-9999')).toBe(true);
});

test('fractionNumberRegex', () => {
  const regex = fractionNumberRegex(5);

  expect(regex.test('aap')).toBe(false);
  expect(regex.test('24e')).toBe(false);
  expect(regex.test('e52')).toBe(false);

  expect(regex.test('9999')).toBe(true);
  expect(regex.test('1')).toBe(true);
  expect(regex.test('0')).toBe(true);
  expect(regex.test('-1')).toBe(true);
  expect(regex.test('-9999')).toBe(true);

  expect(regex.test('0.0')).toBe(true);
  expect(regex.test('0.00')).toBe(true);
  expect(regex.test('0.000')).toBe(true);
  expect(regex.test('0.0000')).toBe(true);
  expect(regex.test('0.00000')).toBe(true);
  expect(regex.test('0.000000')).toBe(false);

  expect(regex.test('-1.0')).toBe(true);
  expect(regex.test('-1.00')).toBe(true);
  expect(regex.test('-1.000')).toBe(true);
  expect(regex.test('-1.0000')).toBe(true);
  expect(regex.test('-1.00000')).toBe(true);
  expect(regex.test('-1.000000')).toBe(false);

  expect(regex.test('9999.0')).toBe(true);
  expect(regex.test('9999.00')).toBe(true);
  expect(regex.test('9999.000')).toBe(true);
  expect(regex.test('9999.0000')).toBe(true);
  expect(regex.test('9999.00000')).toBe(true);
  expect(regex.test('9999.000000')).toBe(false);

  expect(regex.test('-9999.0')).toBe(true);
  expect(regex.test('-9999.00')).toBe(true);
  expect(regex.test('-9999.000')).toBe(true);
  expect(regex.test('-9999.0000')).toBe(true);
  expect(regex.test('-9999.00000')).toBe(true);
  expect(regex.test('-9999.000000')).toBe(false);

  expect(regex.test('0.1')).toBe(true);
  expect(regex.test('0.12')).toBe(true);
  expect(regex.test('0.123')).toBe(true);
  expect(regex.test('0.1234')).toBe(true);
  expect(regex.test('0.12344')).toBe(true);
  expect(regex.test('0.123456')).toBe(false);
});
