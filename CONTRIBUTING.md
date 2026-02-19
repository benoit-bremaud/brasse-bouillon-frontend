# Contributing

## Roadmap Sync Contract

All pull requests must include roadmap metadata in the PR body using this exact block:

## Roadmap Sync (website)

<!-- ROADMAP_SYNC_START -->

user_facing: yes|no
phase: 1-10
impact_type: feature|fix|security
summary_fr: <1-2 lignes>
summary_en: <1-2 lignes>
evidence_links: <comma-separated urls>

<!-- ROADMAP_SYNC_END -->

### Metadata rules

- `user_facing`: `yes` or `no`
- `phase`: integer from `1` to `10`
- `impact_type`: `feature`, `fix`, or `security`
- `summary_fr` / `summary_en`: short, meaningful summaries (1-2 lines)
- `evidence_links`: comma-separated `http(s)` URLs

### CI enforcement

- Workflow `validate-roadmap-metadata.yml` validates the block on PRs targeting `develop` and `main`.
- Invalid metadata fails the workflow (blocking if required by branch protection).
- Label `roadmap:user-facing` is managed automatically from `user_facing`.

### Website dispatch

Workflow `dispatch-roadmap-update.yml` sends `repository_dispatch` to:

- repo: `benoit-bremaud/brasse-bouillon-website`
- event_type: `roadmap_user_facing_update`

Dispatch runs only when:

1. PR is merged,
2. base branch is `main`,
3. `user_facing` is `yes`,
4. metadata is valid.

Required secret: `WEBSITE_DISPATCH_TOKEN`.
