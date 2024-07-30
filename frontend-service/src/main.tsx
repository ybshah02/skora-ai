import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './global-styles.css'
import './webflow/normalize.css'
import './webflow/webflow.css'
// import './webflow/webflow.js'
import './webflow/skora.webflow.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
