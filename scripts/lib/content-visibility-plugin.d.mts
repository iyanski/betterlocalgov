/** Types for content-visibility-plugin.mjs. */
import type { Plugin } from 'vite';

export declare const HIDDEN_RECORD_JSON: string;
export declare const HIDDEN_MARKDOWN_MODULE: string;

export declare function classifyContentFile(
  contentRoot: string,
  file: string,
  allowSourced: boolean
): { kind: 'index' | 'json' | 'markdown'; public?: boolean } | undefined;

export declare function filterIndexYaml(
  indexFile: string,
  source: string,
  allowSourced: boolean
): string;

export declare function contentVisibilityPlugin(options: {
  root: string;
  allowSourced: boolean;
}): Plugin;
