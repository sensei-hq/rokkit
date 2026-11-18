# Durable spec homes

Module design docs in `docs/design/` are canonical and unchanged by the
openspec migration. This file maps areas to their homes so a change proposal
can cite them.

| Area              | Home                                              |
| ----------------- | ------------------------------------------------- |
| Patterns          | `docs/design/01-patterns.md`                      |
| Components        | `docs/design/02-components.md` (+ `components/`)  |
| Forms             | `docs/design/03-forms.md`                         |
| Actions           | `docs/design/04-actions.md`                       |
| Website / learn   | `docs/design/05-website.md`                       |
| Testing           | `docs/design/06-testing.md`                       |
| Data              | `docs/design/08-data.md`                          |
| Theming           | `docs/design/09-theming.md`                       |
| Themes            | `docs/design/10-themes.md`                        |
| Inventory         | `docs/design/11-inventory.md`                     |
| Priority          | `docs/design/12-priority.md`                      |
| Effects           | `docs/design/13-effects.md`                       |
| Density           | `docs/design/14-density.md`                       |
| i18n              | `docs/design/15-i18n.md`                          |
| Whitelabeling     | `docs/design/16-whitelabeling.md`                 |
| Skin system       | `docs/design/17-skin-system.md`                   |
| State patterns    | `docs/design/18-state-patterns.md`                |
| Command system    | `docs/design/19-command-system.md`                |
| Chart             | `docs/design/20-chart.md`                         |
| Chart preset      | `docs/design/22-chart-preset.md`                  |
| Graph             | `docs/design/23-graph.md`                         |
| World view        | `docs/design/24-world-view.md`                    |
| Flow layout       | `docs/design/25-flow-layout.md`                   |
| Chat intents      | `docs/design/26-chat-intents.md`                  |
| Tools             | `docs/design/70-tools.md`, `71-tools.md`          |
| Traceability      | `docs/design/traceability.md`                     |

The pre-openspec design specs now in `openspec/changes/archive/` (see
`superpowers-specs/`) are historical: each shipped, and its durable knowledge
was carried forward into the design doc listed in the archive index
(`openspec/changes/archive/README.md`). When a change alters a design, update
the `docs/design/` home — never the archive.
