import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

import welcome from '../assets/welcome.png'
import spark   from '../assets/icon/spark.svg'
import arrowTR from '../assets/icon/arrowTR.svg'
import yesh    from '../assets/icon/yesh.svg'
import sat     from '../assets/icon/sat.svg'
import onol    from '../assets/icon/onol.svg'
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

        {/* Mobile: horizontal scroll — Desktop: 3-col grid, same height */}
        <div className="flex overflow-x-auto gap-4 pb-3 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible snap-x snap-mandatory">

          {/* ── ЭЕШ ── */}
          <Link to="/EYSH"
            className="snap-start flex-shrink-0 w-52 sm:w-auto relative overflow-hidden rounded-3xl bg-[#96ADD6]/70 h-52 sm:h-64 p-5 flex flex-col justify-between">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#2760A6] flex items-center justify-center flex-shrink-0 z-10">
              <img src={arrowTR} alt="" className="scale-75" />
            </div>
            <div className="z-10">
              <h2 className="font-bold text-lg sm:text-2xl">ЭЕШ</h2>
              <p className="text-xs sm:text-sm mt-1 leading-snug" style={{color:'#555'}}>
                2006–2024 оны бүх хувилбаруудыг дадлагажуулж, оноогоо мэдэж ав.
              </p>
            </div>
            <img src={yesh} alt="" className="absolute -top-2 -right-2 w-28 sm:w-52 pointer-events-none" />
          </Link>

          {/* ── SAT — image bottom ── */}
          <Link to="/SAT"
            className="snap-start flex-shrink-0 w-52 sm:w-auto relative overflow-hidden rounded-3xl bg-[#F8B8AF]/70 h-52 sm:h-64 p-5 flex flex-col justify-between">
            <div className="z-10">
              <h2 className="font-bold text-lg sm:text-2xl">SAT</h2>
              <p className="text-xs sm:text-sm mt-1 leading-snug" style={{color:'#555'}}>
                Олон улсын SAT шалгалтад зориулсан материал, практик тест.
              </p>
            </div>
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#E7836F] flex items-center justify-center flex-shrink-0 z-10">
              <img src={arrowTR} alt="" className="scale-75" />
            </div>
            <img src={sat} alt="" className="absolute -bottom-2 -right-2 w-28 sm:w-48 pointer-events-none" />
          </Link>

          {/* ── Theory ── */}
          <Link to="/Theory"
            className="snap-start flex-shrink-0 w-52 sm:w-auto relative overflow-hidden rounded-3xl bg-[#C9CFD1]/70 h-52 sm:h-64 p-5 flex flex-col justify-between">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#2760A6] flex items-center justify-center flex-shrink-0 z-10">
              <img src={arrowTR} alt="" className="scale-75" />
            </div>
            <div className="z-10">
              <h2 className="font-bold text-lg sm:text-2xl">Онолын математик</h2>
              <p className="text-xs sm:text-sm mt-1 leading-snug" style={{color:'#555'}}>
                Тодорхойлолт, томьёо, сэдвийн бүрэлдэхүүнийг цэгцтэй судал.
              </p>
            </div>
            <img src={onol} alt="" className="absolute -top-2 -right-2 w-28 sm:w-52 pointer-events-none" />
          </Link>

        </div>
      </div>

      {/* Tip cards */}
      <div className="px-6 sm:px-16 mt-12 mb-20 sm:mb-32">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10">Зөвлөгөө</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl h-full">
            <img src={yesh2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">ЭЕШ</span>
                <div className="w-2 h-2 rounded-full bg-[#2760A6]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">ЭЕШ-д хэрэгтэй зааврууд</h2>
              <p className="text-xs sm:text-[13px]" style={{color:'#555'}}>
                Тестийг өгөхөөс өмнө хэд хэдэн хувилбарыг давт. Цагаа зөв хуваарил.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl h-full">
            <img src={sat2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">SAT</span>
                <div className="w-2 h-2 rounded-full bg-[#E7836F]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">Шалгалтын талаар</h2>
              <p className="text-xs sm:text-[13px]" style={{color:'#555'}}>
                Алгебр, өгөгдлийн дүн шинжилгээ, нотолгоонд анхаарлаа хандуул.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-4 border border-[#E7836F] p-4 rounded-xl h-full">
            <img src={onol2} alt="" className="w-20 sm:w-auto flex-shrink-0 object-contain" />
            <div className="flex flex-col gap-1 sm:gap-2 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 border border-black rounded-sm">Онол</span>
                <div className="w-2 h-2 rounded-full bg-[#E7836F]"></div>
              </div>
              <h2 className="font-bold text-base sm:text-xl">Онолын математикийн стратеги</h2>
              <p className="text-xs sm:text-[13px]" style={{color:'#555'}}>
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
