import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

function getGrade(pct) {
    if (pct >= 90) return { label: 'Онцлог',    color: 'text-purple-600',  bg: 'bg-purple-50'  }
    if (pct >= 75) return { label: 'Сайн',       color: 'text-green-600',   bg: 'bg-green-50'   }
    if (pct >= 55) return { label: 'Дунд',       color: 'text-yellow-600',  bg: 'bg-yellow-50'  }
    if (pct >= 40) return { label: 'Хангалттай', color: 'text-orange-500',  bg: 'bg-orange-50'  }
    return              { label: 'Хангалтгүй',  color: 'text-red-500',     bg: 'bg-red-50'     }
}

function StatCard({ label, value, sub, color }) {
    return (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1'>
            <p className='text-xs text-gray-400 font-medium'>{label}</p>
            <p className={`text-3xl font-extrabold ${color || 'text-gray-800'}`}>{value}</p>
            {sub && <p className='text-xs text-gray-400'>{sub}</p>}
        </div>
    )
}

export default function History() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingName, setEditingName] = useState(false)
    const [newName, setNewName] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

    useEffect(() => {
        if (!authLoading && !user) navigate('/auth')
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (!user) return
        setNewName(user.user_metadata?.display_name || user.email?.split('@')[0] || '')
        supabase
            .from('test_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setResults(data || [])
                setLoading(false)
            })
    }, [user])

    const handleSaveName = async () => {
        setSavingName(true)
        await supabase.auth.updateUser({ data: { display_name: newName.trim() } })
        setSavingName(false)
        setEditingName(false)
    }

    const handleDeleteResult = async (id) => {
        await supabase.from('test_results').delete().eq('id', id)
        setResults(prev => prev.filter(r => r.id !== id))
    }

    if (authLoading || !user) return null

    const initials = (user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0]
    const joinDate = new Date(user.created_at).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })

    // Stats
    const totalTests = results.length
    const avgPct = totalTests > 0
        ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / totalTests)
        : 0
    const bestPct = totalTests > 0 ? Math.max(...results.map(r => r.percentage || 0)) : 0
    const bestGrade = getGrade(bestPct)

    const sorted = [...results].sort((a, b) => {
        const da = new Date(a.created_at), db = new Date(b.created_at)
        return sortDir === 'desc' ? db - da : da - db
    })

    return (
        <div className='min-h-screen bg-[#FAFAFA]'>
            <Header />

            <div className='max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8'>

                {/* ── Profile card ── */}
                <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6'>
                    <div className='w-20 h-20 rounded-full bg-[#E75234] text-white text-3xl font-extrabold flex items-center justify-center flex-shrink-0'>
                        {initials}
                    </div>
                    <div className='flex flex-col gap-1 flex-1 text-center sm:text-left'>
                        {editingName ? (
                            <div className='flex flex-row gap-2 items-center'>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className='border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#E75234]'
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                                />
                                <button onClick={handleSaveName} disabled={savingName}
                                    className='px-3 py-1.5 bg-[#E75234] text-white text-xs rounded-xl font-bold disabled:opacity-50'>
                                    {savingName ? '...' : 'Хадгалах'}
                                </button>
                                <button onClick={() => setEditingName(false)}
                                    className='px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-xl'>
                                    Болих
                                </button>
                            </div>
                        ) : (
                            <div className='flex flex-row gap-2 items-center justify-center sm:justify-start'>
                                <h2 className='text-xl font-extrabold'>{displayName}</h2>
                                <button onClick={() => setEditingName(true)}
                                    className='text-xs text-gray-400 hover:text-[#E75234] transition-colors px-2 py-0.5 rounded-lg hover:bg-gray-50'>
                                    Засах
                                </button>
                            </div>
                        )}
                        <p className='text-sm text-gray-400'>{user.email}</p>
                        <p className='text-xs text-gray-300 mt-1'>{joinDate}-аас нэгдсэн</p>
                    </div>
                </div>

                {/* ── Stats row ── */}
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    <StatCard label='Нийт тест' value={totalTests} sub='удаа өгсөн' />
                    <StatCard label='Дундаж оноо' value={`${avgPct}%`} color={getGrade(avgPct).color} />
                    <StatCard label='Хамгийн өндөр' value={`${bestPct}%`} color={bestGrade.color} sub={bestGrade.label} />
                    <StatCard
                        label='Зэрэглэл'
                        value={totalTests === 0 ? '—' : getGrade(avgPct).label}
                        color={getGrade(avgPct).color}
                    />
                </div>

                {/* ── History table ── */}
                <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6'>
                    <div className='flex flex-row items-center justify-between mb-4'>
                        <h2 className='text-xl font-extrabold'>Тестийн түүх</h2>
                        <button
                            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                            className='text-xs text-gray-400 hover:text-[#E75234] px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1'
                        >
                            {sortDir === 'desc' ? '↓ Шинэ эхэнд' : '↑ Хуучин эхэнд'}
                        </button>
                    </div>

                    {loading ? (
                        <div className='flex justify-center py-12'>
                            <div className='w-8 h-8 border-4 border-[#E75234] border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className='flex flex-col items-center gap-4 py-16 text-center'>
                            <div className='w-16 h-16 rounded-full bg-[#F5DAC6] flex items-center justify-center text-2xl'>📋</div>
                            <p className='text-gray-500 font-medium'>Тест өгөөгүй байна</p>
                            <Link to='/EYSH'
                                className='px-6 py-2.5 bg-[#E75234] text-white rounded-full text-sm font-bold hover:bg-[#c94220] transition-colors'>
                                Тест өгөх
                            </Link>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b border-gray-100 text-left text-xs text-gray-400 font-semibold'>
                                        <th className='pb-3 pr-4'>Шалгалт</th>
                                        <th className='pb-3 pr-4'>Оноо</th>
                                        <th className='pb-3 pr-4'>Хувь</th>
                                        <th className='pb-3 pr-4'>Зэрэглэл</th>
                                        <th className='pb-3 pr-4'>Огноо</th>
                                        <th className='pb-3'></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(r => {
                                        const grade = getGrade(r.percentage || 0)
                                        const date = new Date(r.created_at).toLocaleDateString('mn-MN', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })
                                        return (
                                            <tr key={r.id} className='border-b border-gray-50 hover:bg-gray-50 transition-colors'>
                                                <td className='py-3 pr-4 font-bold'>
                                                    ЭЕШ {r.year} {r.variant}
                                                </td>
                                                <td className='py-3 pr-4 text-gray-600'>
                                                    {r.score} <span className='text-gray-300'>/ {r.total_possible}</span>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-20 bg-gray-100 rounded-full h-1.5 hidden sm:block'>
                                                            <div
                                                                className='bg-[#E75234] h-1.5 rounded-full'
                                                                style={{ width: `${r.percentage || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-bold ${grade.color}`}>{r.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${grade.color} ${grade.bg}`}>
                                                        {grade.label}
                                                    </span>
                                                </td>
                                                <td className='py-3 pr-4 text-gray-400 text-xs'>{date}</td>
                                                <td className='py-3'>
                                                    <button
                                                        onClick={() => handleDeleteResult(r.id)}
                                                        className='text-gray-300 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-red-50'
                                                        title='Устгах'
                                                    >✕</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    )
}
