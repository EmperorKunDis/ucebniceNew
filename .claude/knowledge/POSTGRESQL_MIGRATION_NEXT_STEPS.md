# PostgreSQL Migration - Next Steps

## What Has Been Completed

All preparation for PostgreSQL migration has been completed:

### ✅ Schema Updates

- Prisma schema updated for PostgreSQL compatibility
- ID fields changed from `cuid()` to `uuid()`
- Added PostgreSQL-specific type annotations
- Enabled PostgreSQL extensions (uuid_ossp, pg_trgm)
- Optimized field types for PostgreSQL

### ✅ Migration Scripts Created

- `scripts/migration/export-sqlite-data.ts` - Export current data
- `scripts/migration/import-postgres-data.ts` - Import to PostgreSQL
- `scripts/migration/verify-migration.ts` - Verify data integrity
- `scripts/migration/README.md` - Detailed migration guide

### ✅ Infrastructure Updates

- Added `tsx` dev dependency for script execution
- Added npm scripts: `migrate:export`, `migrate:import`, `migrate:verify`
- Updated `.env.example` with PostgreSQL examples
- Updated `.gitignore` for migration files

### ✅ Build Verification

- Next.js build successful with PostgreSQL schema
- Prisma Client generated successfully
- All TypeScript types validated

## What You Need To Do

### Step 1: Create PostgreSQL Database on Neon

1. **Sign up for Neon** (recommended provider)
   - Go to: https://neon.tech
   - Create a free account
   - Create a new project

2. **Get your connection string**
   - It will look like: `postgresql://user:password@ep-xxx-123.us-east-2.aws.neon.tech/neondb`
   - Copy this - you'll need it in Step 2

### Step 2: Export Current SQLite Data

**IMPORTANT:** Do this BEFORE changing DATABASE_URL!

```bash
# Make sure DATABASE_URL points to SQLite
export DATABASE_URL="file:./prisma/dev.db"

# Export all current data
npm run migrate:export
```

This creates `scripts/migration/sqlite-export.json` with all your data.

**Verify the export:**

```bash
# Check the export file
ls -lh scripts/migration/sqlite-export.json

# View statistics
cat scripts/migration/sqlite-export.json | grep -A 20 '"stats"'
```

### Step 3: Update Environment Variable

Create or update your `.env` file:

```bash
# Backup SQLite URL
DATABASE_URL_BACKUP="file:./prisma/dev.db"

# Set PostgreSQL connection string from Neon
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**⚠️ IMPORTANT:** Replace the URL with your actual Neon connection string!

### Step 4: Generate Prisma Client

```bash
# Generate Prisma Client for PostgreSQL
npx prisma generate
```

### Step 5: Run Database Migration

```bash
# Create migration and apply to PostgreSQL
npx prisma migrate dev --name initial_postgresql_schema

# Or for production/staging:
npx prisma migrate deploy
```

This will:

- Create all tables in PostgreSQL
- Set up indexes
- Enable extensions

### Step 6: Import Data

```bash
# Import data from SQLite export to PostgreSQL
npm run migrate:import
```

Watch for any errors. The script will show progress for each table.

### Step 7: Verify Migration

```bash
# Verify all data migrated correctly
npm run migrate:verify
```

This will:

- Compare record counts between SQLite and PostgreSQL
- Check for orphaned records
- Show sample data
- Report any issues

**Expected output:**

```
✅ All record counts match!
✨ Migration verification successful!
```

### Step 8: Test Application

```bash
# Start development server
npm run dev
```

Test these features:

- [ ] User login/authentication
- [ ] View chapters
- [ ] Complete a lesson
- [ ] Answer questions
- [ ] Submit a project
- [ ] Check leaderboard
- [ ] View achievements
- [ ] User profile page

### Step 9: Deploy to Production

Once everything works locally:

1. **Update production environment variables:**
   - In Vercel/your hosting platform
   - Set `DATABASE_URL` to your production PostgreSQL connection string

2. **Run migration on production:**

   ```bash
   npx prisma migrate deploy
   ```

3. **Import data on production:**

   ```bash
   npm run migrate:import
   ```

4. **Verify on production:**
   ```bash
   npm run migrate:verify
   ```

## If Something Goes Wrong

### Rollback to SQLite

```bash
# 1. Switch back to SQLite in .env
DATABASE_URL="file:./prisma/dev.db"

# 2. Checkout SQLite schema from main branch
git checkout main -- prisma/schema.prisma

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Restart development server
npm run dev
```

Your SQLite data is safe - it was never modified!

## Important Notes

### About the Branch

You're currently on the `feature/postgresql-migration` branch:

```bash
# To see your current branch
git branch --show-current

# To merge into main after successful migration
git checkout main
git merge feature/postgresql-migration

# To push to remote
git push origin feature/postgresql-migration
```

### Data Safety

- ✅ Your original SQLite database (`prisma/dev.db`) is **NOT modified**
- ✅ Export file is saved locally for safety
- ✅ You can always rollback to SQLite
- ✅ Migration uses upsert operations (safe to re-run)

### Connection Pooling

For production, enable connection pooling in your DATABASE_URL:

```
postgresql://user:password@host/db?pgbouncer=true&connection_limit=10
```

### Monitoring

After migration, monitor:

- Query performance (should be equal or better)
- Response times
- Error logs
- Database CPU/memory usage in Neon dashboard

## Performance Expectations

After migration, you should see:

- ✅ **Better concurrency** - Multiple users can write simultaneously
- ✅ **Faster leaderboard** - With indexes and proper query optimization
- ✅ **No more "database locked"** errors
- ✅ **Better scalability** - Handle 1000+ concurrent users
- ✅ **Point-in-time recovery** - Better backup and restore options

## Getting Help

If you encounter issues:

1. **Check the detailed guide:** `scripts/migration/README.md`
2. **Review the strategy:** `POSTGRESQL_MIGRATION_STRATEGY.md`
3. **Check Prisma logs:** Enable with `DEBUG=prisma:*`
4. **Verify connection:** Test connection in Neon dashboard
5. **Check export data:** Inspect `scripts/migration/sqlite-export.json`

## Troubleshooting Common Issues

### "Extension uuid_ossp not found"

Neon enables this by default. If you see this error with a different provider:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### "Connection timeout"

- Verify your DATABASE_URL is correct
- Check `sslmode=require` is in the connection string
- Ensure Neon project is not paused (free tier auto-pauses)

### "Unique constraint violation"

Duplicate data exists. Find duplicates:

```bash
cat scripts/migration/sqlite-export.json | jq '.data.users[] | .email' | sort | uniq -d
```

## Summary

**You're ready to migrate!** Follow the steps above carefully:

1. ✅ Sign up for Neon
2. ✅ Export SQLite data (`npm run migrate:export`)
3. ✅ Update DATABASE_URL in `.env`
4. ✅ Run migration (`npx prisma migrate dev`)
5. ✅ Import data (`npm run migrate:import`)
6. ✅ Verify (`npm run migrate:verify`)
7. ✅ Test application
8. ✅ Deploy to production

**Estimated time:** 30-60 minutes (depending on data size)

Good luck! 🚀
