// Noutăți afișate pe pagina principală, cea mai recentă prima.
//
// Pentru o actualizare nouă, adaugă un obiect la ÎNCEPUTUL listei:
//   id     - unic, de preferat data (ex. '2026-10-15'); schimbarea lui marchează nota ca „Nou"
//   date   - data afișată, format AAAA-LL-ZZ
//   title  - titlu scurt, { ro, en }
//   items  - ce s-a schimbat, din perspectiva utilizatorului, { ro: [...], en: [...] }
//
// Scrie doar ce vede un utilizator obișnuit. Modificările interne sau doar pentru
// administratori nu intră aici.

export const CHANGELOG = [
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
