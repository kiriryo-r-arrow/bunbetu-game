import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Game from './pages/Game'
import Learn from './pages/Learn'
import Start from './pages/Start'
import { DifficultyProvider } from './contexts/Difficulty'

import { SoundProvider } from './contexts/SoundContext'

function App() {
  return (
    <DifficultyProvider>
      <SoundProvider>
        <BrowserRouter>
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Start />} />
              <Route path="/game" element={<Game />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </SoundProvider>
    </DifficultyProvider>
  )
}

export default App
