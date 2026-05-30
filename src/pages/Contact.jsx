import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const channels = [
    { label: 'Bat-Erdene', handle: '@_batuka_7', link: 'https://www.instagram.com/_batuka_7/' },
    { label: 'Batenkh',    handle: '@plutolzy',  link: 'https://www.instagram.com/plutolzy/'  },
    { label: 'Bayarbayasgalan', handle: '@xuji877', link: 'https://www.instagram.com/xuji877/' },
]

function Contact() {
    const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' })
    const [sent, setSent] = useState(false)

    const set = (k) => (e) => setFields(p => ({ ...p, [k]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const sub  = encodeURIComponent(fields.subject || `Холбоо барих — ${fields.name}`)
        const body = encodeURIComponent(`Нэр: ${fields.name}\nИмэйл: ${fields.email}\n\n${fields.message}`)
        window.open(`mailto:alphamath.admin@gmail.com?subject=${sub}&body=${body}`)
        setSent(true)
    }

    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-16 px-10 text-center'>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>Холбоо <span className='text-[#E75234]'>барих</span></h1>
                <p className='text-gray-600 mt-3 text-lg max-w-lg mx-auto'>
                    Асуулт, санал, хүсэлт байвал доорх маягтыг бөглөж эсвэл шууд Instagram-аар холбогдоорой.
                </p>
            </div>

            <div className='max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10'>

                {/* Form */}
                <div className='sm:col-span-2'>
                    {sent ? (
                        <div className='flex flex-col items-center gap-4 py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm'>
                            <div className='w-14 h-14 rounded-full bg-[#F5DAC6] flex items-center justify-center text-2xl'>✓</div>
                            <p className='font-extrabold text-lg'>Мэдэгдэл илгээгдлээ!</p>
                            <p className='text-gray-400 text-sm max-w-xs'>Имэйл клиент нээгдлээ. Хариуг ажлын 1–2 хоногт хүлээгээрэй.</p>
                            <button onClick={() => { setSent(false); setFields({ name:'', email:'', subject:'', message:'' }) }}
                                className='text-xs text-gray-400 underline mt-2'>Дахин илгээх</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <input required placeholder='Таны нэр' value={fields.name} onChange={set('name')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                                <input required type='email' placeholder='Имэйл хаяг' value={fields.email} onChange={set('email')}
                                    className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                            </div>
                            <input placeholder='Сэдэв' value={fields.subject} onChange={set('subject')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]' />
                            <textarea required rows={6} placeholder='Мэдэгдэл...' value={fields.message} onChange={set('message')}
                                className='border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234] resize-none' />
                            <button type='submit'
                                className='py-3 bg-[#E75234] text-white rounded-xl font-bold hover:bg-[#c94220] transition-colors'>
                                Илгээх
                            </button>
                        </form>
                    )}
                </div>

                {/* Side info */}
                <div className='flex flex-col gap-6'>
                    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3'>
                        <p className='font-extrabold text-sm'>Имэйл</p>
                        <p className='text-sm text-gray-500'>alphamath.admin@gmail.com</p>
                    </div>
                    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3'>
                        <p className='font-extrabold text-sm'>Instagram</p>
                        {channels.map(c => (
                            <a key={c.handle} href={c.link} target='_blank' rel='noopener noreferrer'
                                className='text-sm text-gray-500 hover:text-[#E75234] transition-colors'>
                                {c.handle}
                            </a>
                        ))}
                    </div>
                    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1'>
                        <p className='font-extrabold text-sm'>Хариу өгөх хугацаа</p>
                        <p className='text-sm text-gray-500'>Ажлын 1–2 хоног</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Contact
