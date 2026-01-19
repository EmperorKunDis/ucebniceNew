# Shrnutí migrace na SQLite

## ✅ Provedené změny

### 1. **Prisma Schema** (`prisma/schema.prisma`)

- ✅ Změněn provider z `postgresql` na `sqlite`
- ✅ Odstraněny PostgreSQL-specifické typy (`@db.Uuid`, `@db.VarChar`, `@db.Text`, `@db.Timestamptz`)
- ✅ Odstraněny PostgreSQL preview features (`fullTextSearchPostgres`, `postgresqlExtensions`)
- ✅ Schéma je nyní kompatibilní se SQLite

### 2. **Environment konfigurace**

- ✅ Vytvořen `.env` soubor pro Prisma CLI:
  ```
  DATABASE_URL="file:./dev.db"
  ```
- ✅ Vytvořen `.env.local` soubor pro Next.js:
  ```
  DATABASE_URL="file:./dev.db"
  NEXTAUTH_URL="http://localhost:3000"
  NEXTAUTH_SECRET="your-local-secret-key"
  ```

### 3. **Databáze**

- ✅ Vytvořena SQLite databáze: `prisma/dev.db` (336 KB)
- ✅ Všechny tabulky úspěšně vytvořeny
- ✅ Seed data naplněna (40 lekcí)
- ✅ Databázové operace (CRUD) fungují správně

### 4. **Dokumentace**

- ✅ Vytvořen `DATABASE_SETUP.md` s kompletním návodem
- ✅ Vytvořen testovací skript `test-db-connection.mjs`
- ✅ Aktualizován `.gitignore` pro ignorování SQLite souborů
  d

### 5. **Gitignore**

Přidáno do `.gitignore`:

```
prisma/dev.db
prisma/dev.db-journal
prisma/*.db
prisma/*.db-journal
```

## 📊 Ověření funkčnosti

```bash
# Výsledky testu:
✅ Lessons in database: 40
✅ First lesson: Co je umělá inteligence?
✅ Users in database: 0
✅ Created test user: Test User
✅ Deleted test user
🎉 All database tests passed!
```

## 🔄 Přepnutí zpět na PostgreSQL (pokud potřebujete)

Pokud chcete přepnout zpět na PostgreSQL pro produkční deployment:

1. **Obnovte PostgreSQL schéma z gitu:**

   ```bash
   git show HEAD~1:prisma/schema.prisma > prisma/schema.prisma
   ```

2. **Aktualizujte `.env`:**

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. **Spusťte migrace:**
   ```bash
   npx prisma migrate deploy
   ```

## 🎯 Výhody SQLite pro lokální vývoj

✅ Žádná instalace databázového serveru  
✅ Rychlé nastavení (< 1 minuta)  
✅ Snadný reset databáze (`rm prisma/dev.db`)  
✅ Portable - celá databáze v jednom souboru  
✅ Ideální pro testy a CI/CD  
✅ Nižší spotřeba paměti

## 📝 Důležité poznámky

- SQLite databáze je v `.gitignore` - nebude commitována
- Environment soubory (`.env`, `.env.local`) jsou také v `.gitignore`
- Cesta `file:./dev.db` je relativní k `prisma/schema.prisma`
- Pro produkci doporučujeme PostgreSQL
- SQLite nepodporuje některé pokročilé PostgreSQL funkce (full-text search, extensions)

## 🚀 Rychlý start

```bash
# 1. Vytvořte databázi
npx prisma db push --accept-data-loss

# 2. Naplňte testovacími daty
npm run db:seed

# 3. Ověřte funkčnost
node test-db-connection.mjs

# 4. Spusťte aplikaci
npm run dev
```

## 🆘 Troubleshooting

### Problém: "Environment variable not found: DATABASE_URL"

**Řešení:** Ujistěte se, že máte vytvořen `.env` soubor v root složce projektu.

### Problém: Databáze je prázdná po seed

**Řešení:** Zkontrolujte, že máte správnou cestu v DATABASE_URL a že Prisma Client je vygenerován (`npx prisma generate`).

### Problém: Migrace hlásí drift

**Řešení:** Smažte `prisma/migrations` složku a použijte `npx prisma db push` místo migrate.

---

**Datum migrace:** 2025-11-10  
**Stav:** ✅ Kompletní a funkční
