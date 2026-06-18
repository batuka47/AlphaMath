import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Bookmark,
  FileUp,
  BookMarked,
  ArrowLeft,
  LogOut,
  Sigma,
  FlaskConical,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/adminConfig'
import { Separator } from '@/components/ui/separator'
import logo from '@/assets/logo.svg'

const NAV = [
  { to: '/admin',           label: 'Overview',     icon: LayoutDashboard, end: true },
  { to: '/admin/import',    label: 'Add Exam',     icon: FileUp },
  { to: '/admin/exams',     label: 'Manage Exams', icon: BookMarked },
  { to: '/admin/users',     label: 'Users',        icon: Users },
  { to: '/admin/results',   label: 'Test Results', icon: ClipboardList },
  { to: '/admin/bookmarks', label: 'Bookmarks',    icon: Bookmark },
  { to: '/admin/latex',      label: 'LaTeX Editor', icon: Sigma },
  { to: '/admin/mock-tests', label: 'Жишиг тест',  icon: FlaskConical },
]

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) { navigate('/auth'); return }
    if (!ADMIN_EMAILS.includes(user.email)) navigate('/')
  }, [user, loading, navigate])

  if (loading || !user || !ADMIN_EMAILS.includes(user.email)) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r border-border">

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <img src={logo} alt="AlphaMath" className="h-7 w-7" />
          <div className="leading-tight">
            <p className="text-xs font-extrabold text-gray-900">AlphaMath</p>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-muted-foreground hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="px-3 py-4 flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-gray-50 hover:text-gray-900 transition-colors w-full text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          <p className="px-3 pt-2 text-[10px] text-muted-foreground truncate">{user.email}</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
