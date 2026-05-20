import { createClient } from '@supabase/supabase-js'

const TABLE = 'menomano_scores'
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard']
const NAME_RE = /^[A-Z0-9]{1,5}$/

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Per-IP rate limiter. Lives in module scope so it persists across requests
// within a warm serverless instance; cold starts reset it. Best-effort —
// behind a horizontally scaled deployment, an attacker could spread across
// instances. Adequate for casual abuse; for hard guarantees use a shared
// store (Upstash/Redis) or move the limit into Supabase with an ip column.
const ipHits = new Map()

function rateLimit(ip) {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const hits = (ipHits.get(ip) || []).filter(t => t > cutoff)
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits)
    return false
  }
  hits.push(now)
  ipHits.set(ip, hits)
  if (ipHits.size > 1000) {
    for (const [k, v] of ipHits) {
      const fresh = v.filter(t => t > cutoff)
      if (fresh.length === 0) ipHits.delete(k)
      else ipHits.set(k, fresh)
    }
  }
  return true
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim()
  return (req.socket && req.socket.remoteAddress) || 'unknown'
}

function originAllowed(req) {
  const raw = process.env.ALLOWED_ORIGINS
  if (!raw) return true
  const allow = raw.split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin
  if (!origin) return false
  return allow.includes(origin)
}

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
    return res.status(500).json({ error: 'Failed to fetch scores' })
  }
  return res.status(200).json(data)
}

async function handlePost(req, res) {
  if (!originAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (!rateLimit(clientIp(req))) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { name, score, difficulty } = req.body || {}

  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'Valid score is required' })
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' })
  }

  const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)
  if (!NAME_RE.test(cleanName)) {
    return res.status(400).json({ error: 'Invalid name' })
  }
  const clampedScore = Math.min(Math.round(score), 99999)

  const { error } = await supabase
    .from(TABLE)
    .insert({ name: cleanName, score: clampedScore, difficulty })

  if (error) {
    return res.status(500).json({ error: 'Failed to save score' })
  }
  return res.status(201).json({ success: true })
}
