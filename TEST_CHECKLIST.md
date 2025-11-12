# ✅ Test Checklist - Postupuj krok za krokem

**Datum testu:** _______________  
**Tester:** Filip  
**Branch:** `filip-bugsrepair-and-databaze-migration`  
**Test namespace:** `ucebnice-test`

---

## 📋 PRE-TEST CHECKLIST

- [ ] Máš SSH přístup na server
- [ ] Máš přístup k Kubernetes clusteru (`kubectl get nodes`)
- [ ] Máš přístup k Harbor registry
- [ ] Branch je pushnutý na GitHub
- [ ] Máš otevřenou dokumentaci: `SERVER_TEST_GUIDE.md`

---

## 🚀 DEPLOYMENT CHECKLIST

### Krok 1: SSH a Git ✅
- [ ] SSH připojení na server funguje
- [ ] `git fetch origin` úspěšný
- [ ] `git checkout filip-bugsrepair-and-databaze-migration` úspěšný
- [ ] `git pull` stáhl nejnovější změny
- [ ] `git log` ukazuje commity:
  - [ ] `5efc7c6` - Testing scripts
  - [ ] `50794e3` - PostgreSQL setup

**Poznámky:**
```
_________________________________________________
_________________________________________________
```

---

### Krok 2: Testovací Namespace ✅
- [ ] `kubectl create namespace ucebnice-test` úspěšný
- [ ] `kubectl get namespaces` ukazuje `ucebnice-test`
- [ ] Namespace je nastavený jako default

**Poznámky:**
```
_________________________________________________
```

---

### Krok 3: Secrets ✅
- [ ] POSTGRES_PASSWORD vygenerované
- [ ] NEXTAUTH_SECRET vygenerované
- [ ] Hesla uložená do `~/test-secrets.txt`
- [ ] `kubectl create secret` úspěšný
- [ ] `kubectl get secret ucebnice-secret -n ucebnice-test` existuje

**Ulož hesla ZDE (pro případ potřeby):**
```
POSTGRES_PASSWORD: _________________________________
NEXTAUTH_SECRET:   _________________________________
```

---

### Krok 4: Docker Build ✅
- [ ] `docker build` začal
- [ ] Build běžel bez chyb
- [ ] Build dokončen (trvalo: _____ minut)
- [ ] `docker push` úspěšný
- [ ] Image je v Harbor registry

**Build errors (pokud nějaké):**
```
_________________________________________________
_________________________________________________
```

---

### Krok 5: Helm Values ✅
- [ ] Kopie vytvořena: `/tmp/values-test.yaml`
- [ ] Změněno: `image.tag: "test-v1.0.4"`
- [ ] Změněno: `ingress.hosts[0].host: "ucebnice-test.praut.cz"`
- [ ] Změněno: `config.NEXTAUTH_URL`
- [ ] Změněno: `postgresql.persistence.size: "5Gi"`

---

### Krok 6: Helm Deploy ✅
- [ ] `helm upgrade --install` spuštěný
- [ ] Helm install dokončen (trvalo: _____ minut)
- [ ] Žádné chyby během instalace

**Helm output:**
```
_________________________________________________
_________________________________________________
```

---

## 🔍 VERIFICATION CHECKLIST

### Krok 7: PostgreSQL ✅
- [ ] PostgreSQL pod existuje
- [ ] Pod je ve stavu `Running`
- [ ] Pod je `Healthy` (podle healthcheck)
- [ ] `pg_isready` vrací success
- [ ] Připojení do PostgreSQL funguje
- [ ] Tabulky existují (`\dt` ukazuje User, Chapter, Progress, atd.)

**PostgreSQL pod name:**
```
_________________________________________________
```

**Tabulky nalezené:**
```
[ ] User
[ ] Chapter
[ ] Progress
[ ] Achievement
[ ] Badge
[ ] _další_: _____________________________________
```

---

### Krok 8: Aplikace ✅
- [ ] App pody existují (kolik: _____)
- [ ] Všechny pody jsou `Running`
- [ ] Všechny pody jsou `Ready`
- [ ] Logy neobsahují kritické chyby
- [ ] DATABASE_URL environment je nastavená
- [ ] NEXTAUTH_SECRET environment je nastavený

**App pod names:**
```
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________
```

**Chyby v logách (pokud nějaké):**
```
_________________________________________________
_________________________________________________
```

---

### Krok 9: Health Endpoint ✅
- [ ] Port-forward funguje
- [ ] `curl http://localhost:8080/api/health` odpovídá
- [ ] Response obsahuje `"status": "ok"`
- [ ] Response obsahuje `"database": "connected"`
- [ ] Response time je přijatelný (< 1s)

**Health response:**
```json
_________________________________________________
_________________________________________________
```

---

### Krok 10: Registrace ✅
- [ ] Browser otevřen na `http://localhost:8080`
- [ ] Registrační formulář se zobrazuje
- [ ] Registrace testovacího uživatele úspěšná
- [ ] Uživatel je v databázi (ověřeno SQL dotazem)
- [ ] Žádné chyby v konzoli browseru

**Test user credentials:**
```
Email:    test@example.com
Username: testuser
Password: ***************
```

**User ID v databázi:** _______________________________

---

### Krok 11: Přihlášení ✅
- [ ] Odhlášení funguje
- [ ] Přihlašovací formulář se zobrazuje
- [ ] Přihlášení s test uživatelem úspěšné
- [ ] Dashboard se načetl
- [ ] Uživatelské jméno se zobrazuje správně
- [ ] XP a level se zobrazují

**Dashboard zobrazuje:**
```
Jméno: _____________________________________________
Level: _____________________________________________
XP:    _____________________________________________
```

---

### Krok 12: Funkční Test ✅
- [ ] Kapitoly se načítají
- [ ] Můžeš otevřít kapitolu
- [ ] Obsah kapitoly se zobrazuje
- [ ] Můžeš odpovědět na otázku (pokud je)
- [ ] Data se ukládají do databáze

**Test kapitola:** _____________________________________

---

### Krok 13: Prisma Migrations ✅
- [ ] `npx prisma migrate status` vrací "up to date"
- [ ] Žádné pending migrations
- [ ] Schema je synchronizované s databází

**Migrate status output:**
```
_________________________________________________
```

---

### Krok 14: Restart Test ✅
- [ ] `kubectl rollout restart` úspěšný
- [ ] Pody se restartují
- [ ] Nové pody jsou `Running`
- [ ] Health endpoint stále odpovídá
- [ ] Přihlášení stále funguje
- [ ] Data zůstala zachována (test user existuje)
- [ ] Žádná ztráta dat

**Restart time:** _____ sekund

---

## 📊 FINAL CHECKLIST

### Všechno funguje? ✅
- [ ] PostgreSQL běží stabilně
- [ ] Aplikace běží stabilně
- [ ] Health check je OK
- [ ] Registrace funguje
- [ ] Přihlášení funguje
- [ ] Data persistence funguje
- [ ] Restart nepřinesl problémy
- [ ] Žádné error logy
- [ ] Žádné memory/CPU problémy

---

## 🐛 PROBLÉMY (pokud nějaké)

### Problémy nalezené:
```
1. _________________________________________________
   Status: [ ] Vyřešeno  [ ] Nevyřešeno
   
2. _________________________________________________
   Status: [ ] Vyřešeno  [ ] Nevyřešeno
   
3. _________________________________________________
   Status: [ ] Vyřešeno  [ ] Nevyřešeno
```

### Řešení aplikovaná:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🗑️ CLEANUP CHECKLIST

- [ ] Port-forward zastaven (`pkill -f port-forward`)
- [ ] Test namespace smazán (`kubectl delete namespace ucebnice-test`)
- [ ] Test secrets smazané (`rm ~/test-secrets.txt`)
- [ ] Test values smazané (`rm /tmp/values-test.yaml`)
- [ ] Docker test image smazán (volitelné)
- [ ] Vráceno na default namespace

---

## ✅ FINÁLNÍ ROZHODNUTÍ

### Test výsledek:
- [ ] ✅ **PASS** - Všechno funguje, můžu nasadit do produkce
- [ ] ⚠️ **PARTIAL** - Funguje, ale s drobnými problémy
- [ ] ❌ **FAIL** - Nefunguje, potřeba opravit

### Poznámky k rozhodnutí:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

### Další kroky:
```
[ ] Nasadit do produkce (pokud PASS)
[ ] Opravit problémy (pokud FAIL)
[ ] Konzultovat s týmem (pokud PARTIAL)
```

---

## 🚀 PRODUKČNÍ DEPLOYMENT (až po PASSu)

**Pouze když všechny testy prošly!**

- [ ] Cleanup test prostředí dokončen
- [ ] Připravené produkční secrets (JINÁ hesla než test!)
- [ ] Produkční values zkontrolované
- [ ] Merge do main branch
- [ ] Push na GitHub
- [ ] Spuštěn `./scripts/deploy-production.sh`
- [ ] Produkční deployment sledován
- [ ] Produkční health check OK
- [ ] Produkční test registrace OK

---

## 📝 NOTES & COMMENTS

```
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**Test dokončen:** _______________ (datum a čas)  
**Výsledek:** _______________  
**Podpis:** _______________

---

**✅ Tento checklist vytiskni nebo si ho otevři a postupně zaškrtávej během testování!**
