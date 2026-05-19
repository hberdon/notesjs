import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const root = document.getElementById('root')
if (!root) {
  throw new Error(
    '[main] Root element #root not found. Check that index.html contains <div id="root">.',
  )
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
