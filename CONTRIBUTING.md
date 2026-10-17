# Contributing to AppKade Open

Thanks for contributing! AppKade Open is open to everyone: fixes, features, design polish, documentation, tests, bug reports and ideas are all welcome. Open an issue first for large changes, and keep each PR focused.

## Getting set up

You need Node.js 22.12+ and pnpm 10.

1. Fork https://github.com/AppKade/open and clone your fork.
2. Install and run the site:
   ```sh
   corepack enable
   pnpm install
   pnpm dev
   ```
3. Create a branch for your change, for example `fix/vote-status-text` or `docs/readme-setup`.

The [README](README.md) explains the repository layout, and [ARCHITECTURE.md](ARCHITECTURE.md) explains how data, scoring and voting fit together.

## Before you open a pull request

Run the same checks as CI. All three must pass:

```sh
pnpm test
pnpm check
pnpm build
```

Run one test file with `node --test tests/<name>.test.mjs`. If you change `src/scripts/motion.ts` or the script in `src/components/Vote.astro`, update the DOM mocks in the matching test as needed.

For visual changes, include before and after screenshots (desktop and mobile) in the PR, and check that animations stop with the "Pause motion" button and with reduced motion enabled.

## Pull request guidelines

- Use `main` as the pull request target.
- Commit under your own git identity. Points are credited to the GitHub account that authors the merged PR.
- Link a real issue and describe how reviewers can reproduce or test the change.
- Use `type:feature`, `type:fix`, `type:docs`, or `type:test` to categorize merged work, if applicable. Maintainers manage labels.
- Do not game the scoring by splitting trivial or empty work into multiple PRs.
- Do not commit tokens, private emails, personal data, generated build artifacts, or the output of `pnpm sync` (`data/contributors.json`, `data/activity.json`).
- Vulnerabilities should follow [SECURITY.md](SECURITY.md), not public issues.

## Adding a project

Add new projects only after their AppKade organization repositories are public and documented with a working README and real installation instructions. A project needs:

1. An entry in `data/projects.json`, including its numeric GitHub repository ID.
2. A new numbered migration in `migrations/` inserting its `repo_id` and `slug` into `published_projects`, so it can receive votes. Maintainers apply migrations manually.

## Recognition

Merged PRs on registered repositories, including this one, earn points and badges as described in [docs/recognition.md](docs/recognition.md). This is community collaboration; inclusion in the recognition list is voluntary. Request corrections or opt-out via repository issues.

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
