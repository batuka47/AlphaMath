import Header from '../components/Header'
import Footer from '../components/Footer'

const team = [
    { name: 'Bat-Erdene',      role: 'Хөгжүүлэгч',    initial: 'B', color: '#2760A6', ig: 'https://www.instagram.com/_batuka_7/', handle: '@_batuka_7' },
    { name: 'Batenkh',         role: 'UI/UX Дизайнер', initial: 'B', color: '#E75234', ig: 'https://www.instagram.com/plutolzy/',  handle: '@plutolzy'  },
    { name: 'Bayarbayasgalan', role: 'Хөгжүүлэгч',    initial: 'B', color: '#2760A6', ig: 'https://www.instagram.com/xuji877/',   handle: '@xuji877'   },
]

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
        </svg>
    )
}

function About() {
    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-20 px-10 flex flex-col items-center gap-4 text-center'>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>
                    Бидний <span className='text-[#E75234]'>тухай</span>
                </h1>
                <p className='text-lg sm:text-xl text-gray-700 max-w-2xl'>
                    AlphaMath нь Монгол оюутнуудад ЭЕШ, SAT болон Онолын Математикийн
                    бэлтгэлд туслах зорилготой боловсролын платформ юм.
                </p>
            </div>

            <div className='max-w-4xl mx-auto px-6 py-16 flex flex-col gap-4 text-center'>
                <h2 className='text-2xl font-extrabold'>Манай зорилго</h2>
                <p className='text-gray-600 text-lg leading-relaxed'>
                    Монгол хэл дээрх чанартай, хүртээмжтэй математикийн бэлтгэлийн материалыг
                    нэг дороос олоход хүрэлцэхүйц хялбар болгох. 2006 оноос хойших бүх ЭЕШ-ийн
                    жилийн хувилбаруудыг дадлагажуулж, оноогоо мэдэж ав.
                </p>
            </div>

            <div className='max-w-5xl mx-auto px-6 pb-24'>
                <h2 className='text-2xl font-extrabold text-center mb-10'>Баг</h2>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                    {team.map(member => (
                        <div key={member.name}
                            className='bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-4'>
                            <div className='w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-extrabold'
                                style={{ backgroundColor: member.color }}>
                                {member.initial}
                            </div>
                            <div className='text-center'>
                                <p className='font-extrabold text-lg'>{member.name}</p>
                                <p className='text-sm text-gray-400'>{member.role}</p>
                            </div>
                            <a href={member.ig} target='_blank' rel='noopener noreferrer'
                                className='flex items-center gap-2 text-sm text-gray-500 hover:text-[#E75234] transition-colors px-3 py-1.5 rounded-xl hover:bg-gray-50'>
                                <InstagramIcon />
                                {member.handle}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default About
