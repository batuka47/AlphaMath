import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

import welcome from '../assets/welcome.png'
import spark   from '../assets/icon/spark.svg'
import arrowTR from '../assets/icon/arrowTR.svg'
import yesh    from '../assets/icon/yesh.svg'
import onol    from '../assets/icon/onol.svg'
import sat     from '../assets/icon/sat.svg'
import yesh2   from '../assets/icon/yesh2.svg'
import onol2   from '../assets/icon/onol2.svg'
import sat2    from '../assets/icon/sat2.svg'

function Home() {
  return (
    <div className="overflow-x-hidden">
      <Header />

      {/* Hero */}
      <div className="w-full bg-[#F5DAC6] flex flex-col sm:flex-row items-center py-14 sm:h-screen sm:py-0 px-6 sm:px-0 gap-8 sm:gap-0">

        {/* Text side */}
        <div className="w-full sm:w-1/2 flex flex-col gap-4 sm:ml-20">
          <h1 className="text-3xl sm:text-4xl relative font-extrabold leading-tight">
            <img src={spark} alt="" className="absolute -left-8 sm:-left-16 -top-10 sm:-top-14 w-12 sm:w-auto pointer-events-none" />
            Таны Академик<br />
            <span className="text-[#E75234]">Амжилтын Гараа</span> эндээс...
          </h1>
          <p className="text-base sm:text-xl font-bold text-gray-700">
            SAT, ЭЕШ шалгалтуудын бэлтгэл болон Онолын Математик цөм бүрэн
          </p>
          <Link
            to="/EYSH"
            className="text-white rounded-xl bg-[#E75234] flex justify-center items-center w-32 h-12 font-bold text-base hover:bg-[#c94220] transition-colors mt-2"
          >
            Эхлэх
          </Link>
        </div>

        {/* Image side — hidden on mobile */}
        <div className="hidden sm:flex w-1/2 flex-col justify-center items-center relative">
          <img src={welcome} alt="welcome" className="w-10/12 mr-5" />
        </div>
      </div>

      {/* Menu cards */}
      <div className="px-6 sm:px-16 mt-14 sm:mt-20">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10">Цэс сонгох</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <Link to="/EYSH" className="flex flex-row sm:flex-col justify-between relative bg-[#96add6b2] h-28 sm:h-56 p-4 rounded-3xl">
            <div className="flex sm:flex-col flex-row items-center sm:items-start gap-3 sm:gap-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex justify-center items-center bg-[#2760A6] flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div className="flex flex-col gap-1 sm:mt-auto">
                <h2 className="font-bold text-lg sm:text-xl">ЭЕШ</h2>
                <p className="text-xs sm:text-[13px] text-gray-700 hidden sm:block w-64">
                  2006–2024 оны бүх хувилбаруудыг дадлагажуулж, оноогоо мэдэж ав.
                </p>
              </div>
            </div>
            <img src={yesh} alt="" className="w-20 sm:w-auto scale-75 sm:scale-75 absolute right-2 top-2 sm:-top-2 sm:-right-2 pointer-events-none" />
          </Link>

          <Link to="/SAT" className="flex flex-row sm:flex-col justify-between relative bg-[#F8B8AFb2] h-28 sm:h-56 p-4 rounded-3xl">
            <div className="flex sm:flex-col flex-row items-center sm:items-start gap-3 sm:gap-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex justify-center items-center bg-[#E7836F] flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div className="flex flex-col gap-1 sm:mt-auto">
                <h2 className="font-bold text-lg sm:text-xl">SAT</h2>
                <p className="text-xs sm:text-[13px] text-gray-700 hidden sm:block w-64">
                  Олон улсын SAT шалгалтад зориулсан материал, практик тест.
                </p>
              </div>
            </div>
            <img src={sat} alt="" className="w-20 sm:w-auto scale-75 absolute right-2 bottom-2 sm:-bottom-2 sm:-right-2 pointer-events-none" />
          </Link>

          <Link to="/Theory" className="flex flex-row sm:flex-col justify-between relative bg-[#C9CFD1b2] h-28 sm:h-56 p-4 rounded-3xl">
            <div className="flex sm:flex-col flex-row items-center sm:items-start gap-3 sm:gap-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex justify-center items-center bg-[#2760A6] flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div className="flex flex-col gap-1 sm:mt-auto">
                <h2 className="font-bold text-lg sm:text-xl">Онолын математик</h2>
                <p className="text-xs sm:text-[13px] text-gray-700 hidden sm:block w-64">
                  Тодорхойлолт, томьёо, сэдвийн бүрэлдэхүүнийг цэгцтэй судал.
                </p>
              </div>
            </div>
            <img src={onol} alt="" className="w-20 sm:w-auto scale-75 absolute right-2 top-2 sm:-top-2 sm:-right-2 pointer-events-none" />
          </Link>

        </div>
      </div>

      {/* Tip cards */}
      <div className="px-6 sm:px-16 mt-12 mb-20 sm:mb-32">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10">Зөвлөгөө</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl">
            <img src={yesh2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">ЭЕШ</span>
                <div className="w-2 h-2 rounded-full bg-[#2760A6]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">ЭЕШ-д хэрэгтэй зааврууд</h2>
              <p className="text-xs sm:text-[13px] text-gray-600">
                Тестийг өгөхөөс өмнө хэд хэдэн хувилбарыг давт. Цагаа зөв хуваарил.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl">
            <img src={sat2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">SAT</span>
                <div className="w-2 h-2 rounded-full bg-[#E7836F]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">Шалгалтын талаар</h2>
              <p className="text-xs sm:text-[13px] text-gray-600">
                Алгебр, өгөгдлийн дүн шинжилгээ, нотолгоонд анхаарлаа хандуул.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl">
            <img src={onol2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">Онол</span>
                <div className="w-2 h-2 rounded-full bg-[#E7836F]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">Онолын математикийн стратеги</h2>
              <p className="text-xs sm:text-[13px] text-gray-600">
                Томьёонуудыг ойлгож цээжил. Тодорхойлолтыг зөв ойлгох нь суурь.
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
