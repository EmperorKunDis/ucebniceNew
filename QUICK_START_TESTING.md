# 🚀 Quick Start - Testování na serveru

**Přečti si tohle PŘED tím, než začneš testovat!**

---

## ⚡ Co Musíš Udělat (Shrnutí)

### 1️⃣ Na serveru (přes SSH):
```bash
# Spusť tento script pro zobrazení příkazů
./scripts/server-test-commands.sh
```

### 2️⃣ Postupuj podle checklistu:
Otevři: **`TEST_CHECKLIST.md`** a postupně zaškrtávej

### 3️⃣ Kompletní návod:
Pokud potřebuješ detaily: **`SERVER_TEST_GUIDE.md`**

---

## 📋 Co Budeš Testovat

1. **PostgreSQL v Kubernetes** - Běží? Připojuje se?
2. **Prisma Migrations** - Tabulky se vytvořily?
3. **Aplikace** - Startuje bez chyb?
4. **Health Endpoint** - Odpovídá správně?
5. **Registrace** - Můžeš vytvořit účet?
6. **Přihlášení** - Můžeš se přihlásit?
7. **Data Persistence** - Data zůstávají po restartu?

---

## ⚠️ DŮLEŽITÉ!

### ✅ BEZPEČNÉ:
- ✅ Testuješ v **separátním namespace** (`ucebnice-test`)
- ✅ **NEOVLIVNÍ produkci** (pokud existuje)
- ✅ Můžeš všechno rozbít a smazat
- ✅ Používáš testovací secrets (jiné než produkce)

### ❌ NEDĚLEJ:
- ❌ **Neměň main branch** (zatím!)
- ❌ **Nedeploy do default namespace** (používej `ucebnice-test`)
- ❌ **Nepoužívej produkční secrets** pro test
- ❌ **Nemaž produkční data** (pokud produkce běží)

---

## 📍 Kde Najdeš Příkazy

### Option 1: Script s příkazy (DOPORUČENO)
```bash
# Na serveru spusť:
./scripts/server-test-commands.sh
```
Zobrazí ti všechny příkazy, které potřebuješ kopírovat a spouštět.

### Option 2: Checklist
Otevři `TEST_CHECKLIST.md` - postupuj krok za krokem a zaškrtávej.

### Option 3: Detailní návod
Otevři `SERVER_TEST_GUIDE.md` - kompletní vysvětlení každého kroku.

---

## 🎯 Očekávaný Čas

- **Build Docker image:** 5-10 minut
- **Helm deploy:** 2-5 minut
- **Testy:** 10-20 minut
- **Celkem:** ~30-45 minut

---

## ✅ Když Test Projde

Po úspěšném testu uvidíš:

```
✅ PostgreSQL pod: Running
✅ App pods: Running (všechny)
✅ Health: {"status":"ok","database":"connected"}
✅ Registrace: Funguje
✅ Přihlášení: Funguje  
✅ Data: Zůstávají po restartu
```

**TEĎ můžeš nasadit do produkce!**

---

## ❌ Když Něco Selže

### Postup při chybě:

1. **Zkontroluj logy:**
   ```bash
   kubectl logs -n ucebnice-test <pod-name> --tail=100
   ```

2. **Zkontroluj events:**
   ```bash
   kubectl get events -n ucebnice-test --sort-by='.lastTimestamp'
   ```

3. **Describe pod:**
   ```bash
   kubectl describe pod <pod-name> -n ucebnice-test
   ```

4. **Check troubleshooting sekci:**
   - `SERVER_TEST_GUIDE.md` - sekce "Troubleshooting"
   - `PRODUCTION_SETUP.md` - sekce "Troubleshooting"

5. **Cleanup a zkus znovu:**
   ```bash
   kubectl delete namespace ucebnice-test
   # A začni od začátku
   ```

---

## 🗑️ Cleanup Po Testu

**Vždy po dokončení testu (úspěšného i neúspěšného):**

```bash
# Zastav port-forward
pkill -f "port-forward"

# Smaž test namespace
kubectl delete namespace ucebnice-test

# Smaž test soubory
rm ~/test-secrets.txt
rm /tmp/values-test.yaml

# Vrať default namespace
kubectl config set-context --current --namespace=default
```

---

## 🚀 Po Úspěšném Testu - Produkce

**Pouze pokud test byl 100% úspěšný!**

### Krok 1: Cleanup testu
```bash
kubectl delete namespace ucebnice-test
```

### Krok 2: Merge do main
```bash
git checkout main
git merge filip-bugsrepair-and-databaze-migration
git push origin main
```

### Krok 3: Vytvoř produkční secrets
```bash
# JINÁ hesla než test!
PROD_POSTGRES_PASSWORD=$(openssl rand -base64 32)
PROD_NEXTAUTH_SECRET=$(openssl rand -base64 32)

kubectl create secret generic ucebnice-secret \
  --namespace default \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${PROD_POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${PROD_NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice.praut.cz"
```

### Krok 4: Build produkční image
```bash
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .
docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4
```

### Krok 5: Deploy
```bash
./scripts/deploy-production.sh
```

### Krok 6: Ověř produkci
```bash
# Health check
curl https://ucebnice.praut.cz/api/health

# Browser
# Otevři: https://ucebnice.praut.cz
# Test registrace, přihlášení
```

---

## 📚 Dokumentace

- **`QUICK_START_TESTING.md`** ← TY JSI TADY (tento soubor)
- **`scripts/server-test-commands.sh`** ← Spusť pro příkazy
- **`TEST_CHECKLIST.md`** ← Checklist pro zaškrtávání
- **`SERVER_TEST_GUIDE.md`** ← Detailní návod
- **`DEPLOYMENT_QUICKSTART.md`** ← Rychlý deployment
- **`PRODUCTION_SETUP.md`** ← Kompletní produkční setup
- **`READY_FOR_PRODUCTION.md`** ← Co bylo otestováno

---

## 🎯 TL;DR

```bash
# 1. SSH na server
ssh user@server.praut.cz

# 2. Pull změny
git checkout filip-bugsrepair-and-databaze-migration
git pull

# 3. Zobraz příkazy
./scripts/server-test-commands.sh

# 4. Postupuj podle výstupu scriptu
# 5. Zaškrtávej v TEST_CHECKLIST.md
# 6. Když vše funguje → nasaď do produkce
# 7. Když něco nefunguje → troubleshoot a opakuj
```

---

## 💡 Tipy

- **Otevři 2 terminály:** Jeden pro příkazy, druhý pro sledování logů
- **Kopíruj příkazy ze scriptu:** Minimalizuje chyby
- **Používej checklist:** Nezapomeneš na žádný krok
- **Piš si poznámky:** Do `TEST_CHECKLIST.md` Notes sekce
- **Neboj se smazat a zkusit znovu:** Test namespace je bezpečný

---

**Hodně štěstí! 🚀**

Pokud máš jakékoliv otázky nebo problém, podívej se do příslušné dokumentace výše.
