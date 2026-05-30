import Header from '../components/Header'
import Footer from '../components/Footer'
import onol2 from '../assets/icon/onol2.svg'

const topics = [
    {
        id: 'algebra',
        name: 'Алгебр',
        color: '#96ADD6',
        dot: '#2760A6',
        subtopics: [
            'Тэгшитгэл ба тэнцэтгэл бус',
            'Функц ба графикууд',
            'Полином',
            'Логарифм ба зэрэг',
            'Тооны систем',
            'Иррациональ илэрхийлэл',
        ]
    },
    {
        id: 'geometry',
        name: 'Геометр',
        color: '#F8B8AF',
        dot: '#E7836F',
        subtopics: [
            'Гурвалжин ба тэгш өнцөгт',
            'Тойрог ба дуугиурдлага',
            'Вектор',
            'Координатын геометр',
            'Стереометр',
            'Тригонометр',
        ]
    },
    {
        id: 'probability',
        name: 'Магадлал ба Статистик',
        color: '#C9CFD1',
        dot: '#556B7B',
        subtopics: [
            'Нэгдэл ба хэлбэрлэлт',
            'Магадлалын үндсэн ойлголт',
            'Нөхцөлт магадлал',
            'Тархалт ба дундаж',
            'Гистограмм ба диаграмм',
            'Статистик дүгнэлт',
        ]
    },
    {
        id: 'calculus',
        name: 'Математик Анализ',
        color: '#D4C5F9',
        dot: '#7C4DFF',
        subtopics: [
            'Дараалал ба цуваа',
            'Хязгаар (limit)',
            'Уламжлал',
            'Дифференциал тооцоо',
            'Интеграл',
            'Функцийн судалгаа',
        ]
    },
]

function TopicCard({ topic }) {
    return (
        <div className='bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col'>
            {/* Header bar */}
            <div className='h-2 w-full' style={{ backgroundColor: topic.dot }} />
            <div className='p-6 flex flex-col gap-4 flex-1'>
                <div className='flex items-start justify-between'>
                    <h3 className='font-extrabold text-xl'>{topic.name}</h3>
                    <span className='text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0'
                        style={{ backgroundColor: topic.color + '55', color: '#444' }}>
                        Тун удахгүй
                    </span>
                </div>
                <ul className='flex flex-col gap-2'>
                    {topic.subtopics.map(sub => (
                        <li key={sub} className='flex items-center gap-2.5 text-sm text-gray-600'>
                            <div className='w-1.5 h-1.5 rounded-full flex-shrink-0' style={{ backgroundColor: topic.dot }} />
                            {sub}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='px-6 pb-6'>
                <button disabled
                    className='w-full py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed'>
                    Удахгүй нэмэгдэнэ
                </button>
            </div>
        </div>
    )
}

function Theory() {
    return (
        <div>
            <Header />

            {/* Hero */}
            <div className='w-full bg-[#C9CFD1]/40 py-20 px-10 flex flex-col sm:flex-row items-center justify-center gap-10'>
                <div className='flex flex-col gap-4 max-w-xl'>
                    <h1 className='text-4xl sm:text-5xl font-extrabold'>Онолын <span className='text-[#2760A6]'>Математик</span></h1>
                    <p className='text-gray-700 text-lg leading-relaxed'>
                        Тодорхойлолт, томьёо, сэдвийн бүрэлдэхүүнийг цэгцтэй судал.
                        Алгебр, Геометр, Магадлал болон Математик Анализын бүх сэдвийг
                        нэг дороос.
                    </p>
                    <div className='flex flex-wrap gap-2 mt-1'>
                        {topics.map(t => (
                            <span key={t.id}
                                className='px-3 py-1.5 rounded-full text-xs font-bold'
                                style={{ backgroundColor: t.color + '55', color: '#333' }}>
                                {t.name}
                            </span>
                        ))}
                    </div>
                </div>
                <img src={onol2} alt="Онолын математик" className='w-40 sm:w-52 opacity-75' />
            </div>

            {/* Topic cards */}
            <div className='max-w-5xl mx-auto px-6 py-16'>
                <h2 className='text-2xl font-extrabold mb-8'>Сэдвүүд</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    {topics.map(topic => (
                        <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Theory
