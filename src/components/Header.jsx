import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoText from '../assets/logoText.svg'
import pointUp   from '../assets/icon/pointUp.svg'
import pointDown from '../assets/icon/pointDown.svg'
import bookmark  from '../assets/icon/bookmark.svg'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function Header() {
    const [isOpen,      setIsOpen]      = useState(false)
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

    // Display name: first letter of email or display_name
    const initials = user
        ? (user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()
        : null

    const navBarData = [
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
                { name: 'Тодорхойлолтууд',     link: '/Theory' },
                { name: 'Томьёо',              link: '/Theory' },
                { name: 'Сэдвийн бүрэлдэхүүн', link: '/Theory' },
            ]
        },
        {
            id: 'misc', name: '', color: '#FFFFFF',
            links: [
                { name: 'Бидний тухай',            link: '/About' },
                { name: 'Сурталчилгаа байршуулах', link: '/ads' },
                { name: 'Хамтарч ажиллах',         link: '/collab' },
                { name: 'Түгээмэл асуултууд',      link: '/FAQ' },
            ]
        }
    ]

    return (
        <div ref={dropdownRef}>
            {isOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={() => setIsOpen(false)} />
            )}

            <div className='flex relative items-center justify-between w-full h-16 px-10 flex-row bg-white shadow-md z-20'>

                {/* Left: logo + nav toggle */}
                <div className='flex items-center justify-center flex-row gap-4 z-20'>
                    <Link to="/">
                        <img src={logoText} alt="logo" className='h-10' />
                    </Link>
                    <div className='relative cursor-pointer'>
                        <div onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                            {isOpen
                                ? <img src={pointUp}   alt="up"   className="w-6 h-6 pt-0.5" />
                                : <img src={pointDown} alt="down" className="w-6 h-6 pt-0.5" />
                            }
                        </div>
                    </div>
                </div>

                {/* Right: auth + bookmark */}
                <div className='flex items-center flex-row gap-6 z-20'>

                    {/* Bookmark — enabled only when logged in */}
                    {user
                        ? <Link to="/bookmarks"><img src={bookmark} alt="bookmark" className='w-8 h-8' /></Link>
                        : <img src={bookmark} alt="bookmark" className='w-8 h-8 opacity-30 cursor-not-allowed' title="Нэвтэрч орсны дараа ашиглана" />
                    }

                    {/* Profile */}
                    {user ? (
                        <div ref={userMenuRef} className='relative'>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className='w-9 h-9 rounded-full bg-[#E75234] text-white font-bold text-sm flex items-center justify-center hover:bg-[#c94220] transition-colors'
                            >{initials}</button>

                            {userMenuOpen && (
                                <div className='absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 py-2 flex flex-col'>
                                    <div className='px-4 py-2 border-b border-gray-100 mb-1'>
                                        <p className='text-xs text-gray-400 truncate'>{user.email}</p>
                                    </div>
                                    <Link
                                        to="/history"
                                        onClick={() => setUserMenuOpen(false)}
                                        className='px-4 py-2 text-sm hover:bg-gray-50 text-left'
                                    >Миний дүн</Link>
                                    <Link
                                        to="/bookmarks"
                                        onClick={() => setUserMenuOpen(false)}
                                        className='px-4 py-2 text-sm hover:bg-gray-50 text-left'
                                    >Хадгалсан</Link>
                                    <button
                                        onClick={handleLogout}
                                        className='px-4 py-2 text-sm text-[#E75234] hover:bg-red-50 text-left'
                                    >Гарах</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className='px-4 py-2 rounded-full bg-[#E75234] text-white text-sm font-bold hover:bg-[#c94220] transition-colors'
                        >Нэвтрэх</Link>
                    )}
                </div>
            </div>

            {/* Nav dropdown */}
            {isOpen && (
                <div className='absolute w-full bg-[#F5DAC6] top-16 left-0 shadow-lg rounded-b-lg p-4 justify-center flex flex-row gap-4 z-20'>
                    {navBarData.map((item) => (
                        <div key={item.id} className='p-2 w-1/5 border-t-4' style={{ borderColor: item.color }}>
                            <h3 className='font-extrabold text-lg my-2'>{item.name}</h3>
                            <ul className='ml-4'>
                                {item.links.map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.link} onClick={() => setIsOpen(false)}>{link.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Header
