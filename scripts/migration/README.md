# PostgreSQL Migration Guide

This directory contains scripts for migrating from SQLite to PostgreSQL.

## Prerequisites

1. **Node.js** version 18+ installed
2. **tsx** package installed globally: `npm install -g tsx`
3. **Neon PostgreSQL** account (or other PostgreSQL provider)
4. **Backup** of current SQLite database

## Migration Steps

### Step 1: Create Neon PostgreSQL Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

### Step 2: Set Up Environment Variables

Create or update your `.env` file:

```bash
# Backup your current DATABASE_URL
DATABASE_URL_SQLITE="file:./prisma/dev.db"

# Add PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### Step 3: Export Data from SQLite

**IMPORTANT:** Do this BEFORE changing the schema to PostgreSQL!

```bash
# Make sure DATABASE_URL points to SQLite
export DATABASE_URL="file:./prisma/dev.db"

# Run export script
tsx scripts/migration/export-sqlite-data.ts
```

This creates `scripts/migration/sqlite-export.json` with all your data.

### Step 4: Update Schema and Run Migration

The schema has already been updated for PostgreSQL in this branch. Now apply it:

```bash
# Point to PostgreSQL database
export DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name postgresql_migration

# Or for production:
npx prisma migrate deploy
```

### Step 5: Import Data to PostgreSQL

```bash
# Make sure DATABASE_URL points to PostgreSQL
export DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Run import script
tsx scripts/migration/import-postgres-data.ts
```

### Step 6: Verify Migration

```bash
# Verify data integrity
tsx scripts/migration/verify-migration.ts
```

This script will:

- Compare record counts between SQLite and PostgreSQL
- Check for orphaned records
- Display sample user data
- Report any discrepancies

### Step 7: Test Application

```bash
# Start development server
npm run dev

# Test key features:
# - User authentication
# - Chapter completion
# - Question answers
# - Project submissions
# - Leaderboard
# - Achievements
```

## Rollback Plan

If something goes wrong:

1. **Restore SQLite connection:**

   ```bash
   # In .env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Switch back to SQLite schema:**

   ```bash
   git checkout main -- prisma/schema.prisma
   npx prisma generate
   ```

3. **Your data is safe** - the SQLite file remains unchanged

## Key Schema Changes

### ID Fields

- Changed from `cuid()` to `uuid()` for better PostgreSQL performance
- All IDs are now `@db.Uuid` type

### Date Fields

- Changed to `@db.Timestamptz` for timezone support

### String Fields

- Short strings: `@db.VarChar(n)` for better performance
- Long text: `@db.Text` for descriptions, content, etc.

### Indexes

- Added additional indexes for common queries
- Foreign key indexes for better join performance

## Performance Optimizations

After migration, consider these optimizations:

### 1. Connection Pooling

Add to your DATABASE_URL:

```
postgresql://user:password@host/database?pgbouncer=true&connection_limit=10
```

### 2. Analyze Tables

```sql
ANALYZE;
```

### 3. Monitor Query Performance

Use Prisma's query logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

## Troubleshooting

### Error: "Extension uuid_ossp not found"

Neon enables this by default, but if you see this error:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Error: "Connection timeout"

- Check your DATABASE_URL is correct
- Ensure `sslmode=require` is in the connection string
- Verify Neon project is not paused (free tier pauses after inactivity)

### Error: "Unique constraint violation"

This means duplicate data exists. Check the export file and clean duplicates:

```bash
# Find duplicates in export
cat scripts/migration/sqlite-export.json | jq '.data.users[] | .email' | sort | uniq -d
```

### Migration is Very Slow

For large datasets:

1. Disable foreign key checks temporarily (not recommended for production)
2. Import in smaller batches
3. Use connection pooling
4. Increase transaction timeout in import script

## Post-Migration Checklist

- [ ] All record counts match between SQLite and PostgreSQL
- [ ] No orphaned records found
- [ ] Sample data looks correct
- [ ] Authentication works
- [ ] User progress is preserved
- [ ] Leaderboard displays correctly
- [ ] All API endpoints return correct data
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] Update production environment variables
- [ ] Monitor performance for 24-48 hours
- [ ] Keep SQLite backup for 1 week

## Support

If you encounter issues:

1. Check the verification output for specific errors
2. Review Prisma logs: `npx prisma studio` to inspect data
3. Check Neon dashboard for connection/query errors
4. Consult the main migration strategy document: `POSTGRESQL_MIGRATION_STRATEGY.md`

## Files in This Directory

- `export-sqlite-data.ts` - Export all data from SQLite to JSON
- `import-postgres-data.ts` - Import JSON data to PostgreSQL
- `verify-migration.ts` - Verify data integrity after migration
- `sqlite-export.json` - Generated export file (gitignored)
- `README.md` - This file

## Success Indicators

Migration is successful when:

1. ✅ All verification checks pass
2. ✅ Application starts without errors
3. ✅ Users can log in
4. ✅ All features work as expected
5. ✅ No data loss detected
6. ✅ Performance is equal or better than SQLite
