import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import study from '../assets/study.png'
import pointDown from '../assets/icon/pointDown.svg'
import { useNavigate } from 'react-router-dom'

function SATstatistic() {
    const navigate = useNavigate();

    return (
        <div >
            <Header />
            
            <div className="flex flex-col gap-10 justify-center items-center rounded-lg shadow-md sm:p-6 relative px-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors absolute top-10 left-10"
                >
                    <img src={pointDown} alt="back" className="w-6 h-6 rotate-90" />
                </button>
                <h1 className='flex justify-center items-center sm:text-4xl text-2xl relative font-extrabold mt-20'>SAT Шалгалтын талаар
                </h1>
                <div className='flex w-full sm:w-2/3 justify-center items-center rounded-sm'>
                    <img src={study} alt="study" className='w-full' />
                </div>
                <div className='flex w-full sm:w-2/3 flex-col gap-5'>
                <p className=' sm:text-[18px] text-[16px] '>Монгол залуус гадаадын их сургуулиудад тэтгэлгээр суралцахад тулгардаг 
                    томоохон шалгуур болох SAT шалгалтын талаар мэдээлэл орууллаа. Энэхүү мэдээллийг уншсанаараа та SAT 
                    гэж юу вэ? Ямар бүтэцтэй вэ? Хэрхэн бүртгүүлэх вэ? Хэрхэн бэлдэж өндөр оноо авах вэ? гээд цогц мэдээллийг 
                    авах болно.
                </p>
                <h1 className='font-bold sm:text-xl text-base'>SAT-Scholastic Aptitude (Assessment) Test</h1>
                <p className=' sm:text-[18px] text-[16px]'>АНУ-д бакалаврын зэргээр сурахыг горилогчид голдуу ACT аль эсвэл SAT
                     шалгалтын тодорхой босгыг давсан байх шаардлагатай юм. Өнөөдрийн нийтлэлээр та бүхэнтэй SAT хэмээн шалгалтын яг ямар шалгалт болохыг, 
                    түүнчлэн хэрхэн үр дүнтэй бэлдэх зэрэг талаар хуваалцах болно. Энэ шалгалтыг Монголд хэд хэдэн газар авдаг, дээрээс нь бэлдэх газар, 
                    материал, мэдээлэл элбэг байдаг юм.
                </p>
                <h1 className='font-bold sm:text-xl text-base '>Шалгалтын тухай товчхон...</h1>
                <p className=' sm:text-[18px] text-[16px] '>Энэ шалгалт нь анх 1926 оноос хэрэгжиж эхэлсэн Америкийн их дээд 
                    сургуульд, коллежид ороход гол шалгуур болсон, ахлах ангийг төгсөх сурагчдад зориулсан чухал шалгалт билээ. Манайхаар бол конкурс буюу 
                    ЭЕШ гэж ойлгож болно. SAT нь Scholastic Aptitude Test үгний товчлол бөгөөд хожим нь Scholastic Assessment Test болгон нэрийг нь өөрчилж 
                    байсан байна. Энэхүү шалгалтыг College Board гэсэн хувийн, ашгийн бус байгууллага мөн бид бүхний сайн мэдэх TOEFL шалгалтыг авдаг ETS
                    (Educational Testing Service) боловсролын байгууллагууд хамтран зохион байгуулж авдаг байна. 
                </p>
                <h1 className='font-bold sm:text-xl text-base '>Шалгалтын бүтэц</h1>
                <div>
                    <p className=' sm:text-[18px] text-[16px]'>Монголд DSAT буюу Digital Scholastic Assessment Test-ыг авдаг.</p>
                    <p className='sm:text-[18px] text-[16px]'>DSAT-ын хувьд шалгалтын бүтэц нь:</p>
                    <p className='sm:text-[18px] text-[16px]'>1. English (54 АСУУЛТ, 64 МИНУТ)</p>
                    <p className='sm:text-[18px] text-[16px]'>• Reading & Writing, Модуль 1: 27 асуулт</p>
                    <p className='sm:text-[18px] text-[16px]'>• Reading & Writing, Модуль 2: 27 асуулт</p>
                    <p className='sm:text-[18px] text-[16px]'>• Завсарлагаа (10 минут)</p>
                    <p className='sm:text-[18px] text-[16px]'>2. Math (44 АСУУЛТ, 70 МИНУТ)</p>
                    <p className=' sm:text-[18px] text-[16px]'>• Math, Модуль 1: 22 асуулт</p>
                    <p className=' sm:text-[18px] text-[16px]'>• Math, Модуль 2: 22 асуулт</p>
                </div>
                    
                
                <h1 className='font-bold sm:text-xl text-base '>Хаана, хэзээ, төлбөр?</h1>
                <p className='flex justify-center items-center sm:text-[18px] text-[16px]  mb-20'>Энэ шалгалтыг өгөхийн тулд АНУ ч юм уу өөр нэгэн гадаадын улс орныг зорих
                    шаардлагагүй ээ. Монголдоо SAT шалгалтыг өгөх боломжтой. Тодруулбал, Улаанбаатар хотод International School of Ulaanbaatar, Jet School of 
                    English, EDEX гэсэн 3 газрын аль боломжтойд нь шалгалтаа өгнө. Ингэхдээ та www.collegeboard.org цахим хуудсаар дамжуулж өөрийн гэсэн хаягаа 
                    нээн онлайнаар болон цаасан хэлбэрээр (ихэвчлэн онлайнаар) бүртгүүлнэ. Шалгалт болохоос ойролцоогоор 1 сарын өмнө бүртгэл дуусдаг тул эртхэн
                    бүртгүүлвэл зүгээр байдаг. Учир нь оройтож бүртгүүлсэн шалгуулагчид нэмэлт төлбөр төлөх тохиолдол гардаг. Бүртгэлийн хураамж $104 байдгийн 
                    дээр Зүүн Азийн шалгуулагчид $43 нэмж төлдөг. Хэрэв Optional Essay хэсгийг өгнө гэвэл нэмэлтээр $13 төлөх юм байна. Ерөнхийдөө Монголд 160-180
                    ам.доллараар энэхүү шалгалтыг өгнө гэж ойлгож болно. 
                </p>
                </div>
            </div>
            <Footer />
        </div>
       
    )
}

export default SATstatistic 