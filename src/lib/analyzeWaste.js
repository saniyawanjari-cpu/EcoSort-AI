/**
 * analyzeWaste()
 *
 * Calls the EcoSort Express proxy (POST /api/analyze), which talks to Gemini
 * on the server. The Gemini API key never ships in this frontend bundle.
 *
 * Prototype fallback: if the backend/API is unavailable, EcoSort uses the
 * existing structured local demonstration results so the UI keeps working.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const CATEGORIES = {
  ORGANIC: 'Organic / Wet Waste',
  RECYCLABLE: 'Recyclable / Dry Waste',
  GENERAL: 'General / Non-Recyclable Waste',
  EWASTE: 'E-Waste',
  HAZARDOUS: 'Hazardous Waste',
}

export const EXAMPLES = [
  { id: 'plastic-bottle', label: 'Plastic Bottle' },
  { id: 'banana-peel', label: 'Banana Peel' },
  { id: 'used-battery', label: 'Used Battery' },
  { id: 'cardboard-box', label: 'Cardboard Box' },
  { id: 'broken-phone', label: 'Broken Phone' },
  { id: 'food-container', label: 'Food Container' },
]

const REACHED_RESULT =
  "The prototype considers the item's material, typical use and disposal category to provide a suggested waste stream."

const DISCLAIMER =
  'Recommendations are informational and may vary by local waste-management rules. When uncertain, check your local municipal guidance.'

const EXAMPLE_RESULTS = {
  'plastic-bottle': {
    item: 'Plastic bottle',
    category: CATEGORIES.RECYCLABLE,
    action: 'Empty, rinse, and place in dry / recyclable waste.',
    guidance:
      'Remove the cap if your local program asks you to separate it. Crush the bottle to save space. Do not leave liquids inside — leftover drinks can contaminate a recycling batch.',
    whyItMatters:
      'Clean plastic bottles are among the most widely recovered packaging materials. Keeping them out of mixed or wet waste helps them re-enter the material cycle instead of landfill.',
    confidence: 92,
    sourceNote: 'Curated demonstration result for a common PET / HDPE bottle.',
  },
  'banana-peel': {
    item: 'Banana peel',
    category: CATEGORIES.ORGANIC,
    action: 'Place in organic / wet waste or a home compost bin.',
    guidance:
      'Food peels belong with wet waste, not with paper or plastic recycling. If you compost at home, banana peels can go in the compost; otherwise use the municipal wet-waste stream.',
    whyItMatters:
      'Organic waste that is kept separate can be composted instead of producing methane in mixed landfill. Putting peels in dry recycling contaminates paper and packaging.',
    confidence: 96,
    sourceNote: 'Curated demonstration result for uncooked fruit waste.',
  },
  'used-battery': {
    item: 'Used battery',
    category: CATEGORIES.HAZARDOUS,
    action: 'Do not put in household bins. Take to a battery take-back or hazardous-waste point.',
    guidance:
      'Store used batteries in a dry container and drop them at a retailer, e-waste drive, or municipal hazardous-waste collection. Tape lithium-ion terminals if the battery is loose. Never burn or crush batteries.',
    whyItMatters:
      'Batteries can leak metals and start fires in waste trucks and sorting plants. Separate collection keeps hazardous materials out of soil and water.',
    confidence: 95,
    sourceNote: 'Curated demonstration result for household / portable batteries.',
  },
  'cardboard-box': {
    item: 'Cardboard box',
    category: CATEGORIES.RECYCLABLE,
    action: 'Flatten and place in dry / recyclable waste if clean and dry.',
    guidance:
      'Remove plastic tape and packing foam where practical. If the box is greasy or soaked (for example, from food), it may need general waste or wet waste instead — soiled fibre is hard to recycle.',
    whyItMatters:
      'Clean cardboard is a high-value recycled fibre. Keeping it dry and uncontaminated makes it far more likely to be reprocessed into new packaging.',
    confidence: 90,
    sourceNote: 'Curated demonstration result for dry corrugated cardboard.',
  },
  'broken-phone': {
    item: 'Broken phone',
    category: CATEGORIES.EWASTE,
    action: 'Take to an authorised e-waste collection or manufacturer take-back point.',
    guidance:
      'Do not place phones in regular household bins. Wipe personal data if the device still powers on. Remove the SIM card. Many cities and electronics stores accept small electronics for certified recycling.',
    whyItMatters:
      'Phones contain recoverable metals and components that should not enter mixed waste. Formal e-waste channels reduce informal dumping and unsafe dismantling.',
    confidence: 94,
    sourceNote: 'Curated demonstration result for a small electronic device.',
  },
  'food-container': {
    item: 'Food container',
    category: CATEGORIES.RECYCLABLE,
    action: 'Empty leftovers first. Rinse and recycle if the material is accepted locally; otherwise use general waste.',
    guidance:
      'Scrap remaining food into wet / organic waste. A clean plastic, metal, or glass container is often recyclable. Heavily soiled foam or mixed-material containers usually belong in general waste. When the material is unclear, check local rules.',
    whyItMatters:
      'Food residue is a major source of recycling contamination. Separating leftovers from packaging protects both the organic stream and the dry recyclables stream.',
    confidence: 78,
    sourceNote: 'Curated demonstration result; material type and soiling change the final bin.',
  },
}

const RULES = [
  {
    keys: ['battery', 'batteries', 'button cell'],
    item: 'Battery',
    category: CATEGORIES.HAZARDOUS,
    action: 'Take to a battery or hazardous-waste drop-off. Do not bin it.',
    guidance:
      'Keep used batteries dry and separate from household trash. Many pharmacies, electronics stores, and municipal centres accept them.',
    whyItMatters:
      'Batteries can leak and cause fires in collection trucks. Dedicated take-back is the responsible path.',
    confidence: 91,
  },
  {
    keys: ['phone', 'smartphone', 'laptop', 'charger', 'cable', 'earphone', 'headphone', 'tablet', 'keyboard', 'mouse', 'earbuds'],
    item: 'Electronic item',
    category: CATEGORIES.EWASTE,
    action: 'Use an authorised e-waste collection or take-back programme.',
    guidance:
      'Small electronics and cables should not go in dry recycling or general waste. Look for an e-waste kiosk, brand take-back, or city collection drive.',
    whyItMatters:
      'E-waste contains both valuable and hazardous materials that need controlled processing.',
    confidence: 88,
  },
  {
    keys: ['paint', 'pesticide', 'chemical', 'bleach', 'solvent', 'thermometer', 'fluorescent', 'medicine', 'syringe'],
    item: 'Hazardous household product',
    category: CATEGORIES.HAZARDOUS,
    action: 'Do not pour or bin. Use a hazardous / biomedical drop-off as applicable.',
    guidance:
      'Keep the original label if possible. Ask your municipality about household hazardous-waste days. Medicines and sharps often have pharmacy take-back rules.',
    whyItMatters:
      'These materials can harm sanitation workers and contaminate water and soil if mixed with ordinary waste.',
    confidence: 87,
  },
  {
    keys: ['peel', 'banana', 'apple core', 'food scrap', 'leftover', 'vegetable', 'fruit', 'tea bag', 'coffee ground', 'eggshell', 'garden waste'],
    item: 'Organic food or garden waste',
    category: CATEGORIES.ORGANIC,
    action: 'Place in organic / wet waste or compost.',
    guidance:
      'Keep peels and leftovers out of dry recycling. If composting, avoid oily leftovers unless your system allows them.',
    whyItMatters:
      'Separated organics can become compost. Mixed with dry waste, they spoil recyclable paper and packaging.',
    confidence: 89,
  },
  {
    keys: ['bottle', 'can', 'cardboard', 'newspaper', 'paper', 'glass jar', 'aluminum', 'aluminium', 'tin', 'magazine'],
    item: 'Dry recyclable packaging',
    category: CATEGORIES.RECYCLABLE,
    action: 'Empty, keep dry, and place in recyclable / dry waste.',
    guidance:
      'Rinse containers. Flatten boxes. Greasy or wet paper/cardboard may not be recyclable and should be checked against local guidance.',
    whyItMatters:
      'Clean, dry packaging is much more likely to be recovered than contaminated mixed waste.',
    confidence: 84,
  },
  {
    keys: ['styrofoam', 'thermocol', 'chip packet', 'wrapper', 'diaper', 'ceramic', 'mirror', 'soiled', 'tissue', 'carbon paper'],
    item: 'General household waste',
    category: CATEGORIES.GENERAL,
    action: 'Place in general / non-recyclable waste unless a local scheme says otherwise.',
    guidance:
      'These items commonly disrupt recycling machinery or fibre recovery. Reduce use where you can, and keep them out of the dry-recyclables bin.',
    whyItMatters:
      'Putting non-recyclables into recycling increases contamination and can send entire loads to landfill.',
    confidence: 80,
  },
]

const IMAGE_ONLY_RESULT = {
  item: 'Uploaded item (description not provided)',
  category: CATEGORIES.GENERAL,
  action: 'Add a short description for a more specific stream. Until then, treat this as mixed household waste.',
  guidance:
    'This prototype does not run a live vision model. A photo preview helps you review the item, but classification is more reliable when you also name the material (for example, “glass jar” or “used battery”).',
  whyItMatters:
    'Guessing a bin from a photo alone can mis-sort hazardous or electronic items. A brief description reduces that risk in this demo — and would also help a future multimodal model.',
  confidence: 41,
  sourceNote: 'Low-confidence demo path because only an image was provided.',
}

const FALLBACK_RESULT = {
  item: 'Household item',
  category: CATEGORIES.GENERAL,
  action: 'If the material is unclear, keep it out of recycling and check local municipal guidance.',
  guidance:
    'Describe the material (plastic, food, battery, electronics, paper) for a more specific suggestion. When still unsure, general waste is safer than contaminating recycling.',
  whyItMatters:
    'Uncertain items are a common source of recycling contamination. Caution protects workers and material streams.',
  confidence: 52,
  sourceNote: 'Generic demonstration fallback when no stronger keyword match was found.',
}

function withMeta(result) {
  return {
    ...result,
    howReached: REACHED_RESULT,
    disclaimer: DISCLAIMER,
  }
}

const CONFIDENCE_PERCENT = {
  High: 90,
  Medium: 65,
  Low: 40,
}

function mapGeminiResult(payload) {
  const confidenceLabel = CONFIDENCE_PERCENT[payload.confidence]
    ? payload.confidence
    : 'Medium'
  return withMeta({
    item: payload.detectedItem,
    category: payload.category,
    action: payload.recommendation,
    guidance: payload.preparation,
    whyItMatters: payload.whyItMatters,
    confidence: CONFIDENCE_PERCENT[confidenceLabel],
    confidenceLabel,
    source: 'gemini',
    sourceNote:
      'Generated by Gemini through the EcoSort server proxy. Guidance is general and is not a substitute for local municipal rules.',
  })
}

/**
 * Prototype fallback: local demonstration classification used only when
 * the Gemini proxy is unavailable.
 */
export async function demoAnalyzeWaste({
  description = '',
  exampleId = null,
  hasImage = false,
} = {}) {
  await delay(400)

  const text = String(description).trim()

  if (!text && !hasImage && !exampleId) {
    throw new Error('Please upload an image or enter a short description.')
  }

  if (exampleId && EXAMPLE_RESULTS[exampleId]) {
    return withMeta({
      ...EXAMPLE_RESULTS[exampleId],
      source: 'fallback',
      sourceNote:
        'Prototype fallback: local demonstration result because the live AI service was unavailable.',
    })
  }

  if (!text && hasImage) {
    return withMeta({
      ...IMAGE_ONLY_RESULT,
      source: 'fallback',
      sourceNote:
        'Prototype fallback: local demonstration result because the live AI service was unavailable.',
    })
  }

  const lower = text.toLowerCase()
  const matched = RULES.find((rule) =>
    rule.keys.some((key) => lower.includes(key)),
  )

  if (matched) {
    return withMeta({
      item: matched.item,
      category: matched.category,
      action: matched.action,
      guidance: matched.guidance,
      whyItMatters: matched.whyItMatters,
      confidence: matched.confidence,
      source: 'fallback',
      sourceNote:
        'Prototype fallback: local demonstration result because the live AI service was unavailable.',
    })
  }

  return withMeta({
    ...FALLBACK_RESULT,
    item: text.slice(0, 48) || FALLBACK_RESULT.item,
    source: 'fallback',
    sourceNote:
      'Prototype fallback: local demonstration result because the live AI service was unavailable.',
  })
}

export async function analyzeWaste({
  description = '',
  exampleId = null,
  imageFile = null,
} = {}) {
  const text = String(description).trim()
  const hasImage = Boolean(imageFile)

  if (!text && !hasImage && !exampleId) {
    throw new Error('Please upload an image or enter a short description.')
  }

  try {
    const body = new FormData()
    const itemLabel =
      (exampleId && EXAMPLES.find((item) => item.id === exampleId)?.label) || text
    if (itemLabel) body.append('item', itemLabel)
    if (imageFile) body.append('image', imageFile)

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body,
    })

    if (!response.ok) {
      throw new Error('analyze_api_unavailable')
    }

    const payload = await response.json()
    if (!payload?.detectedItem || !payload?.category) {
      throw new Error('analyze_api_unavailable')
    }

    return mapGeminiResult(payload)
  } catch {
    // Prototype fallback if the backend/API is unavailable.
    return demoAnalyzeWaste({
      description: text,
      exampleId,
      hasImage,
    })
  }
}
