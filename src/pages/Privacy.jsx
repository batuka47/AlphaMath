import Header from '../components/Header'
import Footer from '../components/Footer'

const sections = [
    {
        title: '1. Цуглуулдаг мэдээлэл',
        body: `AlphaMath нь дараах мэдээллийг цуглуулдаг:
• Бүртгэлийн мэдээлэл: имэйл хаяг, нэр (сонгосон тохиолдолд)
• Тестийн үр дүн: жил, хувилбар, оноо, хариултууд
• Хадгалсан асуулгууд (bookmark)
• Нэвтрэх цаг, платформ (автомат)`
    },
    {
        title: '2. Мэдээллийг хэрхэн ашигладаг вэ',
        body: `Цуглуулсан мэдээллийг зөвхөн дараах зорилгоор ашигладаг:
• Таны акаунтыг тодорхойлох, нэвтрэлт баталгаажуулах
• Тестийн дүн болон хадгалсан асуулгуудыг таньд буцааж харуулах
• Платформын үйл ажиллагааг сайжруулах (нэрийг нуусан хэлбэрээр)`
    },
    {
        title: '3. Мэдээллийн аюулгүй байдал',
        body: `Бид Supabase (PostgreSQL) үйлчилгээг ашиглаж мэдээллийг хадгалдаг. Row Level Security (RLS) бодлогын дагуу зөвхөн та өөрийн мэдээллийг харах боломжтой. Бусад хэрэглэгч таны тестийн дүн болон хадгалсан зүйлийг харах боломжгүй.`
    },
    {
        title: '4. Гуравдагч этгээд',
        body: `AlphaMath нь дараах гуравдагч үйлчилгээг ашигладаг:
• Supabase — мэдээллийн сан, нэвтрэлт баталгаажуулалт
• Google OAuth — Google-ээр нэвтрэх (сонгосон тохиолдолд)

Эдгээр үйлчилгээ нь өөрийн нууцлалын бодлогтой.`
    },
    {
        title: '5. Хэрэглэгчийн эрх',
        body: `Та дараах эрхтэй:
• Акаунтаа устгах — профайл хуудсаас эсвэл бидэнтэй холбогдох замаар
• Тестийн дүнгийн жагсаалтаас дурын мөрийг устгах
• Хадгалсан асуулгуудаас устгах`
    },
    {
        title: '6. Холбоо барих',
        body: 'Нууцлалтай холбоотой асуулт байвал alphamath.admin@gmail.com хаягаар эсвэл манай Instagram-аар холбогдоорой.'
    },
]

function Privacy() {
    return (
        <div>
            <Header />

            <div className='w-full bg-[#F5DAC6] py-16 px-10 text-center'>
                <h1 className='text-4xl sm:text-5xl font-extrabold'>Нууцлалын <span className='text-[#E75234]'>бодлого</span></h1>
                <p className='text-gray-500 mt-3 text-sm'>Сүүлд шинэчилсэн: 2026 оны 5-р сар</p>
            </div>

            <div className='max-w-3xl mx-auto px-6 py-14 flex flex-col gap-8'>
                <p className='text-gray-600 leading-relaxed'>
                    Энэхүү нууцлалын бодлого нь AlphaMath платформ
                    (цаашид "бид", "манай") хэрэглэгчдийн мэдээллийг хэрхэн цуглуулж,
                    ашиглаж, хамгаалдгийг тайлбарладаг.
                </p>
                {sections.map(s => (
                    <div key={s.title} className='flex flex-col gap-2'>
                        <h2 className='font-extrabold text-lg'>{s.title}</h2>
                        <p className='text-gray-600 leading-relaxed whitespace-pre-line'>{s.body}</p>
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    )
}

export default Privacy
