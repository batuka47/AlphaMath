import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { TaskProvider } from './lib/TaskContext'
import UsernameModal from './components/UsernameModal'
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
import AdminLayout    from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminResults   from './pages/admin/AdminResults'
import AdminBookmarks from './pages/admin/AdminBookmarks'
import AdminImport    from './pages/admin/AdminImport'
import AdminExams     from './pages/admin/AdminExams'

function App() {
  return (
    <AuthProvider>
    <TaskProvider>
      <UsernameModal />
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

          {/* Admin — access controlled in AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                  element={<AdminDashboard />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route path="results"         element={<AdminResults />} />
            <Route path="bookmarks"       element={<AdminBookmarks />} />
            <Route path="import"          element={<AdminImport />} />
            <Route path="exams"           element={<AdminExams />} />
          </Route>

          <Route path="*"                  element={<Home />} />
        </Routes>
      </Router>
    </TaskProvider>
    </AuthProvider>
  )
}

export default App
