import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const faqs = [
    {
        q: 'AlphaMath үнэ төлбөртэй юу?',
        a: 'Одоогоор бүх материал болон тестүүд үнэ төлбөргүй байна.'
    },
    {
        q: 'ЭЕШ-ийн хэдэн оны тест байна?',
        a: '2006 оноос 2024 он хүртэлх 19 жилийн A, B, C, D хувилбарууд байна.'
    },
    {
        q: 'Тест өгсний дараа хариултаа харж болох уу?',
        a: 'Тийм. Тест дуусгасны дараа дүнгийн хуудаст зөв болон таны хариулт харагдана.'
    },
    {
        q: 'SAT болон Онолын Математик хэзээ нэмэгдэх вэ?',
        a: 'Тун удахгүй нэмэгдэх болно. Шинэчлэлтийг манай Instagram хуудаснаас дагаж байгаарай.'
    },
    {
        q: 'Тест өгсний үр дүн хаана харагдах вэ?',
        a: 'Бүртгэлтэй хэрэглэгч бол Профайл → Миний дүн хэсэгт бүх тестийн түүх хадгалагдана.'
    },
    {
        q: 'Асуулгыг хадгалж болох уу?',
        a: 'Тийм. Нэвтэрсэн хэрэглэгч тест өгөх явцад дурын асуулгыг bookmark хийж Хадгалсан хэсэгт хадгалж болно.'
    },
    {
        q: 'Тестийг дундаас нь орхивол яах вэ?',
        a: 'Хариултууд автоматаар хадгалагдана. Дахин орж ирэхэд "Үргэлжлүүлэх" товч гарч таны явцыг сэргээнэ.'
    },
]

function AccordionItem({ q, a, open, onToggle }) {
    return (
        <div className='border-b border-gray-100'>
            <button
                onClick={onToggle}
                className='w-full flex items-center justify-between py-5 text-left gap-4'
            >
                <span className='font-bold text-base sm:text-lg pr-2'>{q}</span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    open ? 'border-[#E75234] text-[#E75234]' : 'border-gray-300 text-gray-400'
                }`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d={open ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} />
                    </svg>
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                <p className='text-gray-600 leading-relaxed'>{a}</p>
            </div>
        </div>
    )
}

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggle = (i) => setOpenIndex(prev => prev === i ? null : i)

    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-16 px-10 text-center'>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>Түгээмэл асуултууд</h1>
                <p className='text-gray-600 mt-3 text-lg'>Танд асуулт байна уу? Доороос хайгаарай.</p>
            </div>

            <div className='max-w-3xl mx-auto px-6 py-12'>
                {faqs.map((item, i) => (
                    <AccordionItem
                        key={i}
                        q={item.q}
                        a={item.a}
                        open={openIndex === i}
                        onToggle={() => toggle(i)}
                    />
                ))}
            </div>

            <Footer />
        </div>
    )
}

export default FAQ
