# Sellable App Checklist

## Phase 0 - Deployment Baseline
- [x] App builds and starts in Railway
- [x] Dockerfile build is production-compatible
- [x] Prisma migrations are unblocked in prod

## Phase 1 - Make It Usable (1-3 days)
- [ ] Backend endpoints work in prod: `/start-sync`, `/sync-status`, `/products/:supplier_id`
- [ ] Onboarding saves supplier profile + triggers first sync
- [ ] UI shows sync status + errors from `sync_runs`

## Phase 2 - Make It Sellable (3-7 days)
- [ ] Production hosting + custom HTTPS domain
- [ ] Shopify Billing (plans + trial)
- [ ] Token handling: Shopify token only server-side
- [ ] Legal: Terms + Privacy + data retention info

## Phase 3 - Make It Scalable (1-2 weeks)
- [ ] Monitoring (Sentry/Logtail) + alerting
- [ ] Rate-limit + backoff for supplier sync
- [ ] Robust onboarding wizard + help/FAQ
- [ ] Polish UI to match Base44 across all pages
