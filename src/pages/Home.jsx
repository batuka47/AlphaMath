import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

import welcome from '../assets/welcome.png'
import boy     from '../assets/boy.png'
import study   from '../assets/study.png'
import board   from '../assets/board.png'
import spark   from '../assets/icon/spark.svg'
import arrowTR from '../assets/icon/arrowTR.svg'
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

        {/* Desktop: 3 cols, different heights aligned to bottom */}
        {/* Mobile: stacked full-width */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end">

          {/* ── ЭЕШ — tallest ── */}
          <Link to="/EYSH"
            className="relative overflow-hidden rounded-3xl bg-[#96ADD6]/70 h-36 sm:h-80 block">
            {/* Photo: right side, diagonal left edge */}
            <img src={boy} alt="" className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-center pointer-events-none"
              style={{ clipPath: 'polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
            {/* Text in gap */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between" style={{ width: '52%' }}>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#2760A6] flex items-center justify-center flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div>
                <h2 className="font-bold text-xl sm:text-2xl">ЭЕШ</h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 hidden sm:block leading-snug">
                  2006–2024 оны бүх хувилбаруудыг дадлагажуулж, оноогоо мэдэж ав.
                </p>
              </div>
            </div>
          </Link>

          {/* ── SAT — medium ── */}
          <Link to="/SAT"
            className="relative overflow-hidden rounded-3xl bg-[#F8B8AF]/70 h-36 sm:h-64 block">
            {/* Photo: left side, diagonal right edge */}
            <img src={study} alt="" className="absolute inset-y-0 left-0 h-full w-3/5 object-cover object-center pointer-events-none"
              style={{ clipPath: 'polygon(0% 0%, 78% 0%, 100% 100%, 0% 100%)' }} />
            {/* Text in gap — right side */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between items-end ml-auto" style={{ width: '48%' }}>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#E7836F] flex items-center justify-center flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div className="text-right">
                <h2 className="font-bold text-xl sm:text-2xl">SAT</h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 hidden sm:block leading-snug">
                  Олон улсын SAT шалгалтад зориулсан материал, практик тест.
                </p>
              </div>
            </div>
          </Link>

          {/* ── Theory — shortest ── */}
          <Link to="/Theory"
            className="relative overflow-hidden rounded-3xl bg-[#C9CFD1]/70 h-36 sm:h-56 block">
            {/* Photo: right side, steeper diagonal */}
            <img src={board} alt="" className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-center pointer-events-none"
              style={{ clipPath: 'polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
            {/* Text in gap */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between" style={{ width: '50%' }}>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#2760A6] flex items-center justify-center flex-shrink-0">
                <img src={arrowTR} alt="" className="scale-75" />
              </div>
              <div>
                <h2 className="font-bold text-lg sm:text-xl leading-tight">Онолын математик</h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 hidden sm:block leading-snug">
                  Тодорхойлолт, томьёо, сэдвийн бүрэлдэхүүнийг цэгцтэй судал.
                </p>
              </div>
            </div>
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
