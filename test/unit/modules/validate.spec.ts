import { isValidValue } from '@/utils/validate';

describe('HelloWorld', () => {
  it('can validate value', () => {
    expect(isValidValue(null)).toBe(false);
    expect(isValidValue(0)).toBe(true);
  });
});
