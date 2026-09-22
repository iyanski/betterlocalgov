import type { MarkdownContent } from './markdownLoader';

const legacyLocalityPattern = /Lapu[\s-]?Lapu/i;

export function sanitizeLegacyServiceContent(
  content: MarkdownContent
): MarkdownContent {
  if (!legacyLocalityPattern.test(content.content)) return content;

  return {
    ...content,
    title: 'Service guide pending verification',
    description:
      'Gattaran-specific service information has not yet been verified.',
    content:
      '# Service guide pending verification\n\nThe inherited guide for this topic refers to another locality, so Better Gattaran does not display it as local information. Requirements, fees, schedules, contacts, and procedures will be published after verification with an authoritative source.',
  };
}
