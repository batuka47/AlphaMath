import Header from '../components/Header'
import Footer from '../components/Footer'
import sat2 from '../assets/icon/sat2.svg'

const mathTopics = [
    { name: 'Алгебр', pct: '35%', subs: ['Линейн тэгшитгэл', 'Тэнцэтгэл бус', 'Систем тэгшитгэл', 'Функц ба графикууд'] },
    { name: 'Өгөгдлийн дүн шинжилгээ', pct: '15%', subs: ['Статистик', 'Магадлал', 'Диаграмм', 'Тархалт'] },
    { name: 'Нотолгоо ба геометр', pct: '30%', subs: ['Теорем, нотолгоо', 'Тойрог, гурвалжин', 'Координатын геометр', 'Тригонометр'] },
    { name: 'Дэвшилтэт математик', pct: '20%', subs: ['Полином', 'Зэрэг ба язгуур', 'Логарифм', 'Нийлмэл функц'] },
]

const tips = [
    { num: '01', title: 'Цагаа хуваарил', body: 'Математик хэсэгт тус бодлогод дунджаар 1.6 минут байна. Хэт хугацаа зарцуулж буй бодлогыг орхиод дараагийнхыг бодоорой.' },
    { num: '02', title: 'Desmos ашиглах', body: 'SAT digital хувилбарт Module 2 дээр Desmos дотоод calculator байна. График зурах, тэгшитгэл шийдэхэд идэвхтэй хэрэглэ.' },
    { num: '03', title: 'Буруу хариулт — торгуулгүй', body: 'SAT дээр буруу хариулалт оноог хасдаггүй. Мэдэхгүй бодлогыг орхиж болохгүй — заавал таа.' },
    { num: '04', title: 'Алгебрийг бат сур', body: 'SAT математикийн 35% нь линейн тэгшитгэл, тэнцэтгэл бус. Алгебр бол хамгийн чухал суурь.' },
    { num: '05', title: 'Модуль систем', body: 'Digital SAT нь 2 модулиас бүрдэнэ. 1-р модулийн гүйцэтгэлээс хамаарч 2-р модулийн хүнд байдал тохируулагдана.' },
    { num: '06', title: 'Khan Academy дадлага', body: 'College Board-тай хамтарсан Khan Academy-ийн SAT Math дадлага хамгийн бодит материал юм. Үнэ төлбөргүй.' },
]

function SAT() {
    return (
        <div>
            <Header />

            {/* Hero */}
            <div className='w-full bg-[#F8B8AF]/50 py-20 px-10 flex flex-col sm:flex-row items-center justify-center gap-10'>
                <div className='flex flex-col gap-4 max-w-xl'>
                    <span className='w-fit px-3 py-1 bg-[#E7836F] text-white text-xs font-bold rounded-full'>College Board</span>
                    <h1 className='text-4xl sm:text-5xl font-extrabold'>SAT Бэлтгэл</h1>
                    <p className='text-gray-700 text-lg leading-relaxed'>
                        SAT Math нь АНУ-ын их дээд сургуулиудад элсэхэд шаардагддаг
                        шалгалтын математик хэсэг юм. Алгебр, геометр, өгөгдлийн
                        дүн шинжилгээ зэрэг сэдвүүдийг хамардаг.
                    </p>
                    <div className='flex gap-4 mt-2 flex-wrap'>
                        <div className='bg-white rounded-2xl px-5 py-4 shadow-sm text-center'>
                            <p className='text-2xl font-extrabold text-[#E75234]'>800</p>
                            <p className='text-xs text-gray-400 mt-1'>Дээд оноо</p>
                        </div>
                        <div className='bg-white rounded-2xl px-5 py-4 shadow-sm text-center'>
                            <p className='text-2xl font-extrabold text-[#2760A6]'>70 мин</p>
                            <p className='text-xs text-gray-400 mt-1'>Хугацаа</p>
                        </div>
                        <div className='bg-white rounded-2xl px-5 py-4 shadow-sm text-center'>
                            <p className='text-2xl font-extrabold text-gray-700'>44</p>
                            <p className='text-xs text-gray-400 mt-1'>Асуулт</p>
                        </div>
                    </div>
                </div>
                <img src={sat2} alt="SAT" className='w-40 sm:w-56 opacity-80' />
            </div>

            {/* Math topic breakdown */}
            <div className='max-w-5xl mx-auto px-6 py-16'>
                <h2 className='text-2xl font-extrabold mb-2'>Математикийн сэдвүүд</h2>
                <p className='text-gray-400 text-sm mb-8'>44 асуултын хуваарилалт сэдвээр</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    {mathTopics.map((t) => (
                        <div key={t.name} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3'>
                            <div className='flex items-center justify-between'>
                                <h3 className='font-bold text-base'>{t.name}</h3>
                                <span className='text-xs font-extrabold text-[#E7836F] bg-[#F8B8AF]/40 px-2.5 py-1 rounded-full'>{t.pct}</span>
                            </div>
                            <div className='w-full bg-gray-100 rounded-full h-1.5'>
                                <div className='h-1.5 rounded-full bg-[#E7836F]' style={{ width: t.pct }} />
                            </div>
                            <ul className='flex flex-col gap-1'>
                                {t.subs.map(s => (
                                    <li key={s} className='text-sm text-gray-500 flex items-center gap-2'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-[#F8B8AF] flex-shrink-0' />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className='bg-[#FAFAFA] py-16 px-6'>
                <div className='max-w-5xl mx-auto'>
                    <h2 className='text-2xl font-extrabold mb-8'>Зөвлөгөө</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {tips.map(tip => (
                            <div key={tip.num} className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2'>
                                <span className='text-3xl font-extrabold text-gray-100'>{tip.num}</span>
                                <h3 className='font-bold text-base'>{tip.title}</h3>
                                <p className='text-sm text-gray-500 leading-relaxed'>{tip.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coming soon tests */}
            <div className='py-16 px-6 flex flex-col items-center gap-4 text-center'>
                <span className='px-4 py-1.5 bg-[#F8B8AF] rounded-full text-sm font-bold text-[#E7836F]'>Тун удахгүй</span>
                <h2 className='text-2xl font-extrabold'>SAT Дадлага тест</h2>
                <p className='text-gray-500 max-w-md'>
                    SAT-ийн бодит хэлбэрт дадлага тест оруулах ажил хийгдэж байна.
                </p>
            </div>

            <Footer />
        </div>
    )
}

export default SAT
