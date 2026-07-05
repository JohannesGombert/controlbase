import { adminClient, json, requireUser } from './whoop-utils.mjs'

const OPENAI_API = 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-4o-mini'

function extractOutputText(data) {
  if (typeof data.output_text === 'string') return data.output_text
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') return content.text
    }
  }
  return ''
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, Math.round(number)))
}

async function analyzeWithOpenAI({ imageUrl, meal }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY fehlt in Netlify.')

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL
  const prompt = [
    'Schaetze die Nahrungswerte des Essens auf dem Foto.',
    'Nutze die geplante Mahlzeit nur als Kontext, aber priorisiere das sichtbare Foto.',
    'Antworte strikt als JSON mit calories, protein, confidence, description und assumptions.',
    '',
    `Geplante Mahlzeit: ${meal.title}`,
    `Geplante kcal: ${meal.calories ?? 'unbekannt'}`,
    `Geplantes Protein: ${meal.protein ?? 'unbekannt'} g`,
    `Geplante Zutaten: ${(meal.ingredients ?? []).join(', ') || 'unbekannt'}`,
  ].join('\n')

  const response = await fetch(OPENAI_API, {
    body: JSON.stringify({
      input: [{
        content: [
          { text: prompt, type: 'input_text' },
          { detail: 'low', image_url: imageUrl, type: 'input_image' },
        ],
        role: 'user',
      }],
      model,
      store: false,
      text: {
        format: {
          name: 'meal_nutrition_estimate',
          schema: {
            additionalProperties: false,
            properties: {
              assumptions: { items: { type: 'string' }, type: 'array' },
              calories: { type: 'integer' },
              confidence: { enum: ['low', 'medium', 'high'], type: 'string' },
              description: { type: 'string' },
              protein: { type: 'integer' },
            },
            required: ['calories', 'protein', 'confidence', 'description', 'assumptions'],
            type: 'object',
          },
          strict: true,
          type: 'json_schema',
        },
      },
    }),
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.error?.message ?? data?.message ?? `OpenAI request failed: ${response.status}`
    throw new Error(message)
  }

  const text = extractOutputText(data)
  if (!text) throw new Error('OpenAI hat keine auswertbare Antwort geliefert.')
  return JSON.parse(text)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    const { supabase, user } = await requireUser(event)
    const body = JSON.parse(event.body ?? '{}')
    const mealId = String(body.mealId ?? '')
    const photoDataUrl = String(body.photoDataUrl ?? '')

    if (!mealId) return json(400, { error: 'mealId fehlt.' })
    if (!photoDataUrl.startsWith('data:image/')) return json(400, { error: 'Bitte ein Bild hochladen.' })
    if (photoDataUrl.length > 6_000_000) return json(413, { error: 'Das Foto ist zu gross. Bitte kleiner hochladen.' })

    const admin = await adminClient()
    const { data: meal, error: mealError } = await admin
      .from('nutrition_meals')
      .select('*')
      .eq('id', mealId)
      .eq('user_id', user.id)
      .single()

    if (mealError || !meal) return json(404, { error: 'Mahlzeit nicht gefunden.' })

    const estimate = await analyzeWithOpenAI({ imageUrl: photoDataUrl, meal })
    const calories = clampNumber(estimate.calories, meal.calories ?? 0, 0, 4000)
    const protein = clampNumber(estimate.protein, meal.protein ?? 0, 0, 300)
    const assumptions = Array.isArray(estimate.assumptions) ? estimate.assumptions.slice(0, 4) : []
    const note = [
      `KI-Schaetzung (${estimate.confidence ?? 'medium'}): ${estimate.description ?? 'Foto analysiert.'}`,
      assumptions.length ? `Annahmen: ${assumptions.join('; ')}` : '',
    ].filter(Boolean).join(' ')

    const { data: updatedMeal, error: updateError } = await supabase
      .from('nutrition_meals')
      .update({
        eaten_at: meal.eaten_at ?? new Date().toISOString(),
        photo_analysis_note: note,
        photo_calorie_estimate: calories,
        photo_data_url: photoDataUrl,
        photo_protein_estimate: protein,
      })
      .eq('id', meal.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError
    return json(200, { estimate: { ...estimate, calories, protein }, meal: updatedMeal })
  } catch (error) {
    return json(500, { error: error.message ?? 'Fotoanalyse fehlgeschlagen.' })
  }
}
