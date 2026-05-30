import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const tiers = [
    {
        name: 'Бронз',
        color: '#CD7F32',
        bg: '#FDF3E7',
        perks: ['Нүүр хуудасны лого', 'FAQ хуудасны дурдалт', 'Сар бүрийн тайлан'],
    },
    {
        name: 'Мөнгө',
        color: '#9E9E9E',
        bg: '#F5F5F5',
        perks: ['Бронзийн бүх давуу тал', 'Бүх хуудасны footer лого', 'Instagram пост дурдалт (сарын 1)'],
    },
    {
        name: 'Алт',
        color: '#E75234',
        bg: '#FFF3F0',
        perks: ['Мөнгөний бүх давуу тал', 'Тестийн хуудасны баннер', 'Instagram story (долоо хоног бүр)', 'Тусгай контент хамтын ажиллагаа'],
        featured: true,
    },
]

function Sponsor() {
    const [fields, setFields] = useState({ name: '', company: '', email: '', tier: '', message: '' })
    const [sent, setSent] = useState(false)

    const set = (k) => (e) => setFields(p => ({ ...p, [k]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Спонсорлох — ${fields.tier || ''} — ${fields.company || fields.name}`)
        const body    = encodeURIComponent(
            `Нэр: ${fields.name}\nБайгууллага: ${fields.company}\nИмэйл: ${fields.email}\nТүвшин: ${fields.tier}\n\n${fields.message}`
        )
        window.open(`mailto:alphamath.admin@gmail.com?subject=${subject}&body=${body}`)
        setSent(true)
    }

    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-20 px-10 text-center flex flex-col items-center gap-4'>
                <span className='px-3 py-1 bg-[#E75234] text-white text-xs font-bold rounded-full'>Спонсор болох</span>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>
                    AlphaMath-ийг <span className='text-[#E75234]'>дэмжих</span>
                </h1>
                <p className='text-gray-700 text-lg max-w-xl'>
                    Монголын оюутнуудад чанартай математикийн боловсрол хүргэхэд хувь нэмрээ оруулаарай.
                    Спонсорууд брэндээ зорилтот үзэгчдэд хүргэж, боловсролын эрхэм зорилгыг дэмждэг.
                </p>
            </div>

            {/* Tiers */}
            <div className='max-w-5xl mx-auto px-6 py-16'>
                <h2 className='text-2xl font-extrabold mb-8 text-center'>Спонсорын түвшин</h2>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16'>
                    {tiers.map(t => (
                        <div key={t.name}
                            className={`rounded-3xl p-6 flex flex-col gap-4 border-2 ${t.featured ? 'border-[#E75234] shadow-lg' : 'border-gray-100 shadow-sm bg-white'}`}
                            style={t.featured ? { background: t.bg } : {}}>
                            {t.featured && (
                                <span className='self-start text-xs font-bold px-2.5 py-1 rounded-full bg-[#E75234] text-white'>Хамгийн алдартай</span>
                            )}
                            <div>
                                <h3 className='font-extrabold text-xl' style={{ color: t.color }}>{t.name}</h3>
                            </div>
                            <ul className='flex flex-col gap-2'>
                                {t.perks.map(p => (
                                    <li key={p} className='flex items-start gap-2 text-sm text-gray-600'>
                                        <span className='text-green-500 mt-0.5 flex-shrink-0'>✓</span>
                                        {p}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setFields(prev => ({ ...prev, tier: t.name }))}
                                className='mt-auto py-2.5 rounded-xl text-sm font-bold transition-colors border-2'
                                style={fields.tier === t.name
                                    ? { backgroundColor: t.color, color: '#fff', borderColor: t.color }
                                    : { backgroundColor: 'transparent', color: t.color, borderColor: t.color }}>
                                {fields.tier === t.name ? '✓ Сонгогдсон' : 'Сонгох'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className='max-w-2xl mx-auto'>
                    <h2 className='text-2xl font-extrabold mb-1'>Холбоо барих</h2>
                    <p className='text-gray-500 text-sm mb-8'>Доорх маягтыг бөглөж илгээгээрэй. Нарийвчилсан нөхцлийг имэйлээр хэлэлцэнэ.</p>

                    {sent ? (
                        <div className='flex flex-col items-center gap-4 py-14 text-center bg-white rounded-3xl border border-gray-100 shadow-sm'>
                            <div className='w-14 h-14 rounded-full bg-[#F5DAC6] flex items-center justify-center text-2xl'>✓</div>
                            <p className='font-extrabold text-lg'>Баярлалаа!</p>
                            <p className='text-gray-500 text-sm max-w-xs'>Имэйл клиент нээгдлээ. Ажлын 1–2 хоногт хариу хүлээгээрэй.</p>
                            <a href='https://www.instagram.com/_batuka_7/' target='_blank' rel='noopener noreferrer'
                                className='px-5 py-2.5 bg-[#E75234] text-white rounded-full text-sm font-bold hover:bg-[#c94220] transition-colors'>
                                Instagram нээх
                            </a>
                            <button onClick={() => { setSent(false); setFields({ name:'', company:'', email:'', tier:'', message:'' }) }}
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
                            <select value={fields.tier} onChange={set('tier')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234] text-gray-600'>
                                <option value=''>Спонсорын түвшин сонгох...</option>
                                <option>Бронз</option>
                                <option>Мөнгө</option>
                                <option>Алт</option>
                                <option>Тусгай нөхцөл хэлэлцэх</option>
                            </select>
                            <textarea required rows={4} placeholder='Нэмэлт мэдээлэл, асуулт...' value={fields.message} onChange={set('message')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234] resize-none' />
                            <button type='submit'
                                className='py-3 bg-[#E75234] text-white rounded-xl font-bold hover:bg-[#c94220] transition-colors'>
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

export default Sponsor
