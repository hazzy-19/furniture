import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import DesignTokens from './pages/DesignTokens.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tokens" element={<DesignTokens />} />
          <Route path="/shop/*" element={<ComingSoon />} />
          <Route path="/product/*" element={<ComingSoon />} />
          <Route path="/new" element={<ComingSoon />} />
          <Route path="/sale" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
