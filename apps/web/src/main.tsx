import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { hydrateDocument } from './lib/document-store.ts'
import { hydrateHistory } from './lib/persist.ts'
import './index.css'

void Promise.all([hydrateDocument(), hydrateHistory()]).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
