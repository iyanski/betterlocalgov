import fs from 'node:fs';
import path from 'node:path';

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

/**
 * Loads every companion/record JSON under content/ with its content ID
 * (the path relative to content/, without the extension).
 */
export function loadContentRecords(root = process.cwd()) {
  const contentRoot = path.join(root, 'content');
  return walk(contentRoot)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      contentId: path
        .relative(contentRoot, file)
        .slice(0, -'.json'.length)
        .split(path.sep)
        .join('/'),
      file: path.relative(root, file),
      record: JSON.parse(fs.readFileSync(file, 'utf8')),
    }));
}
