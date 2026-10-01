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
    id: '2026-10-01-plan',
    date: '2026-10-01',
    title: {
      ro: 'Planul electric pe proiect',
      en: 'Electrical plan in the project',
    },
    items: {
      ro: [
        'Butonul „Import plan" din proiect încarcă un plan JPEG, PNG sau PDF. Fiecare pagină din PDF devine un plan separat, de exemplu câte unul pe etaj.',
        'Cu planul deschis, lista stă în stânga și planul în dreapta. Planul se poate ascunde oricând, iar lista rămâne ca înainte.',
        'Trage prizele și întrerupătoarele din listă pe plan. Apar ca cerculețe albe cu codul lor (P01, I01) și se pot muta oricând.',
        'Iconița de lângă cod arată că aparatul e pe plan. Un clic pe ea îl găsește pe plan.',
      ],
      en: [
        'The "Import plan" button in a project loads a JPEG, PNG or PDF plan. Each PDF page becomes a separate plan, for example one per floor.',
        'With the plan open, the list sits on the left and the plan on the right. The plan can be hidden at any time and the list stays as before.',
        'Drag outlets and switches from the list onto the plan. They show as white circles with their code (P01, I01) and can be moved at any time.',
        'The icon next to the code shows the assembly is on the plan. Clicking it finds it on the plan.',
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
