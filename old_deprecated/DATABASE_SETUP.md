# Nastavení databáze pro testování

Tento projekt podporuje **SQLite** pro lokální vývoj a testování a **PostgreSQL** pro produkční prostředí.

## SQLite (Lokální testování)

### Výhody:

- ✅ Žádná instalace databázového serveru
- ✅ Rychlé nastavení
- ✅ Snadné resetování dat
- ✅ Ideální pro unit testy a lokální vývoj
- ✅ Soubor `prisma/dev.db` lze snadno smazat a znovu vytvořit

### Jak používat SQLite:

1. **Ujistěte se, že máte správný schema.prisma:**

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Vytvořte `.env` soubor (Prisma CLI ho potřebuje):**

   ```bash
   DATABASE_URL="file:./dev.db"
   ```

3. **Vytvořte `.env.local` soubor (Next.js ho použije při vývoji):**

   ```bash
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-local-secret-key"
   ```

   **Poznámka:** Cesta `file:./dev.db` je relativní k `prisma/schema.prisma`, takže databáze bude vytvořena v `prisma/dev.db`.

4. **Pushnete schéma do databáze:**

   ```bash
   npx prisma db push --accept-data-loss
   ```

5. **Naplňte databázi testovacími daty:**

   ```bash
   npm run db:seed
   ```

6. **Spusťte vývojový server:**
   ```bash
   npm run dev
   ```

### Reset SQLite databáze:

Pokud potřebujete začít znovu:

```bash
rm prisma/dev.db prisma/dev.db-journal
npx prisma db push --accept-data-loss
npm run db:seed
```

---

## PostgreSQL (Produkční prostředí)

### Jak přepnout na PostgreSQL:

1. **Upravte `prisma/schema.prisma`:**

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

   A přidejte PostgreSQL-specifické typy zpět (viz git history pro originální verzi).

2. **Vytvořte `.env` soubor s PostgreSQL připojením:**

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="production-secret-key"
   ```

3. **Spusťte migrace:**
   ```bash
   npx prisma migrate deploy
   ```

---

## Docker PostgreSQL (Alternativa)

Pokud chcete PostgreSQL lokálně bez instalace:

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=ucebnice \
  -p 5432:5432 \
  -d postgres:15

# Pak nastavte DATABASE_URL
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ucebnice"
```

---

## Současná konfigurace

**✅ Aktuálně nastaveno:** SQLite pro lokální vývoj

- Databáze: `prisma/dev.db`
- Schema: SQLite kompatibilní (bez PostgreSQL-specifických typů)
- Přístup přes: `.env.local` soubor

## Užitečné příkazy

```bash
# Zobrazit Prisma Studio (GUI pro databázi)
npx prisma studio

# Vygenerovat Prisma Client
npx prisma generate

# Zkontrolovat schéma
npx prisma validate

# Formátovat schéma
npx prisma format

# Zkontrolovat data v databázi přes SQLite CLI
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Lesson;"
sqlite3 prisma/dev.db ".tables"
sqlite3 prisma/dev.db ".schema User"
```
