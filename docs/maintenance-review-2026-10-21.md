# Public repository maintenance review, 21 October 2026

Scope: all six public AppKade repositories registered in `data/projects.json`. The private `actions` and `demo-repository` repositories are outside this collection. Review changes are proposed separately for each repository; this report does not imply they have merged or deployed.

## Changes prepared

| Repository | Verified gap and proposed change | Local checks |
|---|---|---|
| Open | Bound vote bodies while streaming; reject non-object JSON; bind Turnstile results to hostname/action; parse signed cookies without depending on separator whitespace; recover timed-out challenges; frozen CI installs; show license terms and add the missing mixed-license file | 4 tests; Astro check and production build |
| Legacy Bridge | Share DTD/size policy across inspection and validation; require WSDL/XSD namespaces; ignore extension operations; reject non-files; fix native Windows path confinement; inventory message parts; lock dependencies | TypeScript, 13 tests, production build |
| LankaQR CLI | Decode templates in parent context, including `62[50..99]`; preserve opaque merchant subfields; reject invalid runtime initiation, amount types, profiles and render formats; lock dependencies and document the actual Node minimum | TypeScript, 27 tests, production build |
| Singularity | Stop scheduling frames at speed zero; make destruction idempotent and prevent resurrection; validate colors before GPU acquisition or state changes; ignore malformed shared colors and parse boolean hash flags | 5 tests, including mocked lifecycle and shared-link behavior |
| LK Tax MCP | Add the missing contributor entry point and governance/check instructions; cover trailing line separators in money/schema regression checks | 108 tests; type, runtime capability, rules, contract and payment-catalogue checks |
| LK Transit MCP | Replace the empty README; add a gated synthetic stdio prototype with five read-only tools and coverage resource; validate snapshots atomically; add ID/distance/freshness foundations, source inventory, Apache-2.0/NOTICE, contribution/security docs, CI and roadmap | TypeScript, 8 tests, including actual legacy and modern stdio journeys |

The tax newline concern investigated during the review did **not** reproduce. Existing money validation already rejects those inputs. No tax calculation, rule, interface or version was changed.

## Remaining priorities

### Legacy Bridge

The largest product gap is still the WSDL/XSD semantic resolver. Current inventory and XML/import checks do not resolve QName references, schema types, SOAP bindings or security policies. Follow it with deterministic MCP generation, deny-by-default operation policy, SOAP mock fixtures and fault/auth tests. Do not present current `validate` success as contract certification.

### LankaQR CLI

The CLI handles developer inspection and synthetic examples, not verified bank routing. Full national-scheme field rules, independently sourced conformance fixtures, acquirer/issuer compatibility and a reviewed release remain outstanding. Keep generation synthetic and publishing private. Further profile work needs normative evidence rather than inferred payment behavior.

### LK Tax MCP

The existing implementation has extensive deterministic and protocol coverage. The next blockers are evidence and independent review: instalment rounding, remaining primary-source fixtures, donation/foreign allocation ambiguities, filing-obligation law, missing verifier/cage details and payment-flow field mapping. License selection, host evaluations, provenance/signing and public-release ownership are still pending. Contributor documentation explicitly preserves these gates.

### LK Transit MCP

The proposed prototype is an invented local network, not a live integration. Next: authorized source records, bounded GTFS ingestion with service calendars/timezones, then GTFS-Realtime with observation-based freshness and orphan quarantine. Real vehicles/alerts, routing, ETA quality, persistent storage and remote deployment remain unimplemented. Do not claim Sri Lankan coverage from demo fixtures. Update the website registry's planned status/setup only after the prototype PR is reviewed and merged.

### Open and Singularity

Singularity's adapted component and Open's hero shader retain CC BY-NC-SA 3.0 restrictions; they are not unrestricted commercial-use components. No license replacement or rights grant is inferred. Open now records current license state per repository, including the presently unspecified tax/transit licenses on their main branches. Transit proposes Apache-2.0 in its separate review branch, following its requirements.

Remaining platform work includes real deployed vote/D1/Turnstile integration verification, larger contributor-sync history fixtures, browser/GPU context-loss restoration testing for Singularity and a review of shader suitability for intended reuse. This pass does not change D1 data, publish npm packages, merge PRs or deploy production.

## Validation limits

Local execution used Node.js 24 on Linux. Cross-platform/Node 22 runs belong to repository CI. Astro check had zero errors and warnings, plus one existing unused-variable hint in a motion test. Browser screenshots could not be captured because the installed Playwright runtime has no Chromium executable; DOM mocks and builds are not visual or GPU verification. The managed local pnpm wrapper rejected dependency build approval; Open's installed package binaries were used directly for passing Astro check/build. CI retains the repository's pnpm 10 pin and frozen lockfile.

No paid services, provider accounts, real taxpayer records, actual passenger telemetry or production database changes were used.
