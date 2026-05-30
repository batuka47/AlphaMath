import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Bookmarks() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [bookmarks, setBookmarks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) navigate('/auth')
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (!user) return
        supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setBookmarks(data || [])
                setLoading(false)
            })
    }, [user])

    const handleRemove = async (id) => {
        await supabase.from('bookmarks').delete().eq('id', id)
        setBookmarks(prev => prev.filter(b => b.id !== id))
    }

    if (authLoading || !user) return null

    return (
        <div className='min-h-screen bg-[#FAFAFA]'>
            <Header />

            <div className='max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6'>

                <div className='flex flex-row items-center justify-between'>
                    <h1 className='text-2xl font-extrabold'>Хадгалсан асуулгууд</h1>
                    <span className='text-sm text-gray-400'>{bookmarks.length} асуулга</span>
                </div>

                <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6'>
                    {loading ? (
                        <div className='flex justify-center py-12'>
                            <div className='w-8 h-8 border-4 border-[#E75234] border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <div className='flex flex-col items-center gap-4 py-16 text-center'>
                            <div className='w-16 h-16 rounded-full bg-[#F5DAC6] flex items-center justify-center text-2xl'>🔖</div>
                            <p className='text-gray-500 font-medium'>Хадгалсан асуулга байхгүй байна</p>
                            <p className='text-sm text-gray-400'>Тест өгөх үед асуулгуудыг хадгалж болно</p>
                            <Link to='/EYSH'
                                className='px-6 py-2.5 bg-[#E75234] text-white rounded-full text-sm font-bold hover:bg-[#c94220] transition-colors'>
                                Тест өгөх
                            </Link>
                        </div>
                    ) : (
                        <div className='flex flex-col divide-y divide-gray-50'>
                            {bookmarks.map(b => (
                                <div key={b.id} className='py-4 flex flex-row items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <span className='text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5DAC6] text-[#E75234]'>
                                                ЭЕШ {b.year} {b.variant}
                                            </span>
                                            <span className='text-xs text-gray-400'>Асуулт №{b.question_id}</span>
                                        </div>
                                        {b.question_text && (
                                            <p className='text-sm text-gray-700 mt-1 line-clamp-3 max-w-2xl'>
                                                {b.question_text}
                                            </p>
                                        )}
                                        <p className='text-xs text-gray-300 mt-1'>
                                            {new Date(b.created_at).toLocaleDateString('mn-MN', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(b.id)}
                                        className='text-gray-300 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-xl hover:bg-red-50 flex-shrink-0'
                                        title='Устгах'
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    )
}
