import { useEffect, useRef, useState } from 'react'
import { analyzeWaste, EXAMPLES } from '../lib/analyzeWaste'

const CATEGORY_CLASS = {
  'Organic / Wet Waste': 'cat-organic',
  'Recyclable / Dry Waste': 'cat-recycle',
  'General / Non-Recyclable Waste': 'cat-general',
  'E-Waste': 'cat-ewaste',
  'Hazardous Waste': 'cat-hazard',
}

export default function Analyzer() {
  const fileRef = useRef(null)
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [activeExample, setActiveExample] = useState(null)

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const clearImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl('')
    setImageFile(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const onFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setFileName(file.name)
    setError('')
  }

  const run = async ({ text = description, exampleId = activeExample } = {}) => {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const next = await analyzeWaste({
        description: text,
        exampleId,
        imageFile,
      })
      setResult(next)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onExample = (example) => {
    setActiveExample(example.id)
    setDescription(example.label)
    run({ text: example.label, exampleId: example.id })
  }

  return (
    <section id="analyzer" className="section analyzer-section">
      <div className="container">
        <p className="eyebrow">Main tool</p>
        <h2>Waste Analyzer</h2>
        <p className="lede">
          Upload a photo, describe the item, or try a sample. Live analysis runs
          through a secure server proxy. If Gemini is unavailable, EcoSort uses
          a local demonstration result.
        </p>

        <div className="analyzer-shell">
          <div className="analyzer-panel">
            <div className="upload-block">
              {!imageUrl ? (
                <label className="upload-drop">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                  />
                  <span className="upload-icon" aria-hidden="true">
                    +
                  </span>
                  <strong>Upload an image</strong>
                  <span>JPG, PNG or WEBP — sent to the EcoSort server only for this analysis, not stored</span>
                </label>
              ) : (
                <div className="preview-wrap">
                  <img src={imageUrl} alt="Uploaded waste item preview" />
                  <div className="preview-meta">
                    <span>{fileName}</span>
                    <button type="button" className="text-btn" onClick={clearImage}>
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label className="field-label" htmlFor="waste-desc">
              Text description
            </label>
            <textarea
              id="waste-desc"
              rows={4}
              placeholder="e.g. crushed plastic water bottle with the cap still on"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setActiveExample(null)
              }}
            />

            <div className="example-row">
              <span>Try an example</span>
              <div className="chip-row">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    className={`chip${activeExample === example.id ? ' is-active' : ''}`}
                    onClick={() => onExample(example)}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => run()}
              disabled={loading}
            >
              {loading ? 'Analyzing…' : 'Analyze Waste'}
            </button>
            {error ? <p className="form-error">{error}</p> : null}
          </div>

          <div className="result-panel" aria-live="polite">
            {loading ? (
              <div className="result-state">
                <div className="spinner" />
                <p>Reviewing material, typical use, and a suggested disposal path…</p>
                <small>Contacting EcoSort’s analysis service</small>
              </div>
            ) : result ? (
              <article className="result-card">
                <div className="result-head">
                  <h3>Suggested result</h3>
                  <span className={`category-pill ${CATEGORY_CLASS[result.category] || ''}`}>
                    {result.category}
                  </span>
                </div>
                <dl className="result-grid">
                  <div>
                    <dt>Detected item</dt>
                    <dd>{result.item}</dd>
                  </div>
                  <div>
                    <dt>Recommended action</dt>
                    <dd>{result.action}</dd>
                  </div>
                  <div>
                    <dt>Disposal guidance</dt>
                    <dd>{result.guidance}</dd>
                  </div>
                  <div>
                    <dt>Why it matters</dt>
                    <dd>{result.whyItMatters}</dd>
                  </div>
                  <div>
                    <dt>Confidence level</dt>
                    <dd>
                      <div className="confidence">
                        <div
                          className="confidence-bar"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <span>
                        {result.confidenceLabel
                          ? `${result.confidenceLabel} (${result.confidence}%)`
                          : `${result.confidence}%`}
                        {result.source === 'gemini'
                          ? ' — Gemini estimate; always check local rules when unsure'
                          : ' — local demo fallback, not a live model score'}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="how-reached">
                  <h4>How EcoSort reached this result</h4>
                  <p>{result.howReached}</p>
                  {result.sourceNote ? <p className="source-note">{result.sourceNote}</p> : null}
                </div>
                <p className="disclaimer">{result.disclaimer}</p>
              </article>
            ) : (
              <div className="result-state muted">
                <p>Your classification will appear here after you analyze an item.</p>
                <small>
                  Use an example for a realistic demonstration, or describe something
                  from your home.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
