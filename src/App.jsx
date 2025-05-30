import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import EYSH from './pages/EYSH'
import EYSHTest from './pages/EYSHTest'
import Result from './pages/Result'
import SATstatistic from './pages/SATstatistic'
import SATstrategy from './pages/SATstrategy'
import EYSHadvice from './pages/EYSHadvice'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/EYSH" element={<EYSH />} />
        <Route path="/EYSH/:year" element={<EYSHTest/>} />
        <Route path='/EYSH/:year/Result' element={<Result/>}/>
        <Route path='/SATstatistic' element={<SATstatistic/>}/>
        <Route path='/SATstrategy' element={<SATstrategy/>}/>
        <Route path='/EYSHadvice' element={<EYSHadvice/>}/>
      </Routes>
    </Router>
  )
}

export default App
