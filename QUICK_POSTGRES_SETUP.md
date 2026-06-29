# ⚡ Rychlý Setup PostgreSQL

## Krok 1: Spusť PostgreSQL

```bash
docker-compose up -d postgres
```

## Krok 2: Vygeneruj Prisma Client

```bash
npx prisma generate
```

## Krok 3: Vytvoř tabulky

```bash
npx prisma db push
```

## Krok 4: Spusť aplikaci

```bash
npm run dev
```

## ✅ Hotovo!

Aplikace teď běží na PostgreSQL.

---

## 🔧 Užitečné příkazy

```bash
# Zobrazit data v databázi
npx prisma studio

# Restartovat PostgreSQL
docker-compose restart postgres

# Zastavit PostgreSQL
docker-compose down

# Logy PostgreSQL
docker logs -f ucebnice-postgres

# Připojit se do PostgreSQL
docker exec -it ucebnice-postgres psql -U ucebnice_user -d ucebnice_db
```

---

## ⚠️ ZMĚŇ HESLO V PRODUKCI!

V souboru `docker-compose.yml` změň:

```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme123}
```

A v `.env`:

```env
POSTGRES_PASSWORD="tvoje_silne_heslo"
DATABASE_URL="postgresql://ucebnice_user:tvoje_silne_heslo@localhost:5432/ucebnice_db"
```
