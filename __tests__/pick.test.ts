import { pick } from '../src/pick';

test('it should pick props', () => {
  const result = pick({ a: 1, b: 2, c: 3, d: 4 }, ['a', 'd']);
  expect(result).toEqual({ a: 1, d: 4 });
});
