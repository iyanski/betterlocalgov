import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGES, PLANNED_LANGUAGES } from './languages';
import en from '../../public/locales/en/common.json';
import ilo from '../../public/locales/ilo/common.json';
import ibg from '../../public/locales/ibg/common.json';

type Tree = { [key: string]: string | Tree };

function leafPaths(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object'
      ? leafPaths(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

function leafValues(tree: Tree): string[] {
  return Object.values(tree).flatMap(value =>
    typeof value === 'object' ? leafValues(value) : [value]
  );
}

const withoutMeta = ({ _meta, ...rest }: Tree & { _meta?: unknown }) => {
  void _meta;
  return rest as Tree;
};

describe('available locale resources', () => {
  it('offers English only until additional locale resources are approved', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(Object.keys(LANGUAGES)).toEqual(['en']);
    expect(LANGUAGES.en.nativeName).toBe('English');
  });
});

describe('planned languages', () => {
  it('lists fil, ilo and ibg, all disabled and none selectable', () => {
    expect(Object.keys(PLANNED_LANGUAGES).sort()).toEqual([
      'fil',
      'ibg',
      'ilo',
    ]);
    for (const language of Object.values(PLANNED_LANGUAGES)) {
      expect(language.enabled).toBe(false);
      expect(Object.keys(LANGUAGES)).not.toContain(language.code);
    }
  });

  it('marks drafts as needing human review and ibg as a placeholder', () => {
    expect(PLANNED_LANGUAGES.ilo.reviewStatus).toBe('needs_review');
    expect(PLANNED_LANGUAGES.fil.reviewStatus).toBe('needs_review');
    expect(PLANNED_LANGUAGES.ibg.reviewStatus).toBe('placeholder');
  });
});

describe('locale scaffolds', () => {
  it('keeps the Ilocano scaffold key-for-key with English and entirely empty', () => {
    const scaffold = withoutMeta(ilo as unknown as Tree);

    expect(leafPaths(scaffold).sort()).toEqual(leafPaths(en as Tree).sort());
    // No translation, machine or otherwise, has been drafted.
    expect(leafValues(scaffold).every(value => value === '')).toBe(true);
  });

  it('marks the scaffolds as unreviewed with no approver', () => {
    expect(ilo._meta.reviewStatus).toBe('needs_review');
    expect(ilo._meta.approvedBy).toBeNull();
    expect(ibg._meta.reviewStatus).toBe('placeholder');
    expect(ibg._meta.approvedBy).toBeNull();
  });

  it('gives the Ibanag placeholder no strings', () => {
    expect(Object.keys(ibg)).toEqual(['_meta']);
  });
});
