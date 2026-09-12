import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI, Type } from '@google/genai'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(rootDir, '.env') })

const PORT = Number(process.env.PORT) || 3001
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const ALLOWED_CATEGORIES = [
  'Organic / Wet Waste',
  'Recyclable / Dry Waste',
  'General / Non-Recyclable Waste',
  'E-Waste',
  'Hazardous Waste',
]
const ALLOWED_CONFIDENCE = ['High', 'Medium', 'Low']
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const ANALYZE_INSTRUCTION = `You are EcoSort AI, an AI-assisted sustainability and waste-segregation assistant.

Analyze the user's waste item.

Do not invent local waste-management laws.
Waste-management rules vary by location.
Give general guidance and explicitly state when local municipal guidance should be checked.

If the item is ambiguous, use Medium or Low confidence and explain what additional information would help.

Do not provide chain-of-thought.
Return only the requested structured information.`

const CHAT_INSTRUCTION = `You are EcoSort AI, a sustainability-focused waste-segregation assistant for households.

Answer the user's question with practical, general disposal guidance.
Do not invent local waste-management laws. Rules vary by city and country.
When certainty depends on local rules, say so and recommend checking municipal guidance.
Keep answers concise (about 80–160 words). Do not provide chain-of-thought.`

const analyzeSchema = {
  type: Type.OBJECT,
  properties: {
    detectedItem: { type: Type.STRING },
    category: { type: Type.STRING, enum: ALLOWED_CATEGORIES },
    recommendation: { type: Type.STRING },
    preparation: { type: Type.STRING },
    whyItMatters: { type: Type.STRING },
    confidence: { type: Type.STRING, enum: ALLOWED_CONFIDENCE },
  },
  required: [
    'detectedItem',
    'category',
    'recommendation',
    'preparation',
    'whyItMatters',
    'confidence',
  ],
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Please upload a JPG, PNG, WEBP, or GIF image.'))
  },
})

const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
)
app.use(express.json({ limit: '2mb' }))

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.')
    err.status = 503
    throw err
  }
  return new GoogleGenAI({ apiKey })
}

function parseJsonText(text) {
  if (!text) throw new Error('Empty model response.')
  const cleaned = String(text)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

function normalizeAnalyzeResult(raw) {
  const category = ALLOWED_CATEGORIES.find((item) => item === raw.category)
    ? raw.category
    : 'General / Non-Recyclable Waste'
  const confidence = ALLOWED_CONFIDENCE.includes(raw.confidence)
    ? raw.confidence
    : 'Medium'

  return {
    detectedItem: String(raw.detectedItem || 'Household item').trim(),
    category,
    recommendation: String(raw.recommendation || '').trim(),
    preparation: String(raw.preparation || '').trim(),
    whyItMatters: String(raw.whyItMatters || '').trim(),
    confidence,
  }
}

function optionalImage(req, res, next) {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    next()
    return
  }
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Could not read the uploaded image.' })
      return
    }
    next()
  })
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  })
})

app.post('/api/analyze', optionalImage, async (req, res) => {
  try {
    const item = String(req.body?.item || req.body?.description || '').trim()
    const file = req.file

    if (!item && !file) {
      res.status(400).json({
        error: 'Please provide an item description or an image.',
      })
      return
    }

    const ai = getClient()
    const parts = []

    if (file) {
      parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64'),
        },
      })
    }

    parts.push({
      text: item
        ? `Waste item to analyze: ${item}`
        : 'Identify the waste item in the image and classify how it should generally be disposed of.',
    })

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: ANALYZE_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: analyzeSchema,
        temperature: 0.2,
      },
    })

    const parsed = normalizeAnalyzeResult(parseJsonText(response.text))
    res.json(parsed)
  } catch (error) {
    const status = error.status || 500
    console.error('Analyze error:', error)
    res.status(status).json({
      error:
        status === 503
          ? error.message
          : 'The waste analysis service is temporarily unavailable. Please try again.',
    })
  }
})

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim()
    if (!message) {
      res.status(400).json({ error: 'Please provide a message.' })
      return
    }

    const ai = getClient()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: message,
      config: {
        systemInstruction: CHAT_INSTRUCTION,
        temperature: 0.3,
      },
    })

    const text = String(response.text || '').trim()
    if (!text) {
      throw new Error('Empty chat response.')
    }

    res.json({ response: text })
  } catch (error) {
    const status = error.status || 500
    console.error('Chat error:', error.message)
    res.status(status).json({
      error:
        status === 503
          ? error.message
          : 'The chat service is temporarily unavailable. Please try again.',
    })
  }
})

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON body.' })
    return
  }
  next(err)
})

app.listen(PORT, () => {
  console.log(`EcoSort API proxy listening on http://localhost:${PORT}`)
})
