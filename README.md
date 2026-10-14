# AppKade Open

**Build together. Grow together.** Public AppKade open-source projects and GitHub-verifiable contributor recognition.

- Site: https://open.appkade.lk (custom domain pending launch)
- Cloudflare preview: https://appkade-open.pages.dev (available after first successful deployment)
- Repository: https://github.com/AppKade/open

## Stack

Astro static output, Starlight docs with the original Lucode theme, Cloudflare Pages, Cloudflare Pages Functions, D1, Cloudflare Turnstile. GitHub is the source of truth for projects and contribution history. D1 stores anonymous project votes only.

## Development

Requires Node.js 22.12+ and pnpm 10.

```sh
corepack enable
pnpm install
pnpm dev
pnpm test
pnpm check
pnpm build
```

API preview with local SQLite persistence:

```sh
pnpm db:local
pnpm build
pnpm preview
```

### Project registry

Edit `data/projects.json` with verified public repositories owned by the AppKade organization. Include the **numeric** GitHub repository ID. New projects require a working README and actual installation instructions; do not invent release or contributor metrics. `pnpm sync` generates `data/contributors.json` and `data/activity.json` from GitHub's merged PRs. CI sync runs daily without pushing generated files back to git.

PR labels recognized for scoring: `type:feature`, `type:fix`, `type:docs`, `type:test`; others receive 3 points. First accepted PR adds 5 points, bot PRs are excluded and one PR is counted once. See `/docs/contributing/`.

### D1 voting

Provisioned database `appkade-open`, region APAC, D1 binding `DB`. Migration: `migrations/0001_votes.sql`. On Cloudflare execute migrations explicitly using `pnpm db:remote`. Apply migration locally via `pnpm db:local`. `published_projects` is an allowlist; only verified registered projects may be voted on.

Create Turnstile widget with hostname `open.appkade.lk` (and your preview domain if using a preview), then set `PUBLIC_TURNSTILE_SITEKEY` for the build and `TURNSTILE_SECRET` and `VOTE_COOKIE_SECRET` for Pages Functions. Never commit secrets. Voting uses Turnstile siteverify, same-origin requests, signed HttpOnly identity cookies and SQL uniqueness constraints. Anonymous cookies are not one-person-one-vote; votes are a community interest signal only. Verify production hostname and Turnstile configuration before making voting public.

### CI/CD

`ci.yml` validates pull requests and main. `deploy.yml` syncs GitHub, tests, builds and uploads via Wrangler Direct Upload on main, daily at 02:15 UTC and manually. Add GitHub Actions repository secrets `CLOUDFLARE_API_TOKEN` (Cloudflare Pages Edit scope) and `CLOUDFLARE_ACCOUNT_ID` (your Cloudflare account ID). A Cloudflare Git integration is **not** used, to avoid duplicate builds. Deploy only from the main branch; untrusted PRs receive no production secrets.

## Scope and boundaries

No marketplace database, no AppKade accounts, no extra auth provider, and no admin app. No implicit publishing of all organization repositories. Future community records can be added to D1 via reviewed migrations only.

## Project governance

- [CONTRIBUTING](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Architecture](ARCHITECTURE.md)

## License

MIT license for this website's original code. Repository licenses for other projects are independent.
