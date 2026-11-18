# Tasks: prune-unused-deps-chart-forms-cli

- [ ] 1. Re-run the D1/D2/D3 verify greps to confirm zero imports
- [ ] 2. Drop the unused deps/devDeps from the chart, forms, and cli
  manifests and update chart `README.md:167-168`
- [ ] 3. Regenerate `bun.lock`
- [ ] 4. Run `bun install --frozen-lockfile`, lint, and the full test
  suite green
