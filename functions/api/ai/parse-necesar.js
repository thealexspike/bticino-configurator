import { json, readJson, requireUser } from '../../_shared/auth.js';

// POST /api/ai/parse-necesar — extrage ansambluri dintr-un PDF (necesar/listă prize)
// Body: { pdfBase64, modules: [{id, nameEn, nameRo, size, category}], system }
// Răspuns: { assemblies: [{type, room, size, modules: [moduleId]}], warnings, summary }
// Necesită secretul ANTHROPIC_API_KEY pe proiectul Pages.

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    assemblies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['outlet', 'switch'] },
          room: { type: 'string' },
          size: { type: 'integer' },
          modules: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'room', 'size', 'modules'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['assemblies', 'warnings', 'summary'],
  additionalProperties: false,
};

export async function onRequestPost(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Importul AI nu este configurat încă (lipsește ANTHROPIC_API_KEY)' }, 503);
  }

  const body = await readJson(context.request);
  const pdfBase64 = body?.pdfBase64;
  const modules = Array.isArray(body?.modules) ? body.modules : [];
  const systemName = String(body?.system || 'BTicino');

  if (!pdfBase64 || typeof pdfBase64 !== 'string') {
    return json({ error: 'Lipsește PDF-ul' }, 400);
  }

  const moduleCatalog = modules.map(m =>
    `- id: ${m.id} | ${m.nameRo || m.nameEn} | ${m.size} modul(e) | categoria: ${m.category}`
  ).join('\n');

  const prompt = `Analizează acest PDF — un necesar de aparataj electric (prize, întrerupătoare) pentru un proiect rezidențial, sistem ${systemName}.

Extrage fiecare ansamblu (punct de aparataj) menționat în document. Pentru fiecare ansamblu stabilește:
- type: "outlet" (priză) sau "switch" (întrerupător/comandă)
- room: camera în care se află (exact cum apare în document, în română)
- size: numărul total de module (2, 3, 4, 6 sau 7)
- modules: lista de id-uri de module din catalogul de mai jos care compun ansamblul; suma dimensiunilor modulelor trebuie să fie <= size

Folosește DOAR id-uri din acest catalog de module disponibile:
${moduleCatalog}

Dacă un element din PDF nu are corespondent clar în catalog, alege cel mai apropiat modul și adaugă un avertisment în "warnings" (în română). Adaugă în "summary" o propoziție scurtă în română despre ce ai extras.`;

  const anthropicRequest = {
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(anthropicRequest),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    console.error('Anthropic API error:', resp.status, errBody);
    return json({ error: 'Eroare la procesarea AI a documentului' }, 502);
  }

  const result = await resp.json();

  if (result.stop_reason === 'refusal') {
    return json({ error: 'Documentul nu a putut fi procesat' }, 422);
  }
  if (result.stop_reason === 'max_tokens') {
    return json({ error: 'Documentul este prea mare pentru procesare — încearcă un PDF mai scurt' }, 422);
  }

  const textBlock = (result.content || []).find(b => b.type === 'text');
  if (!textBlock) {
    return json({ error: 'Răspuns AI gol' }, 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return json({ error: 'Răspuns AI invalid' }, 502);
  }

  return json({
    assemblies: parsed.assemblies || [],
    warnings: parsed.warnings || [],
    summary: parsed.summary || '',
  });
}
