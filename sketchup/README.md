# Extensia SketchUp „Aparataj Azimut”

Panoul din SketchUp este chiar aplicația configurator, încărcată într-un `UI::HtmlDialog`.
Contractul dintre aplicație și extensie e descris în `src/sketchup.js`.

## Instalare

1. Creează în folderul de Plugins al SketchUp
   (`%APPDATA%\SketchUp\SketchUp 2025\SketchUp\Plugins`, sau versiunea ta) fișierul `azimut_aparataj_dev.rb` cu o singură linie,
   cu calea către clona repo-ului de pe PC-ul respectiv:

   ```ruby
   require 'C:/Users/User/Documents/GitHub/bticino-configurator/sketchup/azimut_aparataj.rb'
   ```

2. Repornește SketchUp → Extensions → Aparataj Azimut → Deschide panoul.

Panoul deschide implicit `https://configurator.atelierazimut.com`, deci butoanele pentru SketchUp apar acolo doar după `npm run deploy`.

## Dezvoltare locală

`npm run dev` (Vite) nu are `/api`, deci nu te poți loga în panou. Pornește backend-ul complet:

```bash
npm run build
npx wrangler pages dev dist --d1 DB=bticino-configurator-db
```

apoi Extensions → Aparataj Azimut → Adresa aplicației… → `http://localhost:8788`.

## Cum se folosește

- **Cubul portocaliu** de pe un ansamblu pornește plasarea: click pe un perete, tastează înălțimea axului în mm, Esc renunță.
  Pe un ansamblu deja plasat, cubul reface geometria (module, culoare, mărime) și îl mută la înălțimea din aplicație.
- Cât timp proiectul e deschis în panou, fiecare schimbare din model ajunge singură în aplicație:
  copiile făcute în SketchUp devin ansambluri noi, iar camera și înălțimea se actualizează.
- **Sincronizează din model** face același lucru la cerere și, în plus, îți propune spre ștergere ce lipsește din model
  (sincronizarea automată nu șterge nimic, fiindcă fișierul deschis poate fi al altui proiect).
- Ștergerea unui ansamblu din aplicație îl șterge și din model.
- Ansamblurile stau pe tag-urile „Aparataj - Prize” și „Aparataj - Întrerupătoare”; numele componentei e codul (P01, I03…).

Înălțimea se măsoară de la baza feței peretelui pe care ai plasat, până la axul ramei.
Dimensiunile ramelor sunt aproximate din proporțiile din aplicație (modul de 22,5 mm; la sistemul cu posturi, pas de 35,5 mm).
La sistemul cu posturi modulele stau pe pozițiile din aplicație, cu golurile dintre ele.

## Date

Coloanele `assemblies.mount_height_mm` și `assemblies.sketchup_id` se adaugă singure în D1 la primul request după deploy
(`functions/_shared/schema.js`).
