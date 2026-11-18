# Tasks: prune-dead-exports-and-shims

- [ ] 1. Re-run the D14-D17 verify greps per symbol
- [ ] 2. Exclude icons `lib/**` shims from published `files` (leave
  source in place pending maintainer sign-off on deletion)
- [ ] 3. Delete the states constants and the D16 dead exports
- [ ] 4. Un-export the D17 intra-file helpers
- [ ] 5. Run packaging checks for touched packages plus the full test
  suite green
