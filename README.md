# Al-Furqan

Education platform SaaS.

## Database

Uses [Prisma Postgres](https://www.prisma.io/postgres) via Prisma Accelerate.

Setup:

1. Copy `.env.example` to `.env` and fill in your `DATABASE_URL` / `DIRECT_URL` (get these from the Prisma Data Platform dashboard for app `cmr8hcn4d0ubq3mdu273hlzds`).
2. Install dependencies: `npm install`
3. Generate Prisma Client: `npm run prisma:generate`
4. Push schema to the database: `npm run prisma:push`

## Deployment

- **GitHub**: https://github.com/crynxmartinez/alfurqan
- **Hosting**: Vercel (connected to this repo)
- **Database**: Prisma Postgres, app id `cmr8hcn4d0ubq3mdu273hlzds`

Remember to add `DATABASE_URL` and `DIRECT_URL` as environment variables in the Vercel project settings.
