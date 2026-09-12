/**
 * getChatResponse()
 *
 * Calls the EcoSort Express proxy (POST /api/chat), which talks to Gemini
 * on the server. The Gemini API key never ships in this frontend bundle.
 *
 * Prototype fallback: if the backend/API is unavailable, EcoSort uses the
 * existing structured local demonstration answers.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const CHAT_EXAMPLES = [
  'Where should I dispose of a used battery?',
  'Can I recycle a pizza box?',
  'What should I do with an old phone charger?',
]

const LIBRARY = [
  {
    keys: ['battery', 'batteries'],
    answer:
      'Used batteries are hazardous waste — not household trash or general recycling. Keep them dry, tape lithium terminals if they are loose, and drop them at a retailer take-back, e-waste drive, or municipal hazardous-waste point. Never burn or crush them.',
  },
  {
    keys: ['pizza box', 'pizza'],
    answer:
      'It depends how greasy the box is. Clean, dry cardboard can usually go in recyclable / dry waste. If the box is soaked with oil or food, that fibre often cannot be recycled — tear off the clean lid if it is dry, and put the soiled base in general or wet waste according to local rules. Scrape leftovers into organic waste first.',
  },
  {
    keys: ['charger', 'cable', 'adapter', 'phone charger'],
    answer:
      'An old phone charger is e-waste. Do not place it in dry recycling or general waste. Take it to an authorised e-waste collection, electronics retailer take-back, or a city e-waste camp. If it still works, consider donating it so it can be reused.',
  },
  {
    keys: ['bottle', 'plastic bottle'],
    answer:
      'Empty and rinse the bottle, then place it in recyclable / dry waste if your local programme accepts that plastic. Caps are sometimes collected separately. Do not leave liquid inside.',
  },
  {
    keys: ['peel', 'banana', 'food scrap', 'leftover', 'compost'],
    answer:
      'Fruit peels and most leftover food belong in organic / wet waste, or in a home compost system if you have one. They should not go into paper or plastic recycling because moisture and food residue contaminate those streams.',
  },
  {
    keys: ['phone', 'mobile', 'laptop', 'tablet', 'earphone'],
    answer:
      'Broken or unused phones and similar devices are e-waste. Use a certified collection or brand take-back programme. Wipe personal data if the device still turns on, and remove the SIM card.',
  },
  {
    keys: ['cardboard', 'carton', 'box'],
    answer:
      'Flatten clean, dry cardboard and place it in recyclable / dry waste. Remove excess plastic tape and packing foam. If the cardboard is wet or greasy, it may need general waste instead.',
  },
  {
    keys: ['medicine', 'tablet', 'syrup', 'expired'],
    answer:
      'Do not flush medicines or mix them with kitchen waste. Many pharmacies and hospitals run take-back programmes. Follow local biomedical or municipal guidance for unused medicines.',
  },
  {
    keys: ['wrapper', 'chip', 'packet', 'styrofoam', 'thermocol'],
    answer:
      'Metallised snack wrappers and foam food trays are usually general / non-recyclable waste unless your city has a specific flexible-plastic programme. They commonly contaminate paper and bottle recycling if mixed in.',
  },
]

const FALLBACK =
  'I can help with common household items in this demo — batteries, food waste, packaging, e-waste, and soiled cardboard. Describe the item and material (for example, “glass jar with oil” or “used AA battery”). Recommendations here are informational and may differ from your municipal rules.'

/**
 * Prototype fallback: local demonstration answers used only when
 * the Gemini proxy is unavailable.
 */
export async function demoChatResponse(message) {
  await delay(350)
  const text = String(message || '').trim().toLowerCase()
  if (!text) {
    return 'Please type a waste question, or tap one of the examples.'
  }
  const hit = LIBRARY.find((entry) =>
    entry.keys.some((key) => text.includes(key)),
  )
  const answer = hit ? hit.answer : FALLBACK
  return `${answer}\n\n(Local demo fallback — the live assistant was unavailable.)`
}

export async function getChatResponse(message) {
  const text = String(message || '').trim()
  if (!text) {
    return 'Please type a waste question, or tap one of the examples.'
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })

    if (!response.ok) {
      throw new Error('chat_api_unavailable')
    }

    const payload = await response.json()
    if (!payload?.response) {
      throw new Error('chat_api_unavailable')
    }

    return payload.response
  } catch {
    // Prototype fallback if the backend/API is unavailable.
    return demoChatResponse(text)
  }
}
