# 🔄 Migrace z SQLite na PostgreSQL

## 📋 Přehled

Tento návod provede migrací z SQLite databáze na PostgreSQL běžící v Docker containeru.

---

## 🎯 Krok 1: Spuštění PostgreSQL v Docker containeru

### Vytvoření Docker Compose souboru

Vytvoř soubor `docker-compose.yml` v root projektu:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ucebnice-postgres
    restart: always
    environment:
      POSTGRES_USER: ucebnice_user
      POSTGRES_PASSWORD: your_secure_password_here  # ZMĚŇ!
      POSTGRES_DB: ucebnice_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql  # Volitelné
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ucebnice_user -d ucebnice_db"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

### Spuštění PostgreSQL

```bash
# Spustit PostgreSQL container
docker-compose up -d postgres

# Ověřit, že běží
docker ps | grep ucebnice-postgres

# Zkontrolovat logy
docker logs ucebnice-postgres

# Test připojení
docker exec -it ucebnice-postgres psql -U ucebnice_user -d ucebnice_db
# V psql: \l (zobrazí databáze), \q (exit)
```

---

## 🎯 Krok 2: Úprava Prisma Schema

### Změnit datasource v `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // Změněno z "sqlite"
  url      = env("DATABASE_URL")
}
```

### ⚠️ Potřebné úpravy modelů pro PostgreSQL

SQLite a PostgreSQL mají rozdílné typy. Zkontroluj a uprav:

```prisma
// PŘED (SQLite):
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt

// PO (PostgreSQL) - stejné, ale zkontroluj:
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt

// Pokud používáš @id @default(uuid()):
id String @id @default(uuid())  // ✅ Funguje v obou

// Pokud používáš autoincrement:
id Int @id @default(autoincrement())  // ✅ PostgreSQL to převede na SERIAL
```

---

## 🎯 Krok 3: Aktualizace Environment Variables

### Vytvoř `.env.production` pro server:

```env
# PostgreSQL Database (Pro produkci na serveru)
DATABASE_URL="postgresql://ucebnice_user:your_secure_password_here@localhost:5432/ucebnice_db"

# Nebo pokud běží na jiném hostu:
# DATABASE_URL="postgresql://ucebnice_user:password@192.168.1.100:5432/ucebnice_db"

# NextAuth Configuration
NEXTAUTH_URL="https://ucebnice.praut.cz"  # Tvoje produkční URL
NEXTAUTH_SECRET="generate-long-random-secret-here"  # Vygeneruj nový!

# App Configuration
NEXT_PUBLIC_APP_URL="https://ucebnice.praut.cz"

# Node Environment
NODE_ENV="production"
```

### Vygenerování NEXTAUTH_SECRET:

```bash
# Metoda 1: OpenSSL
openssl rand -base64 32

# Metoda 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Pro lokální vývoj (`.env.local`):

```env
# PostgreSQL pro lokální vývoj
DATABASE_URL="postgresql://ucebnice_user:your_secure_password_here@localhost:5432/ucebnice_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NODE_ENV="development"
```

---

## 🎯 Krok 4: Export Dat z SQLite (VOLITELNÉ)

Pokud chceš zachovat existující data:

### Metoda 1: Pomocí prisma-db-seed (doporučeno)

```bash
# 1. Nainstaluj potřebné nástroje
npm install -D @prisma/migrate

# 2. Vytvoř seed script
```

Vytvoř `prisma/seed-from-sqlite.ts`:

```typescript
import { PrismaClient as SqlitePrisma } from '@prisma/client'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

const sqlite = new SqlitePrisma({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
})

const postgres = new PostgresPrisma()

async function main() {
  console.log('🔄 Začínám migraci dat...')

  // Migrace Users
  const users = await sqlite.user.findMany()
  console.log(`Migrace ${users.length} uživatelů...`)
  
  for (const user of users) {
    await postgres.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    })
  }

  // Migrace dalších tabulek...
  // ... (pokračuj pro všechny modely)

  console.log('✅ Migrace dat dokončena!')
}

main()
  .catch((e) => {
    console.error('❌ Chyba při migraci:', e)
    process.exit(1)
  })
  .finally(async () => {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  })
```

### Metoda 2: Ruční export/import

```bash
# Export ze SQLite do SQL
sqlite3 prisma/dev.db .dump > sqlite_dump.sql

# Tento soubor bude potřeba upravit pro PostgreSQL
# (SQLite a PostgreSQL mají různou syntaxi)
```

---

## 🎯 Krok 5: Migrace Databáze

### Smazat staré migrace a vytvořit nové:

```bash
# 1. Zálohuj staré migrace (volitelné)
mv prisma/migrations prisma/migrations_sqlite_backup

# 2. Vygeneruj Prisma Client pro PostgreSQL
npx prisma generate

# 3. Vytvoř nové migrace pro PostgreSQL
npx prisma migrate dev --name init_postgresql

# Nebo pro produkci:
npx prisma migrate deploy
```

---

## 🎯 Krok 6: Test Připojení

Vytvoř test script `scripts/test-postgres.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test připojení
    await prisma.$connect()
    console.log('✅ Připojení k PostgreSQL úspěšné!')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`📊 Počet uživatelů v databázi: ${userCount}`)

    // Test vytvoření
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        hashedPassword: 'test',
      },
    })
    console.log('✅ Test zápisu úspěšný:', testUser.id)

    // Vymazat test data
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Test mazání úspěšný')

  } catch (error) {
    console.error('❌ Chyba:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

Spusť test:

```bash
npx ts-node scripts/test-postgres.ts
```

---

## 🎯 Krok 7: Aktualizace package.json

Přidej užitečné scripty:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:push": "prisma db push",
    "db:seed": "ts-node prisma/seed-from-sqlite.ts",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker logs -f ucebnice-postgres"
  }
}
```

---

## 🎯 Krok 8: Deployment na Server

### Na serveru:

```bash
# 1. Pull změn z Gitu
git pull origin main

# 2. Spusť PostgreSQL
docker-compose up -d postgres

# 3. Nastav environment variables
cp .env.example .env.production
nano .env.production  # Edituj hodnoty

# 4. Nainstaluj dependencies
npm install

# 5. Vygeneruj Prisma Client
npx prisma generate

# 6. Spusť migrace
npx prisma migrate deploy

# 7. (Volitelné) Seed data
npm run db:seed

# 8. Build aplikace
npm run build

# 9. Spusť aplikaci
npm start
# Nebo PM2:
pm2 start npm --name "ucebnice" -- start
pm2 save
```

---

## 🔒 Bezpečnostní Checklist

- [ ] Změň `POSTGRES_PASSWORD` na silné heslo
- [ ] Vygeneruj nový `NEXTAUTH_SECRET` pro produkci
- [ ] `.env` a `.env.local` jsou v `.gitignore`
- [ ] PostgreSQL port (5432) není přístupný z internetu (firewall)
- [ ] Pravidelné zálohy databáze nastaveny
- [ ] SSL/TLS připojení pro produkci (volitelné)

---

## 📦 Záloha Databáze

### Automatická záloha:

Vytvoř `scripts/backup-postgres.sh`:

```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ucebnice_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker exec ucebnice-postgres pg_dump -U ucebnice_user -d ucebnice_db > "$BACKUP_DIR/$FILENAME"

# Komprese
gzip "$BACKUP_DIR/$FILENAME"

echo "✅ Záloha vytvořena: $BACKUP_DIR/$FILENAME.gz"

# Smazat zálohy starší než 7 dní
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

Nastavení cron jobu:

```bash
# Edituj crontab
crontab -e

# Přidej řádek (záloha každý den ve 2:00)
0 2 * * * /path/to/project/scripts/backup-postgres.sh
```

---

## 🐛 Troubleshooting

### Problém: "Connection refused"

```bash
# Zkontroluj, že PostgreSQL běží
docker ps | grep postgres

# Zkontroluj logy
docker logs ucebnice-postgres

# Zkontroluj port
netstat -an | grep 5432
```

### Problém: "Password authentication failed"

```bash
# Zkontroluj username a password v .env
cat .env | grep DATABASE_URL

# Zkontroluj Docker environment
docker inspect ucebnice-postgres | grep -A 10 Env
```

### Problém: "Database does not exist"

```bash
# Vytvoř databázi ručně
docker exec -it ucebnice-postgres psql -U ucebnice_user -c "CREATE DATABASE ucebnice_db;"

# Nebo restart containeru
docker-compose down
docker-compose up -d
```

---

## 📊 Porovnání SQLite vs PostgreSQL

| Vlastnost | SQLite | PostgreSQL |
|-----------|--------|------------|
| **Výkon** | Dobré pro čtení | Výborné pro vše |
| **Concurrent writes** | Omezené | Výborné |
| **Škálování** | Omezené | Výborné |
| **Produkce** | Nevhodné | Ideální |
| **Backup** | Jednoduchý soubor | Potřeba pg_dump |
| **Setup** | Žádný | Docker/Server |

---

## ✅ Finální Kontrola

Po migraci zkontroluj:

- [ ] Aplikace se spustí bez chyb
- [ ] Uživatelé se mohou přihlásit
- [ ] Data se správně načítají
- [ ] Kapitoly fungují
- [ ] Žebříček zobrazuje data
- [ ] Certifikáty fungují
- [ ] Všechny API endpointy odpovídají

---

## 📞 Další Kroky

1. ✅ Nasaď změny na produkční server
2. ✅ Migr uj existující data (pokud potřeba)
3. ✅ Nastavuj automatické zálohy
4. ✅ Monitoruj výkon databáze
5. ✅ Dokumentuj přístupové údaje (bezpečně!)

---

**Hotovo! Tvoje aplikace teď běží na PostgreSQL.** 🎉
