import Header from '../components/Header'
import Footer from '../components/Footer'

const principles = [
    {
        num: '01',
        title: 'Математикийн үнэн зөв байдал',
        body: 'Бүх асуулт, хариулт, тайлбар нь баталгаажсан эх сурвалжид үндэслэсэн байна. ЭЕШ-ийн тестүүд нь Боловсролын үнэлгээний төвийн (БҮТ) албан ёсны материалаас авагдсан.'
    },
    {
        num: '02',
        title: 'Алдааг залруулах',
        body: 'Контентод алдаа илрүүлсэн тохиолдолд бид 48 цагт дотор залруулж, шинэчлэлтийн огноог тэмдэглэнэ. Алдааг мэдэгдэхийн тулд бидэнтэй холбогдоорой.'
    },
    {
        num: '03',
        title: 'Эх сурвалж',
        body: `AlphaMath-д ашигласан агуулгын эх сурвалжууд:
• БҮТ-ийн албан ёсны ЭЕШ-ийн материал (2006–2024)
• College Board-ийн SAT материал
• Монгол Улсын математикийн сургалтын стандарт`
    },
    {
        num: '04',
        title: 'Хэрэглэгчийн мэдэгдэл',
        body: 'Хэрэглэгч зөв гэж үзсэн хариулт эсвэл тайлбарт эргэлзэж байвал Холбоо барих хэсгээр мэдэгдэж болно. Бид бүх мэдэгдлийг шалган хариу өгнө.'
    },
    {
        num: '05',
        title: 'Хэрэглэгч үүсгэсэн контент',
        body: 'Одоогоор AlphaMath нь хэрэглэгч үүсгэсэн контентыг нийтэд харагдахаар байршуулдаггүй. Ирээдүйд нэмэгдэх тохиолдолд тусгай редакцийн журам мөрдөгдөнө.'
    },
    {
        num: '06',
        title: 'Сурталчилгаа ба хамааралгүй байдал',
        body: 'Платформ дээрх сурталчилгаа нь контентоос тодорхой тусгаарлагдсан байна. Спонсорлогч болон сурталчлагчид контентын агуулга, хариултад нөлөөлөх боломжгүй.'
    },
]

function Editorial() {
    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-16 px-10 text-center'>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>Редакцийн <span className='text-[#E75234]'>ёс зүй</span></h1>
                <p className='text-gray-600 mt-3 text-lg max-w-lg mx-auto'>
                    AlphaMath-ийн контент хэрхэн бэлтгэгдэж, шалгагдаж, засагддагийг тайлбарладаг зарчмууд.
                </p>
            </div>

            <div className='max-w-3xl mx-auto px-6 py-14 flex flex-col gap-8'>
                {principles.map(p => (
                    <div key={p.num} className='flex flex-row gap-6 items-start'>
                        <span className='text-4xl font-extrabold text-gray-100 flex-shrink-0 w-12'>{p.num}</span>
                        <div className='flex flex-col gap-2'>
                            <h2 className='font-extrabold text-lg'>{p.title}</h2>
                            <p className='text-gray-600 leading-relaxed whitespace-pre-line'>{p.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    )
}

export default Editorial
