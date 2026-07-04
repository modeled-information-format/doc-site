---
title: "Reference: org site topology"
description: "Which repo serves which URL/path across the modeled-information-format org, how each one deploys, and the gotchas that have already bitten once — kept current as new sites are added."
---

# Reference: org site topology

The `modeled-information-format` org publishes several sites across
independent repos. This page is the single map of **which repo serves which
URL**, **how it deploys**, and the collision/composition gotchas that have
already caused real problems — kept current as new sites are added or
existing ones change deploy shape. Update this table in the same PR that
changes a repo's Pages config, `base` path, or deploy mechanism.

## The map

| Repo | Serves | Base path | Deploy mechanism | App used | Astro / Starlight |
| --- | --- | --- | --- | --- | --- |
| `MIF` | `https://mif-spec.dev/` (custom domain, CNAME) | `/` | Direct self Pages deploy (`deploy.yml`) | `ci` (fetches + attestation-verifies `ontologies`' signed release tarball before build, [ADR-019](https://github.com/modeled-information-format/MIF/blob/main/adr/ADR-019-deploy-time-attested-ontology-vendoring.md)) | 7.0.3 / 0.41.1 |
| `doc-site` | `https://modeled-information-format.github.io/docs/` | `/docs` | **No self deploy** — has no Pages of its own; built fresh and composed by `modeled-information-format.github.io`'s own `deploy.yml` on every run | none directly (the composing repo's job uses `pages`) | 6.4.6 / 0.40.0 |
| `.github` | root content only (`index.html`, favicon) | `/` | Not deployed from here — `has_pages: true` is a stale, orphaned toggle (no `deploy-pages` workflow in this repo at all); its content is checked out and composed by `modeled-information-format.github.io` | none | n/a |
| `modeled-information-format.github.io` | `https://modeled-information-format.github.io/` (root + `/docs` + `/research-harness-template`) | `/` (assembly) | Composes **three** sources into one Pages deploy: `.github` (root), `doc-site` (`/docs`), `research-harness-template` (`/research-harness-template`) — checks all three out fresh, assembles, deploys | `pages` (cross-repo checkout token scoped to all three sources) | n/a (assembly only) |
| `ontologies` | `https://modeled-information-format.github.io/ontologies/` | `/ontologies` | Direct, independent self Pages deploy — **not** composed by `.github.io` | none in the deploy job; separately its `release.yml` uses `pages` to dispatch `ontology-corpus-released` to `MIF` (unrelated to its own Pages) | 7.0.3 / 0.41.1 |
| `ontologies-site` | *(unreleased)* | `/ontologies` (config carried over from `ontologies`) | A linked git worktree of `ontologies` on `feat/starlight-site` — has a `deploy.yml` gated to `push: main`, but that branch has zero workflow runs. Not deployed anywhere yet. | n/a | 6.4.8 / 0.40.0 (drifted behind `ontologies` main since branching) |
| `claude-code-plugins` | `https://modeled-information-format.github.io/claude-code-plugins/` | `/claude-code-plugins` | Direct self Pages deploy | none in the deploy job (`catalog`/`release` apps are used elsewhere in this repo, not for Pages) | 7.0.4 / 0.41.1 |
| `structured-madr` | `https://smadr.dev/` (custom domain, CNAME) | `/` | Direct self Pages deploy | none | 7.0.3 / 0.41.1 |
| `research-harness-template` | `https://modeled-information-format.github.io/research-harness-template/` | `/research-harness-template` (from `harness.config.json → site.base`) | **No Pages of its own** (404 if queried directly) — build-then-notify: `docs.yml`'s `notify-deploy` job fires `repository_dispatch: source-updated` to `modeled-information-format.github.io` on push to `main`, which then rebuilds and redeploys | `pages` (dispatch token scoped to `.github.io`) | 7.0.3 / 0.41.1 |
| `mif-docs-plugin` | `https://modeled-information-format.github.io/mif-docs-plugin/` | `/mif-docs-plugin` | Direct self Pages deploy; site lives in `site/` (isolated `package.json`, separate from the plugin's own tooling deps) | none | 6.4.8 / 0.40.0 |
| `mif-rs` | `https://modeled-information-format.github.io/mif-rs/` (+ `/mif-rs/rustdoc`) | `/mif-rs` | Direct self Pages deploy: builds `cargo doc`, builds the Astro site, copies rustdoc into the site's `dist/rustdoc`, deploys | none | 7.0.6 / 0.41.3 |
| `gdlc` | *(none)* | — | No Pages deployment of any kind — a Claude Code plugin marketplace, not a docs site | — | — |
| `mnemonic`, `mnemonic-vscode`, `mif-repo-template`, `design-system` | *(none)* | — | No Pages/Astro config in any of these yet | — | — |

## Known gotchas

**A repo composed into `modeled-information-format.github.io` must never also
enable its own project Pages at the same path.** This already bit once: a
same-named org repo with Pages enabled shadows the composed subdir the
assembly repo serves.
`research-harness-template` is the live example of the *latent* version of
this risk today — it's composed at `/research-harness-template` by
`.github.io`'s `deploy.yml`, and has no Pages of its own (confirmed 404). If
Pages were ever toggled on directly for that repo, the way it already is for
`ontologies`/`claude-code-plugins`/`mif-docs-plugin`/`mif-rs`, its own
project-Pages site would claim the identical URL its composed content already
occupies. **Before enabling Pages on any repo, check this table for whether
something else already serves that path.**

**`doc-site` has no notify-deploy hook.** Unlike `research-harness-template`
(whose `docs.yml` fires `repository_dispatch: source-updated` on push to
`main`), a push to `doc-site`'s `main` does not itself trigger
`modeled-information-format.github.io` to rebuild — `/docs` only picks up
doc-site's latest content when something else (a manual `workflow_dispatch`,
or `research-harness-template`'s own dispatch) causes the org site to
rebuild. If `/docs` looks stale after a doc-site merge, this is why —
either add the same notify-deploy job `research-harness-template` uses, or
manually dispatch `modeled-information-format.github.io`'s `deploy.yml`.

**`.github`'s Pages toggle is dead, not dangerous — but don't build on it.**
Its repo settings report `has_pages: true`, but no workflow in the repo
builds or deploys anything from it. Its actual role is supplying root
content (`index.html`, favicon) that `modeled-information-format.github.io`
checks out and composes. Don't add a `deploy-pages` step to `.github`
expecting it to serve independently — it never has.

## Adding a new site: checklist

1. **Decide direct-deploy vs. compose-into-org-site.** Direct (own
   `deploy.yml`, own project Pages) is what every site-serving repo above
   does except `.github`, `doc-site`, and `research-harness-template`, which
   hand off content to `modeled-information-format.github.io` instead
   (`.github` supplies the root landing content; the other two are checked
   out and built fresh on each org-site deploy). Compose-in only makes sense
   for content meant to live under the org root path structure (`/`, `/docs`,
   `/research-harness-template`) rather than its own subdomain-like path.
2. **Check this table for a path collision** before choosing a `base`/CNAME —
   see the gotcha above.
3. **Pick the deploy identity.** Cross-repo checkouts/dispatches use the
   `pages` App; same-repo-only deploys typically need no App token at all
   (plain `GITHUB_TOKEN` + OIDC is enough for `actions/deploy-pages`).
4. **If compose-into-org-site:** add a `notify-deploy` job firing
   `repository_dispatch: source-updated` to `modeled-information-format.github.io`
   on push to `main` (see `research-harness-template/.github/workflows/docs.yml`
   for the pattern) — without it, merges won't publish until something else
   happens to trigger the org site's rebuild.
5. **Update this table in the same PR.**
