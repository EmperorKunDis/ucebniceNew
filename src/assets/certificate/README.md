# Certifikát Assets

## Potřebné soubory:

### 1. `CertifikatFRnDA.png`

Pozadí certifikátu (doporučená velikost: 1754x1240px pro A4 landscape @ 150 DPI)

### 2. `layout.json`

Popisuje kde se má vložit text. Příklad níže.

### 3. `preview.png` (volitelné)

Screenshot ukazující volná místa pro text

---

## Vzorový layout.json

```json
{
  "width": 1754,
  "height": 1240,
  "fields": [
    {
      "id": "name",
      "label": "Jméno absolventa",
      "x": 877,
      "y": 450,
      "fontSize": 48,
      "fontFamily": "serif",
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "align": "center",
      "maxWidth": 800
    },
    {
      "id": "course",
      "label": "Název kurzu",
      "x": 877,
      "y": 550,
      "fontSize": 32,
      "fontFamily": "sans-serif",
      "color": "#333333",
      "align": "center",
      "maxWidth": 600
    },
    {
      "id": "date",
      "label": "Datum dokončení",
      "x": 877,
      "y": 650,
      "fontSize": 24,
      "fontFamily": "sans-serif",
      "color": "#666666",
      "align": "center"
    },
    {
      "id": "certificateId",
      "label": "ID certifikátu",
      "x": 877,
      "y": 1100,
      "fontSize": 14,
      "fontFamily": "monospace",
      "color": "#999999",
      "align": "center"
    },
    {
      "id": "qrCode",
      "label": "QR kód pro ověření",
      "x": 1550,
      "y": 1050,
      "width": 120,
      "height": 120
    }
  ]
}
```

## Jak vyplnit:

1. Vlož `CertifikatFRnDA.png` do této složky
2. Uprav `layout.json` podle skutečných pozic volných míst na obrázku
3. Spusť generátor certifikátů

Souřadnice `x`, `y` jsou v pixelech od levého horního rohu.
`align: "center"` znamená že `x` je střed textu.
