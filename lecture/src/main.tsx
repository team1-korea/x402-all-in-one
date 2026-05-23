import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ChecklistPage from './ChecklistPage.tsx'

const Page = window.location.pathname === '/checklist' ? ChecklistPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
