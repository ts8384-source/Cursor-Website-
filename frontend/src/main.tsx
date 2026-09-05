import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { App } from './canvas/App'
import { SiteApp, SiteRedirect } from './site/SiteApp'
import './styles.css'
import './site/site.css'

function RouteShell() {
  const { pathname } = useLocation()
  const isCanvas = pathname === '/'

  useEffect(() => {
    document.documentElement.classList.toggle('is-site', !isCanvas)
  }, [isCanvas])

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/site" element={<SiteRedirect />} />
      <Route path="/site/:slug" element={<SiteApp />} />
      <Route path="/demo" element={<Navigate to="/site/overview" replace />} />
      <Route path="/demo/*" element={<Navigate to="/site/overview" replace />} />
      <Route path="/projects" element={<Navigate to="/site/overview" replace />} />
      <Route path="/projects/*" element={<Navigate to="/site/overview" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteShell />
    </BrowserRouter>
  </StrictMode>,
)
