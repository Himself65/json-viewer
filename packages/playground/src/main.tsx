import '@rich-data/viewer/theme/basic.css'
import '@rich-data/json-plugin/theme/basic.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

const root = createRoot(document.getElementById('app') as HTMLElement)

root.render(
  <StrictMode>
    <App/>
  </StrictMode>
)