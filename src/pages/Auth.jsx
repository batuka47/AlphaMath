import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.svg'

function Auth() {
    const navigate = useNavigate()
    const [tab,     setTab]     = useState('login')   // 'login' | 'signup'
    const [email,   setEmail]   = useState('')
    const [pass,    setPass]    = useState('')
    const [confirm, setConfirm] = useState('')
    const [name,    setName]    = useState('')
    const [error,   setError]   = useState('')
    const [info,    setInfo]    = useState('')
    const [loading, setLoading] = useState(false)

    const reset = () => { setError(''); setInfo('') }

    const handleLogin = async (e) => {
        e.preventDefault(); reset(); setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        setLoading(false)
        if (error) { setError(error.message); return }
        navigate('/')
    }

    const handleSignup = async (e) => {
        e.preventDefault(); reset()
        if (pass !== confirm) { setError('Нууц үг таарахгүй байна.'); return }
        if (pass.length < 6)  { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.'); return }
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email, password: pass,
            options: { data: { display_name: name || email.split('@')[0] } }
        })
        setLoading(false)
        if (error) { setError(error.message); return }
        setInfo('Имэйл хаягт баталгаажуулах холбоос илгээлээ. Шалгаарай.')
    }

    const handleGoogle = async () => {
        reset()
        await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    }

    return (
        <div>
            <Header />
            <div className='min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F5DAC6]/30'>
                <div className='bg-white rounded-3xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6'>

                    {/* Logo */}
                    <div className='flex flex-col items-center gap-2'>
                        <img src={logo} alt="logo" className='h-12' />
                        <h1 className='text-2xl font-extrabold'>AlphaMath</h1>
                    </div>

                    {/* Tabs */}
                    <div className='flex rounded-xl bg-[#F5DAC6]/50 p-1'>
                        {[['login','Нэвтрэх'],['signup','Бүртгүүлэх']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setTab(key); reset() }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                    tab === key ? 'bg-white shadow text-[#E75234]' : 'text-gray-500'
                                }`}
                            >{label}</button>
                        ))}
                    </div>

                    {/* Error / info */}
                    {error && <p className='text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2'>{error}</p>}
                    {info  && <p className='text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2'>{info}</p>}

                    {/* Login form */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
                            <input
                                type='email' required placeholder='Имэйл'
                                value={email} onChange={e => setEmail(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <input
                                type='password' required placeholder='Нууц үг'
                                value={pass} onChange={e => setPass(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <button
                                type='submit' disabled={loading}
                                className='bg-[#E75234] text-white rounded-xl py-3 font-bold hover:bg-[#c94220] disabled:opacity-50 transition-colors'
                            >{loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}</button>
                        </form>
                    )}

                    {/* Signup form */}
                    {tab === 'signup' && (
                        <form onSubmit={handleSignup} className='flex flex-col gap-4'>
                            <input
                                type='text' placeholder='Нэр (заавал биш)'
                                value={name} onChange={e => setName(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <input
                                type='email' required placeholder='Имэйл'
                                value={email} onChange={e => setEmail(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <input
                                type='password' required placeholder='Нууц үг (6+ тэмдэгт)'
                                value={pass} onChange={e => setPass(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <input
                                type='password' required placeholder='Нууц үг давтах'
                                value={confirm} onChange={e => setConfirm(e.target.value)}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]'
                            />
                            <button
                                type='submit' disabled={loading}
                                className='bg-[#E75234] text-white rounded-xl py-3 font-bold hover:bg-[#c94220] disabled:opacity-50 transition-colors'
                            >{loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}</button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className='flex items-center gap-3'>
                        <div className='flex-1 h-px bg-gray-200' />
                        <span className='text-xs text-gray-400'>эсвэл</span>
                        <div className='flex-1 h-px bg-gray-200' />
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        className='flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors'
                    >
                        <svg width='18' height='18' viewBox='0 0 48 48'>
                            <path fill='#EA4335' d='M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.36 2.96 29.47 1 24 1 14.61 1 6.6 6.53 2.87 14.48l7.12 5.53C11.73 13.3 17.38 9.5 24 9.5z'/>
                            <path fill='#4285F4' d='M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.2 5.48-4.68 7.17l7.16 5.56C43.36 37.53 46.5 31.47 46.5 24.5z'/>
                            <path fill='#FBBC05' d='M9.99 28.01A14.55 14.55 0 0 1 9.5 24c0-1.39.19-2.74.49-4.01L2.87 14.48A23.94 23.94 0 0 0 1 24c0 3.87.92 7.53 2.87 10.8l7.12-5.53v-.26z'/>
                            <path fill='#34A853' d='M24 47c5.47 0 10.06-1.81 13.42-4.92l-7.16-5.56C28.38 38.1 26.29 38.5 24 38.5c-6.62 0-12.27-3.8-15.01-9.49l-7.12 5.53C5.6 42.07 14.22 47 24 47z'/>
                        </svg>
                        Google-ээр нэвтрэх
                    </button>

                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Auth
