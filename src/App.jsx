import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import EYSH from './pages/EYSH'
import EYSHTest from './pages/EYSHTest'
import Result from './pages/Result'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/EYSH" element={<EYSH />} />
        <Route path="/EYSH/:year" element={<EYSHTest/>} />
        <Route path='/EYSH/:year/Result' element={<Result/>}/>
      </Routes>
    </Router>
  )
}

export default App
