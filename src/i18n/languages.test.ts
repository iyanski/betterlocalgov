import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGES } from './languages';

describe('available locale resources', () => {
  it('offers English only until additional locale resources are verified', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(Object.keys(LANGUAGES)).toEqual(['en']);
    expect(LANGUAGES.en.nativeName).toBe('English');
  });
});
