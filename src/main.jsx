import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// E3 "Soft Brutalist" theme — imported last so it restyles the existing
// class names (index.css / App.css / Pipeline.css) by cascade.
import './efficiency-e3.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
