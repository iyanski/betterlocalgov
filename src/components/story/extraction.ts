/**
 * How a published figure was obtained.
 *
 * Kept out of SourceNote.tsx so that file only exports a component (the
 * react-refresh lint rule), and because the pipeline's `provenance.method`
 * field uses exactly these names -- the wording below is what a reader sees
 * when a chart says how its numbers were read.
 */
export type ExtractionMethod =
  | 'pdf-text'
  | 'ocr'
  | 'ocr-repaired'
  | 'ai-verified'
  | 'transcribed'
  | 'derived';

export const METHOD_LABEL: Record<ExtractionMethod, string> = {
  'pdf-text': 'read from the PDF text layer',
  ocr: 'read by OCR from a scanned page',
  'ocr-repaired':
    'read by OCR, with a character corrected to make the arithmetic balance',
  'ai-verified': 'read again from the page image and checked',
  transcribed: 'transcribed by reading the document on screen',
  derived: 'calculated by us from other figures',
};

export interface SourceRef {
  label: string;
  url: string;
}
