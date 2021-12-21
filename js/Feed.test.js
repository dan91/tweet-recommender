import Feed from './Feed';

test('adds 1 + 2 to equal 3', () => {
  const f = new Feed()
  expect(f.sum(1, 2)).toBe(3);
  });