/**
 * Runs IN THE PAGE CONTEXT of https://psc.gov.ph/psc_site/transparency-seal/
 * (via mcp__claude-in-chrome__javascript_tool), not under node.
 *
 * Cloudflare 403s every shell HTTP client on this host, so the only way to read
 * the seal page is from a real browser session. Walks the content tree in
 * document order, tracking the heading hierarchy, and emits one record per
 * document link. Triggers a download of psc-links.json because the MCP tool
 * truncates its return value at ~1.3 KB.
 */
(() => {
  const DOC = /\.(pdf|xlsx?|docx?|csv)(\?|#|$)/i;
  const root =
    document.querySelector('.entry-content, article, main, #content') ||
    document.body;

  const links = [];
  const stack = []; // [{ level, text }]
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const tag = n.tagName;

    if (/^H[1-6]$/.test(tag)) {
      const text = n.innerText.trim().replace(/\s+/g, ' ');
      if (!text) continue;
      // Every heading on this page is an <h4>; the real hierarchy is in the
      // text prefix -- "II. Annual Financial Reports" is a section, "a. FAR
      // No.1 ..." is a subsection of it. Derive the level from the prefix.
      const level = /^[IVXLC]+\s*\./.test(text)
        ? 1
        : /^[a-z]\s*\./.test(text)
          ? 2
          : 1;
      while (stack.length && stack[stack.length - 1].level >= level)
        stack.pop();
      stack.push({ level, text });
      continue;
    }

    if (tag === 'A' && n.href && DOC.test(n.href)) {
      // The seal page nests subsections ("a. FAR No.1 …") under roman-numeral
      // sections ("II. Annual Financial Reports"). Keep both.
      const heads = stack.filter(h => h.text !== 'GOVPH');
      links.push({
        label: n.innerText.trim().replace(/\s+/g, ' '),
        href: n.href,
        title: (n.getAttribute('title') || '').trim() || null,
        sealSection: heads[0] ? heads[0].text : null,
        subsection: heads.length > 1 ? heads[heads.length - 1].text : null,
        headingPath: heads.map(h => h.text),
      });
    }
  }

  const payload = {
    harvestedAt: new Date().toISOString(),
    pageUrl: location.href,
    pageTitle: document.title,
    totalAnchors: document.querySelectorAll('a[href]').length,
    links,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: 'psc-links.json',
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);

  const unique = new Set(links.map(l => l.href)).size;
  return `harvested ${links.length} links (${unique} unique) under ${
    new Set(links.map(l => l.sealSection)).size
  } sections -> psc-links.json`;
})();
