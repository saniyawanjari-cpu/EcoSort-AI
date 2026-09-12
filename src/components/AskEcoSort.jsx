import { useState } from 'react'
import { CHAT_EXAMPLES, getChatResponse } from '../lib/getChatResponse'

export default function AskEcoSort() {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask about a household item and I will share disposal guidance. Live replies go through EcoSort’s secure server. If Gemini is unavailable, you will see a local demonstration answer.',
    },
  ])

  const send = async (preset) => {
    const text = (preset ?? input).trim()
    if (!text || pending) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setPending(true)
    const reply = await getChatResponse(text)
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    setPending(false)
  }

  return (
    <section id="ask" className="section ask-section">
      <div className="container">
        <p className="eyebrow">Conversational demo</p>
        <h2>Ask EcoSort</h2>
        <p className="lede">
          A chat-style helper for everyday disposal questions. Answers are
          general guidance and may not match your city’s exact rules.
        </p>

        <div className="chat-shell">
          <div className="chat-log">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`bubble ${msg.role}`}>
                <span>{msg.role === 'assistant' ? 'EcoSort' : 'You'}</span>
                <p>{msg.text}</p>
              </div>
            ))}
            {pending ? (
              <div className="bubble assistant">
                <span>EcoSort</span>
                <p className="typing">Contacting EcoSort…</p>
              </div>
            ) : null}
          </div>

          <div className="chip-row chat-examples">
            {CHAT_EXAMPLES.map((q) => (
              <button key={q} type="button" className="chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a waste question…"
              aria-label="Waste question"
            />
            <button className="btn btn-primary" type="submit" disabled={pending}>
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
