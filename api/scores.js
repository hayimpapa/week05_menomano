import { createClient } from '@supabase/supabase-js'

const TABLE = 'menomano_scores'
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard']

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleGet(req, res) {
  const difficulty = (req.query && req.query.difficulty) || 'normal'
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' })
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('name, score, created_at')
    .eq('difficulty', difficulty)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) {
    console.error('[GET /api/scores] supabase error:', error)
    return res.status(500).json({ error: 'Failed to fetch scores', detail: error.message })
  }
  return res.status(200).json(data)
}

async function handlePost(req, res) {
  const { name, score, difficulty } = req.body || {}

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'Valid score is required' })
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' })
  }

  const cleanName = name.trim().substring(0, 5).toUpperCase().replace(/\s/g, '')
  const clampedScore = Math.min(Math.round(score), 99999)

  const { error } = await supabase
    .from(TABLE)
    .insert({ name: cleanName, score: clampedScore, difficulty })

  if (error) {
    console.error('[POST /api/scores] supabase insert error:', error)
    return res.status(500).json({ error: 'Failed to save score', detail: error.message })
  }
  return res.status(201).json({ success: true })
}
