# Oprava Google Colab odkazů

## Problém

Google Colab nemohl načíst notebooky kvůli chybné cestě:

```
❌ https://github.com/EmperorKunDis/JupyterNotebooks/blob/main/colab_notebooks/kapitola_01_...
```

Chyba: `404 Not Found` - složka `colab_notebooks` neexistuje v repozitáři.

## Řešení

### 1. Struktura GitHub repozitáře

Zjištěno, že notebooky jsou **přímo v root složce** repozitáře:

```
https://github.com/EmperorKunDis/JupyterNotebooks/blob/main/kapitola_01.ipynb ✅
https://github.com/EmperorKunDis/JupyterNotebooks/blob/main/kapitola_02.ipynb ✅
...
```

### 2. Opravené soubory

#### `src/components/chapters/NotebookLinks.tsx`

**Před:**

```typescript
const downloadUrl = chapter.colabNotebook ? `/colab_notebooks/${chapter.colabNotebook}` : null

const colabUrl = downloadUrl
  ? `https://colab.research.google.com/github/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/colab_notebooks/${chapter.colabNotebook}`
  : null
```

**Po:**

```typescript
const colabUrl = chapter.colabNotebook
  ? `https://colab.research.google.com/github/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${chapter.colabNotebook}`
  : null

const downloadUrl = chapter.colabNotebook
  ? `https://raw.githubusercontent.com/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${chapter.colabNotebook}`
  : null
```

#### `src/data/chapters.ts`

**Před:**

```typescript
colabNotebook: 'kapitola_01_úvod_do_terminálu_a_příkazové_řádky.ipynb'
colabNotebook: 'kapitola_02_instalace_vývojových_nástrojů.ipynb'
...
```

**Po:**

```typescript
colabNotebook: 'kapitola_01.ipynb'
colabNotebook: 'kapitola_02.ipynb'
...
```

## Výsledné URL

### Pro Kapitolu 1:

- ✅ **Colab odkaz:** `https://colab.research.google.com/github/EmperorKunDis/JupyterNotebooks/blob/main/kapitola_01.ipynb`
- ✅ **Download odkaz:** `https://raw.githubusercontent.com/EmperorKunDis/JupyterNotebooks/main/kapitola_01.ipynb`

### Jak testovat:

1. Spusťte aplikaci: `npm run dev`
2. Přejděte na kapitolu 1: http://localhost:3000/chapters/01
3. Klikněte na "Spustit v Colab"
4. Měl by se otevřít Google Colab s notebookem

## Změněné soubory

- ✅ `src/components/chapters/NotebookLinks.tsx` - opraveny cesty k notebookům
- ✅ `src/data/chapters.ts` - zjednodušeny názvy souborů (40 kapitol)

## Automatická oprava

Použit sed příkaz pro hromadnou opravu všech 40 kapitol:

```bash
sed -E "s/colabNotebook: 'kapitola_([0-9]{2})_[^']+\.ipynb'/colabNotebook: 'kapitola_\1.ipynb'/g"
```

---

**Datum opravy:** 2025-11-10  
**Status:** ✅ Opraveno a otestováno
