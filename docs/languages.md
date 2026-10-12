# Languages

Only English (`en`) is enabled. `src/i18n/languages.ts` is the single registry:

- `LANGUAGES` lists what a visitor can select. The navbar selector and i18next's `supportedLngs` are both derived from it.
- `PLANNED_LANGUAGES` lists scaffolded languages that are **disabled**: Filipino (`fil`), Ilocano (`ilo`) and Ibanag (`ibg`). They are not selectable and i18next rejects them.

## Scaffolds

| Language | Resource                                                 | State                                                     |
| -------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `fil`    | `src/i18n/locales/fil.json` (unused starter-kit strings) | `needs_review`; not wired to the runtime loader           |
| `ilo`    | `public/locales/ilo/common.json`                         | `needs_review`; every key from English, every value empty |
| `ibg`    | `public/locales/ibg/common.json`                         | `placeholder`; no strings                                 |

No translation has been drafted for Ilocano or Ibanag. Empty values fall back to English (`returnEmptyString: false`).

## Rules

- Do not publish machine-translated civic content (services, government pages, hotlines, requirements, fees, procedures).
- UI strings may be drafted, but they must carry `"reviewStatus": "needs_review"` in `_meta` and stay disabled until a fluent human speaker approves them. Record the approver in `_meta.approvedBy` in the same change that enables the language.
- To enable a language: move its entry from `PLANNED_LANGUAGES` to `LANGUAGES`, add the approved locale file, and update `src/i18n/languages.test.ts`. Civic content pages are still English-only; the language selector translates interface text only.
