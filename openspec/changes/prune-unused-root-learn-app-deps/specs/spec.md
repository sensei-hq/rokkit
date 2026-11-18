# Spec: prune-unused-root-learn-app-deps

## Scenario: Root manifest drops dompurify

Given the change is merged
When the reviewer inspects root `package.json`
Then `dompurify` is absent
And `packages/blocks` and `packages/ui` still declare their own.

## Scenario: Learn manifest drops unused entries

Given the change is merged
When the reviewer inspects `apps/learn/package.json`
Then `@fontsource/open-sans`, `@fontsource/overpass`,
`@mlc-ai/web-llm`, `@iconify-json/mdi`, and `@vitest/browser` are absent
And the chat demo still loads the pinned CDN WebLLM build.

## Scenario: App manifest drops unused devDeps

Given the change is merged
When the reviewer inspects `packages/app/package.json`
Then `playwright`, `@testing-library/jest-dom`, and
`@testing-library/user-event` are absent
And `@vitest/browser` remains.

## Scenario: Install, build, and suite stay green

Given the change is merged
When `bun install --frozen-lockfile`, the learn build, and the full
test suite run
Then all pass.
