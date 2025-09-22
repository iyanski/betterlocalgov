Citizens can’t quickly complete basic government tasks online because LGU websites are organized around government structures, buried in PDFs, and hard to navigate especially on mobile and low bandwidth.

Symptoms
Task frustration: Apply / Report / Pay / Book takes too many clicks or isn’t online.
PDF sprawl: Information trapped in downloads; hard to search, read, and trust.
Inconsistent navigation: Each LGU uses different structures and labels.
Accessibility gaps: Barriers for screen readers, keyboard users, and low-bandwidth connections.
Out-of-date content: No visible owner or “last updated.”
Editor pain: No clear playbook for writing, updating, or retiring content.

Root Causes
Organization-first sites instead of people-first tasks.
No shared standards for labels, page patterns, and content quality.
PDF as default “CMS.”
Weak governance and limited capacity/training.

Why It Matters
Lower online completion and trust; more queues and phone calls.
Inequitable access for seniors, PWDs, and low-bandwidth users.
Operational strain from unclear guidance.
Duplicated spend building similar sites with no shared benefit.

---

What “Good” Looks Like (North Star)
People-first, task-first: Entry points are verbs-Apply / Report / Pay / Book / Find.
Clear topic hubs: Plain-language sections (e.g., Taxes, Permits & Licensing, Waste, Housing).
Consistent service pages: Always answer: What is it? Who qualifies? What do I need? How much? How do I do it online? Alternatives?
A–Z and great search: Two reliable ways to find anything.
Accessible by default: Screen-reader friendly, keyboard navigable, mobile and low-bandwidth ready.
Trust signals: Every page shows an owner and last updated.

Solution can be an open-source, static-first website template for Philippine LGUs that is people-first, fast, accessible, and easy to maintain. The template separates content from structure using Markdown for pages and JSON for structured data (sections, services, tasks, officials, etc.), enabling non-technical editors and community contributors to update content safely while preserving a consistent user experience.

Core approach

Architecture: Static site (e.g., Astro/Next SSG) with pre-rendered HTML for speed, reliability, and low hosting cost; no server dependency for MVP.

Information model: Standard JSON schemas for Sections → Services → Tasks, plus navigation, announcements, and contacts; Markdown pages with front matter for guidance/policies.

People-first UX: Built-in patterns for search with type filters, an A–Z of services, section hubs (top tasks), consistent service pages, and single-purpose task pages with clear CTAs (Apply/Report/Pay/Book).

Localization (i18n): Locale-aware routing and string files; language switcher; fallbacks (EN/FIL/local dialects) with SEO-compliant lang/hreflang.

Accessibility & performance by default: WCAG 2.2 AA patterns, semantic HTML, keyboard support, color contrast, low-JS budget, image optimization, Lighthouse/axe checks in CI.

Quality & governance: JSON schema validation, link checking, and accessibility tests in CI; visible owner and last_updated on every page; contribution guidelines, CODEOWNERS, and an RFC process.

Search: Build-time index (MiniSearch/Lunr) covering sections, services, tasks, and pages; filter by type.

Extensibility: Optional adapters (headless CMS, payments/booking stubs) and data export endpoints (/api/\*.json) for transparency dashboards.

Deliverables

Starter repo with template, components, and example data/content.
JSON Schemas + validators and editor playbook (plain-language + accessibility).
CI pipeline enforcing schemas, links, accessibility, and performance budgets.
