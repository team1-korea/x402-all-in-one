import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ChecklistPage from './ChecklistPage.tsx'
import AdminPage from './AdminPage.tsx'

const path = window.location.pathname
const Page = path === '/admin' ? AdminPage : path === '/checklist' ? ChecklistPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
