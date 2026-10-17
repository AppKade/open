# AppKade Open

**Build together. Grow together.** Public AppKade open-source projects and GitHub-verifiable contributor recognition.

- Site: https://open.appkade.lk
- Cloudflare preview: https://appkade-open.pages.dev
- Repository: https://github.com/AppKade/open

This repository is open source and welcomes contributions from anyone: code, design, documentation, bug reports and ideas. Merged pull requests to registered AppKade repositories, including this one, earn recognition on the site. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Stack

A single-page Astro site, self-hosted Inter fonts, Cloudflare Pages, Pages Functions, D1, and Cloudflare Turnstile. GitHub is the source of truth for projects and contribution history. D1 stores anonymous project votes only.

## Quick start

Requires Node.js 22.12+ and pnpm 10.

```sh
git clone https://github.com/AppKade/open.git
cd open
corepack enable
pnpm install
pnpm dev
```

Before opening a pull request, run the same checks as CI:

```sh
pnpm test     # all tests (node --test tests/*.test.mjs)
pnpm check    # type checking (astro check)
pnpm build    # static build into dist/
```

Run a single test file with `node --test tests/scoring.test.mjs`.

To preview the voting API with local SQLite persistence:

```sh
pnpm db:local
pnpm build
pnpm preview
```

Voting needs Turnstile and cookie secrets (see `.env.example`); without them the rest of the site works normally and vote widgets show as unavailable.

## Repository layout

| Path | What lives there |
| :-- | :-- |
| `src/pages/index.astro` | The whole public page. Other pages only redirect legacy URLs. |
| `src/styles/open.css` | All styles. |
| `src/scripts/` | Client scripts: starfield and motion toggle (`motion.ts`), WebGL hero black hole (`singularity.ts`). |
| `src/components/` | `Brand` and the per-project `Vote` widget. |
| `src/lib/` | Data loading and the contributor scoring rules. |
| `data/` | Project registry and generated contributor snapshots. |
| `scripts/sync-github.mjs` | Builds contributor data from merged GitHub PRs. |
| `functions/api/votes/` | Cloudflare Pages Function for votes. |
| `migrations/` | D1 schema and the voting allowlist. |
| `tests/` | Node test runner suites. |
| `docs/` | Recognition policy. |

## Project registry

Edit `data/projects.json` with verified public repositories owned by the AppKade organization. Include the **numeric** GitHub repository ID. New projects require a working README and actual installation instructions; do not invent release or contributor metrics. To make a project votable, also add a numbered migration in `migrations/` that inserts its `repo_id` and `slug` into `published_projects`.

`pnpm sync` generates `data/contributors.json` and `data/activity.json` from GitHub's merged PRs. The deploy workflow syncs before every build without pushing generated files back to git, so do not commit sync output.

## Contributor recognition

PR labels recognized for scoring: `type:feature` (10), `type:fix` (8), `type:docs` (5), `type:test` (5); other merged PRs receive 3 points. A contributor's first accepted PR adds 5 points, bot PRs are excluded and one PR is counted once. See [docs/recognition.md](docs/recognition.md) and the expandable contribution policy on the homepage.

## D1 voting

Provisioned database `appkade-open`, region APAC, D1 binding `DB`. Migrations live in `migrations/`. On Cloudflare execute migrations explicitly using `pnpm db:remote`. Apply migrations locally via `pnpm db:local`. `published_projects` is an allowlist; only verified registered projects may be voted on.

Create a Turnstile widget with hostname `open.appkade.lk` (and your preview domain if using a preview), then set `PUBLIC_TURNSTILE_SITEKEY` for the build and `TURNSTILE_SECRET` and `VOTE_COOKIE_SECRET` for Pages Functions. Never commit secrets. Voting uses Turnstile siteverify, same-origin requests, signed HttpOnly identity cookies and SQL uniqueness constraints. Anonymous cookies are not one-person-one-vote; votes are a community interest signal only.

## CI/CD

`ci.yml` runs tests, type checking and the build on pull requests and `main`. `deploy.yml` syncs GitHub, tests, builds and uploads via Wrangler Direct Upload on `main`, daily at 02:15 UTC and manually. It needs the GitHub Actions secrets `CLOUDFLARE_API_TOKEN` (Cloudflare Pages Edit scope) and `CLOUDFLARE_ACCOUNT_ID`. A Cloudflare Git integration is **not** used, to avoid duplicate builds. Deploy only from `main`; untrusted PRs receive no production secrets.

## Single-page UI

Projects, local setup, contribution guidance, contributor histories, and recent merged PRs live on `/`. Navigation uses native section anchors and details disclosures. Legacy project, contributor, ranking, and documentation URLs redirect to the matching sections. All-time points and contribution histories remain backed by GitHub snapshots.

`src/styles/open.css` owns the public UI. The AppKade mark in `public/favicon.svg` matches the marketplace logo geometry and original green colours; the Open label stays separate. The hero background is an animated WebGL black hole (adapted from XorDev's "Singularity" shader) that pauses with the "Pause motion" control or reduced-motion settings and falls back to a CSS glow without WebGL. The strip below the hero is reserved for a future moving row of contributor profiles. Voting challenges render only when their disclosure is opened, and every project retains its own widget and vote state.

## Scope and boundaries

No marketplace database, no AppKade accounts, no extra auth provider, and no admin app. No implicit publishing of all organization repositories. Future community records can be added to D1 via reviewed migrations only.

## Project governance

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Architecture](ARCHITECTURE.md)
- [Recognition policy](docs/recognition.md)

## License

MIT license for this website's original code. Repository licenses for other projects are independent.
