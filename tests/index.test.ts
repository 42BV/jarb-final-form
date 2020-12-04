import * as indexBarrel from '../src/index';

test('index barrel', () => {
  expect(indexBarrel).toMatchSnapshot('index-barrel');
});
