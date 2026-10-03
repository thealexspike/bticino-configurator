// Noutăți afișate pe pagina principală, cea mai recentă prima.
//
// Pentru o actualizare nouă, adaugă un obiect la ÎNCEPUTUL listei:
//   id     - unic, de preferat data (ex. '2026-10-15'); schimbarea lui marchează nota ca „Nou"
//   date   - data afișată, format AAAA-LL-ZZ
//   title  - titlu scurt, { ro, en }
//   items  - ce s-a schimbat, din perspectiva utilizatorului, { ro: [...], en: [...] }
//
// Adaugă o notă DOAR când se finalizează o funcție importantă pentru utilizatori,
// nu la fiecare modificare. Fix-urile mărunte, ajustările de interfață, lucrurile
// interne sau doar pentru administratori nu intră aici. Mai multe funcții mici
// livrate împreună pot intra într-o singură notă.

export const CHANGELOG = [
  {
    id: '2026-10-03-posts-half',
    date: '2026-10-03',
    title: {
      ro: 'Sistem nou: aparataj cu posturi',
      en: 'New system: post-type wiring devices',
    },
    items: {
      ro: [
        'Sistem nou „Sistem cu posturi generic (estimativ)", pentru aparataj cu rame de sticlă pe posturi (tip Livolo, Tosyco). Un post ține un mecanism, iar ramele au 1-4 posturi.',
        'Pentru fiecare aparat alegi doze individuale (câte una pe post) sau o doză multi-post. Implicit: individuale la zidărie, multi-post la gips-carton.',
        'Rama decor vine la pachet cu rama de montaj, deci în necesar și ofertă apare un singur rând pentru ramă.',
        'Modulele de 1M ocupă jumătate de post (priză Italia, TV, RJ45, întrerupătoare 1/2, obturator 1/2) și se pun câte două pe un post. Suportul pentru module 1/2 se adaugă automat în necesar, câte unul pe fiecare post care le conține.',
        'Desenul arată rama cu câte o fereastră pe fiecare post, în editor, în listă, pe plan și în PDF.',
        'Presetele care nu se potrivesc cu ramele sistemului apar estompate, cu motivul.',
      ],
      en: [
        'New "Generic Post System (estimate)" for glass-frame post devices (Livolo, Tosyco style). Each post holds one device; frames have 1-4 posts.',
        'For each assembly choose individual boxes (one per post) or a single multi-post box. Default: individual for masonry, multi-post for drywall.',
        'The cover plate comes with its mounting frame, so the quantities and the quote show a single frame line.',
        '1M modules take half a post (Italian outlet, TV, RJ45, half switches, half blank) and go two per post. The half-module support is added automatically, one per post that holds them.',
        'The drawing shows the frame with one window per post, in the editor, the list, the plan and the PDF.',
        'Presets that do not fit the system frames are shown greyed out, with the reason.',
      ],
    },
  },
  {
    id: '2026-10-01-plan-photos',
    date: '2026-10-01',
    title: {
      ro: 'Planul electric și pozele de pe șantier',
      en: 'Electrical plan and site photos',
    },
    items: {
      ro: [
        'Butonul „Import plan" din proiect încarcă un plan JPEG, PNG sau PDF. Fiecare pagină din PDF devine un plan separat, de exemplu câte unul pe etaj.',
        'Cu planul deschis, lista stă în stânga și planul în dreapta. Planul se poate ascunde oricând, iar lista rămâne ca înainte.',
        'Trage prizele și întrerupătoarele din listă pe plan. Apar ca cerculețe albe cu codul lor (P01, I01) și se pot muta oricând.',
        'Iconița de lângă cod arată că aparatul e pe plan. Un clic pe ea îl găsește pe plan.',
        'Fiecare aparat poate avea poze de pe șantier, de exemplu peretele cu notițele despre aparataj și doză. Copiezi poza și o lipești cu Ctrl+V, din butonul cu aparat foto din listă sau din fișa aparatului de pe plan.',
        'Pe plan, când treci cu mouse-ul peste un cerculeț, vezi camera și poza aparatului. Cerculețele cu poze au un punct albastru.',
      ],
      en: [
        'The "Import plan" button in a project loads a JPEG, PNG or PDF plan. Each PDF page becomes a separate plan, for example one per floor.',
        'With the plan open, the list sits on the left and the plan on the right. The plan can be hidden at any time and the list stays as before.',
        'Drag outlets and switches from the list onto the plan. They show as white circles with their code (P01, I01) and can be moved at any time.',
        'The icon next to the code shows the assembly is on the plan. Clicking it finds it on the plan.',
        'Each assembly can have site photos, for example the wall with notes about the device and the wall box. Copy the photo and paste it with Ctrl+V, from the camera button in the list or from the assembly card on the plan.',
        'On the plan, hovering over a circle shows the room and the assembly photo. Circles with photos have a blue dot.',
      ],
    },
  },
  {
    id: '2026-10-01',
    date: '2026-10-01',
    title: {
      ro: 'Module noi în toate sistemele și schimbarea sistemului',
      en: 'New modules in every system and switching systems',
    },
    items: {
      ro: [
        'Întrerupătorul simplu, cap scară și cap cruce sunt disponibile pe 1M și pe 2M în toate sistemele.',
        'Priza TV (coaxial) și priza de date RJ45 sunt disponibile în toate sistemele.',
        'Când schimbi sistemul unui proiect, modulele rămân aceleași. Culorile care nu există în noul sistem se înlocuiesc cu o culoare aleasă de tine.',
        'Fiecare aparataj are un câmp de observații, care apare și în PDF-ul pentru electrician.',
        'Un aparataj poate fi mutat între prize și întrerupătoare.',
        'Modulele identice sunt grupate în listă, de exemplu „5× Întrerupător".',
        'Sistem nou „Sistem modular generic (estimativ)", pentru necesar independent de producător.',
      ],
      en: [
        'Simple, stair and cross switches are available in both 1M and 2M in every system.',
        'TV (coaxial) and RJ45 data outlets are available in every system.',
        'When you change a project\'s system, the modules stay the same. Colors that do not exist in the new system are replaced with one you choose.',
        'Every assembly has a notes field, which also appears in the electrician PDF.',
        'An assembly can be moved between outlets and switches.',
        'Identical modules are grouped in the list, for example "5× Switch".',
        'New "Generic Modular (estimate)" system, for brand-independent quantities.',
      ],
    },
  },
  {
    id: '2026-07-13',
    date: '2026-07-13',
    title: {
      ro: 'Excludere articole din necesar și ofertă',
      en: 'Exclude items from quantities and quote',
    },
    items: {
      ro: [
        'Poți exclude articole sau categorii întregi din necesar și ofertă, de exemplu dozele deja montate.',
        'Aplicația rulează pe o infrastructură nouă. Conturile și proiectele au fost păstrate.',
      ],
      en: [
        'You can exclude single items or whole categories from the quantities and the quote, for example wall boxes already installed.',
        'The app runs on new infrastructure. Accounts and projects were kept.',
      ],
    },
  },
];
