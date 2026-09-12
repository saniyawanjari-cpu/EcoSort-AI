import { useState } from 'react'

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#e7f5ec" />
      <path
        d="M20 8c6 4 9 9 9 14a9 9 0 1 1-18 0c0-5 3-10 9-14z"
        fill="#1c7a4c"
      />
      <path d="M20 12v16" stroke="#f6fbf8" strokeWidth="1.8" />
      <path
        d="M14 22c4-1 6-1 12 0"
        stroke="#f6fbf8"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  )
}

export default function Header({ onNavigate }) {
  const [open, setOpen] = useState(false)

  const go = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={() => go('home')}>
          <LogoMark />
          <span>
            <strong>EcoSort AI</strong>
            <small>Identify. Decide. Dispose.</small>
          </span>
        </button>

        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Primary">
          <button type="button" onClick={() => go('home')}>
            Home
          </button>
          <button type="button" onClick={() => go('analyzer')}>
            Analyzer
          </button>
          <button type="button" onClick={() => go('how-it-works')}>
            How It Works
          </button>
          <button type="button" onClick={() => go('responsible-ai')}>
            Responsible AI
          </button>
          <button
            type="button"
            className="btn btn-primary nav-cta"
            onClick={() => go('analyzer')}
          >
            Try Analyzer
          </button>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
