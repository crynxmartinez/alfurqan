# Al-Furqan

Education platform SaaS.

## Database

Uses [Prisma Postgres](https://www.prisma.io/postgres) via Prisma Accelerate.

Setup:

1. Copy `.env.example` to `.env` and fill in your `DATABASE_URL` / `DIRECT_URL` (get these from the Prisma Data Platform dashboard for your project).
2. Install dependencies: `npm install`
3. Generate Prisma Client: `npm run prisma:generate`
4. For an empty database, apply migrations: `npm run prisma:deploy`. For an existing database, follow [the baseline and rollout procedure](docs/DATABASE-ROLLOUT.md) first.

## Deployment

- **GitHub**: https://github.com/crynxmartinez/alfurqan
- **Hosting**: Vercel (connected to this repo)
- **Database**: Prisma Postgres

Remember to add `DATABASE_URL` and `DIRECT_URL` as environment variables in the Vercel project settings.

## Maintenance and improvement work

GitHub repository (for later push): https://github.com/crynxmartinez/alfurqan

- [Improvement checklist](docs/IMPROVEMENT-PLAN.md)
- [Database rollout and recovery](docs/DATABASE-ROLLOUT.md) — required before deploying this version to an existing database
- [Verification results](docs/VERIFICATION.md)

Use `npm run typecheck`, `npm run lint`, `npm test` and `npm run test:browser` for verification. Browser tests use synthetic intercepted API responses and an unreachable test database URL; they never use live school records. Install their Chromium browser with `npx playwright install chromium` first. Development/build use Node 24.
