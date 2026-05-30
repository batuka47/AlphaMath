import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

import welcome from '../assets/welcome.png'
import spark from '../assets/icon/spark.svg'
import alphacon from '../assets/icon/alphacon.svg'
import arrowTR from '../assets/icon/arrowTR.svg'
import yesh from '../assets/icon/yesh.svg'
import onol from '../assets/icon/onol.svg'
import sat from '../assets/icon/sat.svg'
import yesh2 from '../assets/icon/yesh2.svg'
import onol2 from '../assets/icon/onol2.svg'
import sat2 from '../assets/icon/sat2.svg'

function Home() {
  return (
    <div>
      <Header />

      {/* Hero */}
      <div className='w-full flex flex-row items-center h-screen bg-[#F5DAC6]'>
        <div className='w-1/2 flex flex-col justify-center ml-20 gap-4'>
          <h1 className='text-4xl relative font-extrabold'>
            Таны Академик
            <img src={spark} alt="spark" className='absolute -left-16 -top-14' />
            <br /><span className='text-[#E75234]'>Амжилтын Гараа</span> эндээс...
          </h1>
          <p className='text-xl font-bold'>
            SAT, ЭЕШ шалгалтуудын бэлтгэл болон Онолын <br /> Математик цөм бүрэн
          </p>
          <Link to="/EYSH" className='text-white rounded-lg bg-[#E75234] flex justify-center items-center w-32 h-12'>
            Эхлэх
          </Link>
        </div>
        <div className='w-1/2 flex flex-col justify-center items-center relative'>
          <img src={welcome}  alt="welcome"  className='w-10/12 mr-5' />
          <img src={alphacon} alt="alphacon" className='absolute scale-75 -bottom-16 -left-16'
            style={{ animation: 'spin 10s linear infinite' }} />
        </div>
      </div>

      {/* Menu cards */}
      <div>
        <h1 className='text-4xl font-extrabold w-full px-16 mt-20'>Цэс сонгох</h1>
        <div className='grid grid-cols-3 gap-4 px-16 mt-10'>

          {/* ЭЕШ */}
          <Link to="/EYSH" className='w-full flex flex-col justify-between relative bg-[#96add6b2] md:h-56 2xl:h-80 p-4 rounded-3xl'>
            <div className='w-16 h-16 2xl:w-24 2xl:h-24 rounded-full flex justify-center items-center bg-[#2760A6]'>
              <img src={arrowTR} alt="arrowTR" className='scale-75 2xl:scale-150' />
            </div>
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl 2xl:text-2xl'>ЭЕШ</h1>
              <p className='text-[13px] w-64 2xl:w-96 2xl:text-xl'>
                2006–2024 оны бүх хувилбаруудыг дадлагажуулж, оноогоо мэдэж ав.
              </p>
            </div>
            <img src={yesh} alt="yesh" className='scale-75 2xl:scale-100 absolute 2xl:top-6 2xl:right-6 -top-2 -right-2' />
          </Link>

          {/* SAT */}
          <Link to="/SAT" className='w-full flex flex-col justify-between relative bg-[#F8B8AFb2] md:h-56 2xl:h-80 p-4 rounded-3xl'>
            <img src={sat} alt="sat" className='scale-75 2xl:scale-100 absolute 2xl:bottom-6 2xl:right-6 -bottom-2 -right-2' />
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl 2xl:text-2xl'>SAT</h1>
              <p className='text-[13px] w-64 2xl:w-96 2xl:text-xl'>
                Олон улсын SAT шалгалтад зориулсан материал, практик тест.
              </p>
            </div>
            <div className='w-16 h-16 2xl:w-24 2xl:h-24 rounded-full flex justify-center items-center bg-[#E7836F]'>
              <img src={arrowTR} alt="arrowTR" className='scale-75 2xl:scale-150' />
            </div>
          </Link>

          {/* Онолын математик */}
          <Link to="/Theory" className='w-full flex flex-col justify-between relative bg-[#C9CFD1b2] md:h-56 2xl:h-80 p-4 rounded-3xl'>
            <div className='w-16 h-16 2xl:w-24 2xl:h-24 rounded-full flex justify-center items-center bg-[#2760A6]'>
              <img src={arrowTR} alt="arrowTR" className='scale-75 2xl:scale-150' />
            </div>
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl 2xl:text-2xl'>Онолын математик</h1>
              <p className='text-[13px] w-64 2xl:w-96 2xl:text-xl'>
                Тодорхойлолт, томьёо, сэдвийн бүрэлдэхүүнийг цэгцтэй судал.
              </p>
            </div>
            <img src={onol} alt="onol" className='scale-75 2xl:scale-100 absolute 2xl:top-6 2xl:right-6 -top-2 -right-2' />
          </Link>

        </div>
      </div>

      {/* Tip cards */}
      <div className='mb-32'>
        <h1 className='text-4xl font-extrabold w-full px-16 mt-20'>Зөвлөгөө</h1>
        <div className='grid grid-cols-3 gap-4 px-16 mt-10'>

          {/* ЭЕШ tip */}
          <div className='w-full flex flex-col border-1 border-[#E7836F] border-solid justify-between relative min-h-96 p-4 rounded-xl'>
            <img src={yesh2} alt="yesh" />
            <div className='flex flex-row justify-start gap-2 py-2 items-center w-full'>
              <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>ЭЕШ</h1>
              <div className='w-2 h-2 rounded-full bg-[#2760A6]'></div>
            </div>
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl'>ЭЕШ-д хэрэгтэй зааврууд</h1>
              <p className='text-[13px] w-64'>
                Тестийг өгөхөөс өмнө хэд хэдэн хувилбарыг давт. Цагаа зөв хуваарил — нэгдүгээр хэсэгт хэт их цаг зарцуулахгүй байхыг анхаар.
              </p>
            </div>
          </div>

          {/* SAT tip */}
          <div className='w-full flex flex-col justify-between border-1 border-[#E7836F] border-solid min-h-96 p-4 rounded-xl'>
            <img src={sat2} alt="sat" />
            <div className='flex flex-row justify-start gap-2 py-2 items-center w-full'>
              <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>SAT</h1>
              <div className='w-2 h-2 rounded-full bg-[#E7836F]'></div>
            </div>
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl'>Шалгалтын талаар</h1>
              <p className='text-[13px] w-64'>
                SAT нь Англи хэл болон математикийн хоёр хэсгээс бүрдэнэ. Алгебр, өгөгдлийн дүн шинжилгээ, нотолгоонд анхаарлаа хандуул.
              </p>
            </div>
          </div>

          {/* Онолын математик tip — FIXED: was labeled "SAT" */}
          <div className='w-full flex flex-col justify-between border-1 border-[#E7836F] border-solid min-h-96 p-4 rounded-xl'>
            <img src={onol2} alt="onol" />
            <div className='flex flex-row justify-start gap-2 py-2 items-center w-full'>
              <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>Онол</h1>
              <div className='w-2 h-2 rounded-full bg-[#E7836F]'></div>
            </div>
            <div className='flex flex-col gap-2'>
              <h1 className='font-bold text-xl'>Онолын математикийн стратеги</h1>
              <p className='text-[13px] w-64'>
                Нотолгооны арга барил эзэмшиж, томьёонуудыг ойлгож цээжил. Сэдэв бүрийн тодорхойлолтыг зөв ойлгох нь суурь чадвар юм.
              </p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home