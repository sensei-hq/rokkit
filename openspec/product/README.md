# Product homes

Product vision and requirements live in `docs/features/` — that directory is
canonical and unchanged by the openspec migration. This file maps product areas
to their homes so a change proposal can cite them.

| Area                  | Home                                              |
| --------------------- | ------------------------------------------------- |
| Data Binding          | `docs/features/01-DataBinding.md`                 |
| Composability         | `docs/features/02-Composability.md`               |
| Theming & Design      | `docs/features/03-ThemingAndDesign.md`            |
| Accessibility & i18n  | `docs/features/04-AccessibilityAndI18n.md`        |
| Forms                 | `docs/features/05-Forms.md`                       |
| Component Library     | `docs/features/06-ComponentLibrary.md`            |
| Charts                | `docs/features/07-Charts.md`                      |
| Developer Utilities   | `docs/features/08-DeveloperUtilities.md`          |
| Toolchain             | `docs/features/09-Toolchain.md`                   |

Product principles (Data-First, Composable, Consistent API, Accessible,
Themeable) are stated in `openspec/project.md` and `agents/memory.md`.

When a change alters product scope or vision, update the relevant
`docs/features/` file as part of the change — the openspec proposal cites it,
it does not fork it.
