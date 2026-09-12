import Header from './components/Header'
import Analyzer from './components/Analyzer'
import AskEcoSort from './components/AskEcoSort'
import Footer from './components/Footer'
import './App.css'

function scrollToId(id) {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const PROBLEM_CARDS = [
  {
    title: 'Confusion',
    text: 'Everyday items sit between categories. A bottle is familiar; a greasy container, a vape, or a mixed-material pouch is not. People often guess — and guessing is how the wrong bin gets used.',
  },
  {
    title: 'Waste contamination',
    text: 'Food residue, batteries, and broken electronics in dry recycling can spoil a whole batch or put collection workers at risk. Clean streams only work when items are sorted with care.',
  },
  {
    title: 'Lack of accessible guidance',
    text: 'Municipal rules exist, but they are rarely at hand in the kitchen. EcoSort AI is a companion that offers a first, responsible suggestion — then reminds you to confirm local guidance when unsure.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Upload or Describe',
    text: 'Add a photo and/or a short description of the item you need to sort.',
  },
  {
    n: '02',
    title: 'AI Analysis',
    text: 'The EcoSort server sends your description and optional photo to Gemini. If the API is unavailable, a local demonstration result is shown instead.',
  },
  {
    n: '03',
    title: 'Classification',
    text: 'The item is mapped to a waste stream: organic, recyclable, general, e-waste, or hazardous.',
  },
  {
    n: '04',
    title: 'Action',
    text: 'You receive a recommended action, disposal guidance, and a short note on why the choice matters.',
  },
]

const AI_PILLARS = [
  {
    title: 'Multimodal AI',
    text: 'Gemini can read a photo and a written description together — useful when the object is damaged, dirty, or only partly visible.',
  },
  {
    title: 'Classification',
    text: 'The core task is assigning a responsible waste stream, not generating open-ended text. Clear categories support SDG 12: better sorting at the source.',
  },
  {
    title: 'Conversational AI',
    text: 'Ask EcoSort shows how a chat layer can answer follow-up questions (“what about the cap?”) after a classification.',
  },
  {
    title: 'RAG / verified knowledge base',
    text: 'Retrieval-augmented generation can ground answers in municipal PDFs, collection calendars, and authorised drop-off lists instead of generic web text.',
  },
]

const RESPONSIBLE = [
  {
    title: 'Fairness',
    text: 'Guidance should work for common household items across income levels and housing types — not only for branded packaging that is easy to recognise.',
  },
  {
    title: 'Transparency',
    text: 'The Gemini API key stays on the server. When a result comes from Gemini, EcoSort says so; if the API is down, it labels the local demonstration fallback.',
  },
  {
    title: 'Privacy',
    text: 'Images are held in memory on the server for that request only and are not saved to disk. Do not upload sensitive photos. A production app should state retention clearly and avoid training on private images by default.',
  },
  {
    title: 'Uncertainty handling',
    text: 'Low-confidence cases (image only, unclear material) recommend caution: do not contaminate recycling, and check local rules. Overconfident answers would be more harmful.',
  },
  {
    title: 'Local guideline awareness',
    text: 'Bins and accepted materials differ by city. EcoSort treats every suggestion as informational and points people back to municipal guidance when rules conflict.',
  },
]

const IMPACT = [
  {
    title: 'Individual',
    text: 'A calmer decision at the bin: identify the item, choose a stream, and dispose with a short explanation of why that stream exists.',
  },
  {
    title: 'Community',
    text: 'Shared language for wet, dry, e-waste, and hazardous items can reduce contamination in building and neighbourhood collection.',
  },
  {
    title: 'Environment',
    text: 'Better source segregation supports recycling, composting, and safer handling of hazardous and electronic waste — in line with responsible consumption and production (SDG 12).',
  },
]

const FUTURE = [
  'Real multimodal AI integration for image + text understanding',
  'Verified RAG knowledge base of waste-management guidance',
  'Local municipal guidelines by city or ward',
  'Collection-point locator for e-waste and hazardous drop-off',
  'Regional language support',
  'Waste analytics for households or campus pilots (opt-in, privacy-aware)',
]

export default function App() {
  return (
    <div className="app">
      <Header onNavigate={scrollToId} />

      <section id="home" className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div>
            <p className="badge">AI for Sustainability • SDG 12</p>
            <h1>Identify. Decide. Dispose.</h1>
            <p className="hero-sub">
              An AI-assisted waste segregation companion that helps you understand
              how everyday waste can be sorted and disposed of responsibly.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => scrollToId('analyzer')}
              >
                Analyze My Waste
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => scrollToId('how-it-works')}
              >
                How It Works
              </button>
            </div>
          </div>
          <aside className="hero-card">
            <p className="hero-card-kicker">Five streams</p>
            <ul>
              <li>Organic / Wet Waste</li>
              <li>Recyclable / Dry Waste</li>
              <li>General / Non-Recyclable Waste</li>
              <li>E-Waste</li>
              <li>Hazardous Waste</li>
            </ul>
            <p className="hero-card-note">
              Built as a student prototype for the 1M1B AI for Sustainability
              Virtual Internship. Primary SDG: 12 — Responsible Consumption and
              Production.
            </p>
          </aside>
        </div>
      </section>

      <section id="problem" className="section">
        <div className="container">
          <p className="eyebrow">The gap</p>
          <h2>Sorting is simple — until it is not</h2>
          <p className="lede">
            People often struggle to determine whether everyday items are
            recyclable, organic, general, hazardous or e-waste. The result is
            mixed bins, contaminated recycling, and preventable risk from
            batteries and electronics.
          </p>
          <div className="card-grid three">
            {PROBLEM_CARDS.map((card) => (
              <article key={card.title} className="info-card">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Analyzer />
      <AskEcoSort />

      <section id="how-it-works" className="section alt">
        <div className="container">
          <p className="eyebrow">Process</p>
          <h2>How It Works</h2>
          <div className="steps">
            {STEPS.map((step) => (
              <article key={step.n} className="step-card">
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-sustainability" className="section">
        <div className="container">
          <p className="eyebrow">Design</p>
          <h2>AI + Sustainability</h2>
          <p className="lede">
            EcoSort AI uses Gemini through a secure server proxy to support SDG
            12. Answers are still general guidance, not a replacement for
            municipal rules.
          </p>
          <div className="card-grid two">
            {AI_PILLARS.map((item) => (
              <article key={item.title} className="info-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="responsible-ai" className="section alt">
        <div className="container">
          <p className="eyebrow">Principles</p>
          <h2>Responsible AI</h2>
          <div className="card-grid">
            {RESPONSIBLE.map((item) => (
              <article key={item.title} className="info-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="section">
        <div className="container">
          <p className="eyebrow">Change we aim for</p>
          <h2>Impact</h2>
          <p className="lede">
            This prototype does not claim measured tonnes diverted or city-wide
            percentages. The intended effect is qualitative: clearer decisions
            at the point of disposal.
          </p>
          <div className="card-grid three">
            {IMPACT.map((item) => (
              <article key={item.title} className="info-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="future" className="section alt">
        <div className="container">
          <p className="eyebrow">Next</p>
          <h2>Future Scope</h2>
          <ul className="future-list">
            {FUTURE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  )
}
