import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoText from '../assets/logoText.svg'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function ChevronIcon({ open }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d={open ? 'M5 12L10 7L15 12' : 'M5 8L10 13L15 8'} />
        </svg>
    )
}

function BookmarkIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E75234' : 'none'} stroke={active ? '#E75234' : '#9CA3AF'} strokeWidth="2">
            <path d="M5 2a2 2 0 0 0-2 2v17l9-4 9 4V4a2 2 0 0 0-2-2H5z"/>
        </svg>
    )
}

const navSections = [
    {
        id: 'eysh', name: 'ЭЕШ', color: '#96ADD6',
        links: [
            { name: 'Материал',  link: '/EYSH' },
            { name: 'Заавар',    link: '/EYSH/guidelines' },
            { name: 'Тест өгөх', link: '/EYSH' },
        ]
    },
    {
        id: 'sat', name: 'SAT', color: '#F8B8AF',
        links: [
            { name: 'Шалгалтын талаар', link: '/SAT' },
            { name: 'Заавар',           link: '/SAT/guidelines' },
            { name: 'Тест өгөх',        link: '/SAT' },
            { name: 'Материал',         link: '/SAT' },
        ]
    },
    {
        id: 'theory', name: 'Онолын Математик', color: '#01408D',
        links: [
            { name: 'Тодорхойлолтууд',      link: '/Theory' },
            { name: 'Томьёо',               link: '/Theory' },
            { name: 'Сэдвийн бүрэлдэхүүн', link: '/Theory' },
        ]
    },
    {
        id: 'misc', name: 'Бусад', color: '#E75234',
        links: [
            { name: 'Бидний тухай',   link: '/About' },
            { name: 'Сурталчилгаа',   link: '/ads' },
            { name: 'Хамтарч ажиллах',link: '/collab' },
            { name: 'Асуултууд',      link: '/FAQ' },
        ]
    }
]

function Header() {
    const [isOpen,       setIsOpen]       = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const dropdownRef = useRef(null)
    const userMenuRef = useRef(null)
    const navigate    = useNavigate()
    const { user }    = useAuth()

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setIsOpen(false)
            if (userMenuRef.current && !userMenuRef.current.contains(e.target))
                setUserMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUserMenuOpen(false)
        navigate('/')
    }

    const initials = user
        ? (user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()
        : null

    const close = () => { setIsOpen(false) }

    return (
        <div ref={dropdownRef}>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-10" onClick={close} />
            )}

            {/* Bar */}
            <div className="flex relative items-center justify-between w-full h-14 sm:h-16 px-4 sm:px-10 bg-white shadow-sm z-20">

                {/* Left */}
                <div className="flex items-center gap-3">
                    <Link to="/" onClick={close}>
                        <img src={logoText} alt="AlphaMath" className="h-8 sm:h-10" />
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ChevronIcon open={isOpen} />
                    </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 sm:gap-5">

                    {/* Bookmark */}
                    {user ? (
                        <Link to="/bookmarks" className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors">
                            <BookmarkIcon active={true} />
                        </Link>
                    ) : (
                        <button className="flex items-center justify-center w-9 h-9 rounded-xl opacity-30 cursor-not-allowed" title="Нэвтэрч орсны дараа ашиглана">
                            <BookmarkIcon active={false} />
                        </button>
                    )}

                    {/* Auth */}
                    {user ? (
                        <div ref={userMenuRef} className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-9 h-9 rounded-full bg-[#E75234] text-white font-bold text-sm flex items-center justify-center hover:bg-[#c94220] transition-colors"
                            >{initials}</button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 py-2 flex flex-col z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <Link to="/history"   onClick={() => setUserMenuOpen(false)} className="px-4 py-2 text-sm hover:bg-gray-50">Миний дүн</Link>
                                    <Link to="/bookmarks" onClick={() => setUserMenuOpen(false)} className="px-4 py-2 text-sm hover:bg-gray-50">Хадгалсан</Link>
                                    <button onClick={handleLogout} className="px-4 py-2 text-sm text-[#E75234] hover:bg-red-50 text-left">Гарах</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="px-4 py-2 rounded-full bg-[#E75234] text-white text-sm font-bold hover:bg-[#c94220] transition-colors whitespace-nowrap"
                        >Нэвтрэх</Link>
                    )}
                </div>
            </div>

            {/* Dropdown — 2-col on mobile, 4-col on desktop */}
            {isOpen && (
                <div className="absolute w-full bg-[#F5DAC6] top-14 sm:top-16 left-0 shadow-lg z-20 overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                        {navSections.map(sec => (
                            <div key={sec.id} className="p-4 border-t-4" style={{ borderColor: sec.color }}>
                                <h3 className="font-extrabold text-sm sm:text-base mb-2 text-gray-800">{sec.name}</h3>
                                <ul className="flex flex-col gap-1.5">
                                    {sec.links.map(l => (
                                        <li key={l.name}>
                                            <Link
                                                to={l.link}
                                                onClick={close}
                                                className="text-sm text-gray-700 hover:text-[#E75234] transition-colors leading-snug block"
                                            >{l.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header
