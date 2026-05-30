import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Home     from './pages/Home'
import EYSH     from './pages/EYSH'
import EYSHTest from './pages/EYSHTest'
import Result   from './pages/Result'
import SAT      from './pages/Sat'
import Theory   from './pages/Theory'
import About    from './pages/About'
import FAQ      from './pages/Faq'
import Auth      from './pages/Auth'
import History   from './pages/History'
import Bookmarks from './pages/Bookmarks'
import Ads       from './pages/Ads'
import Collab    from './pages/Collab'
import Contact   from './pages/Contact'
import Privacy   from './pages/Privacy'
import Editorial from './pages/Editorial'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/EYSH"              element={<EYSH />} />
          <Route path="/EYSH/:year"        element={<EYSHTest />} />
          <Route path="/EYSH/:year/Result" element={<Result />} />
          <Route path="/SAT"               element={<SAT />} />
          <Route path="/SAT/guidelines"    element={<SAT />} />
          <Route path="/Theory"            element={<Theory />} />
          <Route path="/About"             element={<About />} />
          <Route path="/FAQ"               element={<FAQ />} />
          <Route path="/auth"              element={<Auth />} />
          <Route path="/history"           element={<History />} />
          <Route path="/bookmarks"         element={<Bookmarks />} />
          <Route path="/ads"              element={<Ads />} />
          <Route path="/collab"           element={<Collab />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/privacy"          element={<Privacy />} />
          <Route path="/editorial"        element={<Editorial />} />
          <Route path="/EYSH/guidelines"   element={<EYSH />} />
          <Route path="*"                  element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
