import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const perks = [
    { icon: '🎯', title: 'Зорилтот үзэгчид', body: 'ЭЕШ, SAT-д бэлтгэж буй идэвхтэй оюутнууд — тань таны бүтээгдэхүүнийг хамгийн хэрэгтэй үедээ харна.' },
    { icon: '📈', title: 'Өсөн нэмэгдэж буй хэрэглэгч', body: 'Сар бүр нэмэгдэж буй хэрэглэгчийн тоотой платформ дээр танай брэнд байршина.' },
    { icon: '🇲🇳', title: 'Монголын зах зээл', body: 'Монгол хэлт боловсролын платформ дээрх цорын ганц математикт зориулсан орчин.' },
]

function Ads() {
    const [fields, setFields] = useState({ name: '', company: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const set = (k) => (e) => setFields(prev => ({ ...prev, [k]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Сурталчилгаа — ${fields.company || fields.name}`)
        const body    = encodeURIComponent(
            `Нэр: ${fields.name}\nБайгууллага: ${fields.company}\nИмэйл: ${fields.email}\n\n${fields.message}`
        )
        window.open(`mailto:alphamath.admin@gmail.com?subject=${subject}&body=${body}`)
        setSent(true)
    }

    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-20 px-10 flex flex-col items-center gap-4 text-center'>
                <span className='px-3 py-1 bg-[#E75234] text-white text-xs font-bold rounded-full'>Партнер болох</span>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>
                    Сурталчилгаа <span className='text-[#E75234]'>байршуулах</span>
                </h1>
                <p className='text-lg text-gray-700 max-w-xl'>
                    AlphaMath дээр сурталчилгаа байршуулж Монголын идэвхтэй оюутнуудад хүрээрэй.
                </p>
            </div>

            <div className='max-w-5xl mx-auto px-6 py-16'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16'>
                    {perks.map(p => (
                        <div key={p.title} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3'>
                            <span className='text-3xl'>{p.icon}</span>
                            <h3 className='font-extrabold text-base'>{p.title}</h3>
                            <p className='text-sm text-gray-500 leading-relaxed'>{p.body}</p>
                        </div>
                    ))}
                </div>

                <div className='max-w-2xl mx-auto'>
                    <h2 className='text-2xl font-extrabold mb-1'>Холбоо барих</h2>
                    <p className='text-gray-500 text-sm mb-8'>Доорх маягтыг бөглөж илгээгээрэй. 1–2 хоногт багтаан холбогдоно.</p>

                    {sent ? (
                        <div className='flex flex-col items-center gap-4 py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm'>
                            <div className='w-14 h-14 rounded-full bg-[#F5DAC6] flex items-center justify-center text-2xl'>✓</div>
                            <p className='font-extrabold text-lg'>Баярлалаа!</p>
                            <p className='text-gray-500 text-sm max-w-xs'>Имэйл клиент нээгдлээ. Хэрэв нээгдэхгүй бол Instagram DM-ээр холбогдоорой.</p>
                            <a href='https://www.instagram.com/_batuka_7/' target='_blank' rel='noopener noreferrer'
                                className='px-5 py-2.5 bg-[#E75234] text-white rounded-full text-sm font-bold hover:bg-[#c94220] transition-colors'>
                                Instagram нээх
                            </a>
                            <button onClick={() => { setSent(false); setFields({ name:'', company:'', email:'', message:'' }) }}
                                className='text-xs text-gray-400 underline'>Дахин илгээх</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <input required placeholder='Таны нэр' value={fields.name} onChange={set('name')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                                <input placeholder='Байгууллага (заавал биш)' value={fields.company} onChange={set('company')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                            </div>
                            <input required type='email' placeholder='Имэйл хаяг' value={fields.email} onChange={set('email')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                            <textarea required rows={5} placeholder='Сурталчилгааны талаар дэлгэрэнгүй...' value={fields.message} onChange={set('message')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234] resize-none' />
                            <button type='submit'
                                className='w-full py-3 bg-[#E75234] text-white rounded-xl font-bold hover:bg-[#c94220] transition-colors'>
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

export default Ads
