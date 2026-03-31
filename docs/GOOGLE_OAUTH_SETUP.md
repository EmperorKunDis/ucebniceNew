# Nastavení Google OAuth pro Učebnice AI

## Krok 1: Vytvoření projektu v Google Cloud Console

1. Jdi na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvoř nový projekt nebo vyber existující
3. V levém menu vyber **APIs & Services** → **Credentials**

## Krok 2: Konfigurace OAuth Consent Screen

1. Klikni na **OAuth consent screen** v levém menu
2. Vyber **External** (pokud to není jen pro interní použití)
3. Vyplň:
   - **App name**: `Učebnice programování AI`
   - **User support email**: tvůj email
   - **Developer contact email**: tvůj email
4. Klikni **Save and Continue**
5. V **Scopes** přidej:
   - `email`
   - `profile`
   - `openid`
6. Klikni **Save and Continue**
7. V **Test users** můžeš přidat testovací emaily (volitelné)
8. Klikni **Save and Continue**

## Krok 3: Vytvoření OAuth Credentials

1. Jdi zpět na **Credentials**
2. Klikni **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Vyber **Web application**
4. Vyplň:
   - **Name**: `Ucebnice AI Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://tvoje-domena.cz
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://tvoje-domena.cz/api/auth/callback/google
     ```
5. Klikni **CREATE**

## Krok 4: Zkopírování credentials

Po vytvoření se ti zobrazí:

- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

## Krok 5: Přidání do .env

Otevři soubor `.env` a přidej:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

## Krok 6: Ověření konfigurace

Po přidání credentials restartuj dev server:

```bash
npm run dev
```

Na přihlašovací stránce by mělo fungovat tlačítko "Pokračovat s Google".

---

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Zkontroluj že redirect URI v Google Console přesně odpovídá:
  `http://localhost:3000/api/auth/callback/google`
- Pozor na trailing slash!

### "Access blocked: This app's request is invalid"

- Zkontroluj OAuth consent screen
- Ujisti se že jsi přidal správné scopes

### "This app isn't verified"

- Pro vývoj to nevadí - klikni na "Advanced" → "Go to app (unsafe)"
- Pro produkci budeš muset projít Google verification process

---

## Produkční nasazení

Pro produkci nezapomeň:

1. Přidat produkční doménu do Authorized origins
2. Přidat produkční callback URL
3. Případně projít verification process pro veřejný přístup
