# Architecture

- **Source of truth:** curated `data/projects.json`; verified public GitHub API PRs/repositories at build time only.
- **Static routes:** Astro homepage, project pages, contributor profiles, all-time/monthly/newcomer leaderboards, Starlight documentation.
- **Dynamic route:** `GET|POST|DELETE /api/votes/:repo_id` served by a Cloudflare Pages Function with D1 binding `DB`.
- **D1 tables:** `published_projects` voting allowlist and `project_votes` (`repo_id`, hashed anonymous voter ID), unique by composite primary key.
- **Security:** authenticated Cloudflare Turnstile siteverify on every vote mutation; HMAC-signed Secure HttpOnly SameSite cookie; strict same-origin checks; no browser D1 access. Still susceptible to fresh browser identities and abuse, so do not use votes for formal elections or awards.
- **CI:** PR `test`, `check`, `build`; production `sync` + `build` + Wrangler upload after passing tests. D1 migrations are explicit/manual, not on untrusted pull requests.
- **Boundaries:** no dependency on AppKade Marketplace or admin production databases.

## Known tradeoffs

1. Daily GitHub snapshot rather than live API queries. Rankings may lag until the next publish.
2. `data/contributors.json` initially empty until first qualifying PR is merged and sync runs.
3. A visitor can clear the vote cookie to create another identity. Turnstile reduces, but cannot eliminate, vote manipulation.
4. GitHub's public user avatar image and contribution title are presented with links to GitHub; a user may opt out by numeric ID in `data/contributor-optouts.json`.
