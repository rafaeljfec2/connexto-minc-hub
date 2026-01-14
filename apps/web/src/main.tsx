import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { createTrustedTypesPolicies } from './lib/trusted-types'

// Initialize Trusted Types policies before rendering React
// This must happen before any DOM manipulation
if (typeof window !== 'undefined') {
  createTrustedTypesPolicies()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
