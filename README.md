# Configurator Aparataj (bticino-configurator)

Aplicație web pentru configurarea aparatajului electric (prize, întrerupătoare) pe proiecte de client și generarea documentelor aferente: listă prize/întrerupătoare cu schiță, necesar pentru furnizor (BOQ) și ofertă cu TVA.

Suportă mai multe sisteme de aparataj, fiecare cu librărie proprie de SKU-uri, prețuri și proporții vizuale: BTicino Living Now, Gewiss Chorus, Schneider Unica și un sistem generic (estimativ). Interfața este bilingvă RO / EN.

## Stack

| Strat | Tehnologie |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 3, lucide-react |
| PDF | jsPDF + jspdf-autotable (generare în browser) |
| Backend | Cloudflare Pages Functions (`functions/`) |
| Bază de date | Cloudflare D1 (SQLite), schema în `schema.sql` |
| Autentificare | cookie de sesiune HttpOnly, parole PBKDF2, sesiuni 30 zile |
| Import AI | endpoint propriu care apelează Claude pentru a extrage ansambluri dintr-un PDF |

Hosting: Cloudflare Pages, configurat în `wrangler.toml`. SPA fallback în `public/_redirects`.

## Structura codului

```
src/
  main.jsx                  punct de intrare
  App.jsx                   stare globală: sesiune, proiecte, librării per sistem, rutare între ecrane
  api.js                    client REST pentru /api (fetch cu cookie de sesiune)
  Auth.jsx                  ecran login
  AdminUsers.jsx            administrare conturi (doar admin)
  i18n.js                   traduceri RO/EN, LanguageContext, useTranslation, useLanguage
  data/libraries.js         librăriile default per sistem, SYSTEM_PROPORTIONS (geometria ramelor)
  lib/library.js            LibraryContext, lookup SKU/preț/nume din librăria activă, culori, dimensiuni
  lib/pricing.js            TVA și conversii preț achiziție / adaos / preț cu-fără TVA
  lib/assemblies.js         id-uri, coduri P01/I01, renumerotare, reordonare, excluderi din necesar
  graphics/colors.js        utilitare hex/luminanță, paleta SVG derivată din culoarea modulului
  graphics/moduleGraphics.jsx  desenele SVG ale modulelor, pe tip de modul
  components/
    visual/ModuleVisuals.jsx   ModuleImage, FacePlateFrame, ModuleThumbnail, AssemblyThumbnail
    GlobalHeader.jsx, LanguageSwitcher.jsx, PriceInput.jsx, RoomSelector.jsx
    ProjectList.jsx            lista de proiecte + creare/ștergere
    ProjectDetail.jsx          tab-uri: prize, întrerupătoare, necesar, ofertă, profit; import AI
    AssemblyList.jsx           lista ansamblurilor unui tip, duplicare, mutare, export PDF
    AssemblyEditor.jsx         editorul vizual al unui ansamblu (ramă, module, culoare, doză)
    BOQView.jsx, QuoteView.jsx, ProfitView.jsx
    LibraryPage.jsx            editor de librărie (module, prețuri, culori, preseturi) per sistem
  pdf/
    common.js                 removeDiacritics, svgToImage
    assemblyListPdf.js        lista prize/întrerupătoare cu schițe
    boqPdf.js                 necesar furnizor
    quotePdf.js               ofertă client cu TVA

functions/
  _shared/auth.js           JSON helpers, hash parole, sesiuni, requireUser / requireAdmin
  api/_middleware.js        atașează utilizatorul din cookie la fiecare cerere
  api/auth/*                login, logout, me, schimbare parolă, signup (închis public)
  api/projects/*            CRUD proiecte; PUT /projects/:id/assemblies sincronizează toate ansamblurile într-un batch D1
  api/library.js            GET librării (orice utilizator), PUT upsert (doar admin)
  api/admin/users/*         administrare conturi (doar admin)
  api/ai/parse-necesar.js   import AI din PDF
```

Regula de dependențe: `data` și `i18n` nu importă nimic din aplicație; `lib` importă doar `data`; `graphics` importă doar `graphics/colors`; `components` și `pdf` importă oricare dintre cele de mai sus; `App.jsx` importă doar componente, `data`, `i18n`, `lib`.

## Model de date

- **projects**: `id, user_id, name, client_name, client_contact, system, excluded_items (JSON), created_at`
- **assemblies**: `id, project_id, type (outlet|switch), code (P01/I01), room, size (2|3|4|6), color, wall_box_type (masonry|drywall), modules (JSON: [{id, moduleId}]), notes, created_at`
- **global_library**: `id` (`main` = bticino, altfel id-ul sistemului), `library_data` (JSON cu toată librăria), `updated_at, updated_by`
- **users**, **sessions**: conturi și sesiuni; emailurile `@atelierazimut.com` sunt admini (vezi `isAdminEmail` în `functions/_shared/auth.js`)

Librăriile default din `src/data/libraries.js` sunt folosite când D1 nu are rând pentru sistemul respectiv. Un admin le poate edita din aplicație; salvarea se face automat la fiecare modificare.

**Regula id-urilor de module.** Același produs are același `id` în toate sistemele, ca un proiect să poată fi mutat de pe un sistem pe altul fără remapare. Întrerupătorul simplu, cap scară și cap cruce sunt module separate pe 1M și 2M (`switch_simple` = 1M, `switch_simple_2m`, `switch_stair_1m`, `switch_stair_2m`, `switch_cross_1m`, `switch_cross_2m`); `coax` și `rj45` există peste tot. Un modul nou comun tuturor sistemelor se adaugă în `scripts/lib/moduleIdMigration.mjs`, apoi `node scripts/sync-default-libraries.mjs` actualizează default-urile din cod. La schimbarea sistemului unui proiect, modulele rămân pe același id, iar culorile care nu există în sistemul nou sunt înlocuite cu o culoare aleasă din sistemul nou. `scripts/migrate-module-ids.mjs` aplică aceste reguli pe D1 (raport fără `--apply`, scriere cu `--apply`, backup automat în `scripts/backup-*.json`).

**Noutăți (patch notes).** Panoul de pe pagina principală citește `src/data/changelog.js`. Doar la finalizarea unei funcții importante pentru utilizatori, nu la fiecare modificare, adaugă o intrare la începutul listei, în română și engleză, apoi publică. Eticheta „Nou" reapare automat pentru toți la fiecare intrare nouă.

**Grafica unui modul.** Câmpul opțional `graphic` pe un modul alege desenul dintre cele predefinite în `src/graphics/moduleGraphics.jsx` (`GRAPHIC_TYPES`). Fără el, desenul se deduce din id. Se alege din editorul de librărie, cu previzualizare.

## Rulare locală

```bash
npm install
npm run dev
```

`npm run dev` pornește doar frontend-ul Vite, fără `/api`. Pentru backend-ul complet local (Pages Functions + D1 local):

```bash
npm run build
npx wrangler pages dev dist --d1 DB=bticino-configurator-db
```

Prima dată, aplică schema pe baza locală:

```bash
npx wrangler d1 execute bticino-configurator-db --local --file schema.sql
```

Verificări:

```bash
npm run lint
npm run build
```

## Deploy

Proiectul Cloudflare Pages **nu** este legat de GitHub: push-ul pe `main` nu publică nimic. Publicarea se face manual, după commit:

```bash
npm run deploy
```

Scriptul face build și urcă `dist/` plus `functions/` în producție (`configurator.atelierazimut.com`). Necesită `npx wrangler login`. Pe proiectul Pages trebuie setate:

- binding D1 `DB` → `bticino-configurator-db` (din `wrangler.toml`)
- secretul `ANTHROPIC_API_KEY` pentru importul AI (fără el endpoint-ul răspunde 503, restul aplicației merge)

Schema pe baza de producție:

```bash
npx wrangler d1 execute bticino-configurator-db --remote --file schema.sql
```

Înregistrarea publică este închisă; conturile se creează din ecranul de administrare sau direct în D1. `scripts/migrate-from-supabase.mjs` este scriptul folosit o singură dată la migrarea de pe Supabase și nu mai este necesar în operare.
