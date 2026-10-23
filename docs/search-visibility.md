# Search and AI discovery

AppKade Open remains a single-page, static site. Its canonical indexable URL is
https://open.appkade.lk/. Project anchors are sections, not separate indexable pages.
Legacy URLs redirect to homepage sections; unknown URLs must return HTTP 404.

## Implemented

- Descriptive title, description, canonical URL, social image metadata and large
  image/snippet preview permissions. Error pages use `noindex` and have no canonical.
- Server-rendered project descriptions, repository links, setup instructions and
  factual FAQ answers. Core content does not require JavaScript.
- Connected Organization, WebSite, CollectionPage/FAQPage and SoftwareSourceCode
  entities. FAQ HTML and schema share one data source in `src/lib/seo.ts`.
  No reviews, endorsements or ratings are inferred from votes or contributor points.
- A sitemap containing only the canonical homepage. There is deliberately no
  automatically refreshed `lastmod`: rebuilding is not proof that content changed.
- Explicit search and user-requested retrieval permissions in `public/robots.txt`,
  including `/api/` exclusions in every applicable group. The exact same user-agent
  groups can occur in Cloudflare's prepended robots content. RFC 9309 combines
  matching groups and chooses Allow on equal-specificity ties. Training restrictions
  supplied by Cloudflare remain in place. Do not add a firewall bypass based only on
  a user-agent string, which can be spoofed.
- Lazy-loaded decorative project illustrations with fixed dimensions and a preload
  for the main heading font. Existing reduced-motion behavior is retained.
- IndexNow submission after a successful production deployment. The script first
  verifies the ownership file on the canonical hostname. Submission failures are
  visible in Actions but do not undo an otherwise successful website deployment.
- `node scripts/check-seo.mjs` validates built HTML, schema/FAQ parity, project
  coverage, canonical/sitemap consistency, robots, previews and the Analytics tag.
  It runs after the build in both CI and deployment.

## Search engine accounts

Analytics collection is separate from search indexing. The existing Bing ownership
file is retained; a deployed file alone does not prove account verification.

1. In Google Search Console, use a verified `appkade.lk` Domain property (which
   covers subdomains) or add `https://open.appkade.lk/` as a URL-prefix property.
   Submit `https://open.appkade.lk/sitemap.xml`, inspect the canonical homepage and
   request indexing. Check indexing status and actual query impressions afterward.
2. In Bing Webmaster Tools, verify this hostname using the existing BingSiteAuth.xml
   file or import the verified Search Console property. Submit the sitemap and
   check URL Inspection. IndexNow is already notified on future deployments.
3. Monitor impressions, clicks and query relevance; use GA4 for on-site behavior.
   Search Console and Bing account actions require authenticated webmaster access.

## Content maintenance

Keep `data/projects.json` consistent with repository READMEs and licenses. Describe
what runs today and distinguish previews, synthetic data and planned features.
Add useful examples and evidence as projects mature. Discuss substantive project
pages before changing the single-page architecture; do not create thin pages just
to target search variations. Earn relevant links through real documentation and
community contributions rather than automated directory or forum submissions.

There is no promise of ranking, inclusion in AI answers, or indexing. FAQ markup
does not imply FAQ rich-result eligibility. IndexNow receipt is not index inclusion.
No special AI text file or markup is required by Google, so this implementation
focuses on accessible HTML and accurate content rather than an `llms.txt` ranking claim.

## References

- [Google: AI search optimization](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: search essentials](https://developers.google.com/search/docs/essentials)
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [IndexNow protocol](https://www.indexnow.org/documentation)
- [Robots Exclusion Protocol, RFC 9309](https://www.rfc-editor.org/rfc/rfc9309)
