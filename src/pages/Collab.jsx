import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const roles = [
    { icon: '✏️', title: 'Контент бүтээгч', body: 'Математикийн тайлбар, бодлогын шийдэл, видео хичээл бэлтгэх.' },
    { icon: '👨‍🏫', title: 'Багш / Зөвлөх', body: 'Оюутнуудад онлайн зөвлөгөө өгөх, материал хянах.' },
    { icon: '💻', title: 'Хөгжүүлэгч', body: 'Платформыг хамтран хөгжүүлэх, шинэ боломжуудыг нэмэх.' },
    { icon: '🎨', title: 'Дизайнер', body: 'UI/UX, дүрслэл, брэндингийн ажилд хамтрах.' },
]

function Collab() {
    const [fields, setFields] = useState({ name: '', role: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const set = (k) => (e) => setFields(prev => ({ ...prev, [k]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Хамтын ажиллагаа — ${fields.name}`)
        const body    = encodeURIComponent(
            `Нэр: ${fields.name}\nЧиглэл: ${fields.role}\nИмэйл: ${fields.email}\n\n${fields.message}`
        )
        window.open(`mailto:alphamath.admin@gmail.com?subject=${subject}&body=${body}`)
        setSent(true)
    }

    return (
        <div>
            <Header />

            <div className='w-full bg-[#96ADD6]/40 py-20 px-10 flex flex-col items-center gap-4 text-center'>
                <span className='px-3 py-1 bg-[#2760A6] text-white text-xs font-bold rounded-full'>Хамтын ажиллагаа</span>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>
                    Хамтарч <span className='text-[#2760A6]'>ажиллах</span>
                </h1>
                <p className='text-lg text-gray-700 max-w-xl'>
                    AlphaMath-ийн багт нэгдэж Монголын оюутнуудад хүртээмжтэй боловсрол олгоход хувь нэмрээ оруулаарай.
                </p>
            </div>

            <div className='max-w-5xl mx-auto px-6 py-16'>
                <h2 className='text-xl font-extrabold mb-6'>Хамтарч ажиллах боломжтой чиглэлүүд</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16'>
                    {roles.map(r => (
                        <div key={r.title} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2'>
                            <span className='text-3xl'>{r.icon}</span>
                            <h3 className='font-extrabold text-sm'>{r.title}</h3>
                            <p className='text-xs text-gray-500 leading-relaxed'>{r.body}</p>
                        </div>
                    ))}
                </div>

                <div className='max-w-2xl mx-auto'>
                    <h2 className='text-2xl font-extrabold mb-1'>Санал илгээх</h2>
                    <p className='text-gray-500 text-sm mb-8'>Хамтран ажиллахыг хүсвэл доорх маягтыг бөглөж илгээгээрэй.</p>

                    {sent ? (
                        <div className='flex flex-col items-center gap-4 py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm'>
                            <div className='w-14 h-14 rounded-full bg-[#96ADD6]/40 flex items-center justify-center text-2xl'>✓</div>
                            <p className='font-extrabold text-lg'>Баярлалаа!</p>
                            <p className='text-gray-500 text-sm max-w-xs'>Имэйл клиент нээгдлээ. Хэрэв нээгдэхгүй бол Instagram DM-ээр холбогдоорой.</p>
                            <a href='https://www.instagram.com/_batuka_7/' target='_blank' rel='noopener noreferrer'
                                className='px-5 py-2.5 bg-[#2760A6] text-white rounded-full text-sm font-bold hover:bg-[#1d4a7c] transition-colors'>
                                Instagram нээх
                            </a>
                            <button onClick={() => { setSent(false); setFields({ name:'', role:'', email:'', message:'' }) }}
                                className='text-xs text-gray-400 underline'>Дахин илгээх</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <input required placeholder='Таны нэр' value={fields.name} onChange={set('name')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2760A6]' />
                                <select value={fields.role} onChange={set('role')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2760A6] text-gray-600'>
                                    <option value=''>Чиглэл сонгох...</option>
                                    <option>Контент бүтээгч</option>
                                    <option>Багш / Зөвлөх</option>
                                    <option>Хөгжүүлэгч</option>
                                    <option>Дизайнер</option>
                                    <option>Бусад</option>
                                </select>
                            </div>
                            <input required type='email' placeholder='Имэйл хаяг' value={fields.email} onChange={set('email')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2760A6]' />
                            <textarea required rows={5} placeholder='Хамтран ажиллахыг хүсч буй шалтгаан, санаагаа бичнэ үү...' value={fields.message} onChange={set('message')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2760A6] resize-none' />
                            <button type='submit'
                                className='w-full py-3 bg-[#2760A6] text-white rounded-xl font-bold hover:bg-[#1d4a7c] transition-colors'>
                                Илгээх
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Collab
