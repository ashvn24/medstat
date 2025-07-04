import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import MedistatLanding from './App.jsx'
import Payment from './payment.jsx'
import Stats from './stats.jsx'
import ManageReview from './manage-review.jsx'
import ManageTasks from './manage-tasks.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MedistatLanding />} />
        <Route path="/plan" element={<Payment />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/manage-review" element={<ManageReview />} />
        <Route path="/manage-tasks" element={<ManageTasks />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
