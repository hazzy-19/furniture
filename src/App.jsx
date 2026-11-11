import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DesignTokens from './pages/DesignTokens.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesignTokens />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
