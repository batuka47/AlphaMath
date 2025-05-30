import { useState } from 'react'
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
        <div className='w-full flex sm:flex-row flex-col items-center sm:h-screen h-[80vh] bg-[#F5DAC6] '>
          <div className='pt-40 sm:pt-0 sm:w-1/2 max-w-full flex flex-col justify-center sm:ml-20 ml-30 gap-4'>
            <h1 className='sm:text-4xl text-2xl relative font-extrabold'>Таны Академик 
              <img src={spark} alt="spark" className='absolute sm:-left-16 -left-11   -top-14 ' />
              <br /><span className='text-[#E75234]'>Амжилтын Гараа</span> эндээс...
            </h1>
            <p className='sm:text-xl text-xs font-bold'>SAT, ЭЕШ шалгалтуудын бэлтгэл болон Онолын <br/> Математик цөм бүрэн</p>
            <Link to={"/EYSH"}><div className='text-white rounded-lg bg-[#E75234] flex justify-center items-center w-32 h-12'>Эхлэх</div></Link>
          </div>
          <div className=' sm:w-1/2 w-full flex flex-col justify-center items-center relative'>
            <img src={welcome} alt="welcome" className='sm:w-10/12 w-8/12 sm:mr-5 pt-10' />
            <img src={alphacon} alt="alphacon" className='absolute sm:scale-75 scale-45 sm:-bottom-16 -bottom-20 sm:-left-16 -left-4 animate-spin-slow' />
          </div>
        </div>

        <div>
          <h1 className='sm:text-4xl text-2xl font-extrabold w-full sm:px-16 px-6 mt-20'>Цэс сонгох</h1>
          <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 sm:px-16 px-6 mt-10'>
            <Link to={'/EYSHadvice'}>
              <div className='w-full flex flex-col justify-between relative bg-[#96add6b2] sm:h-56  h-35 p-4 sm:rounded-3xl rounded-xl'>
                <div className='w-16 h-16 rounded-full hidden sm:flex justify-center items-center bg-[#2760A6]'>
                  <img src={arrowTR} alt="arrowTR" className='scale-75' />
                </div>
                <div className='flex flex-col gap-2'>
                  <h1 className='font-bold text-xl'>ЭЕШ</h1>
                  <p className='text-[13px] sm:w-64 w-56 '>Lorem ipsum dolor sit amet, 
                  consectetur adipiscing elit. Sed skdfni oisfnwein</p>
                </div>
                <img src={yesh} alt="yesh" className='sm:scale-75 scale-50 absolute sm:-top-2 -top-9 sm:-right-2 -right-9' />
              </div>
            </Link>
            <div className='w-full flex flex-col justify-between relative bg-[#F8B8AFb2] sm:h-56 h-35  p-4 sm:rounded-3xl rounded-xl'>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl'>SAT</h1>
                <p className='text-[13px] sm:w-64 w-56 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
              <div className='w-16 h-16 rounded-full hidden sm:flex justify-center items-center bg-[#E7836F]'>
                <img src={arrowTR} alt="arrowTR" className='scale-75' />
              </div>
                <img src={sat} alt="yesh" className='sm:scale-75 scale-50 absolute sm:-bottom-2 -bottom-4 sm:-right-2 -right-8' />
            </div>
            <div className='w-full flex flex-col justify-between relative bg-[#C9CFD1b2] sm:h-56 h-40  p-4 sm:rounded-3xl rounded-xl'>
              <div className='w-16 h-16 rounded-full hidden sm:flex justify-center items-center bg-[#2760A6]'>
                <img src={arrowTR} alt="arrowTR" className='sm:scale-75 scale-60' />
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl w-16'>Онолын математик</h1>
                <p className='text-[13px] sm:w-64 w-56'>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
                <img src={onol} alt="yesh" className='sm:scale-75 scale-50 absolute sm:-top-2 -top-7 sm:-right-2 -right-8' />
            </div>
          </div>
        </div>
        
        <div className='mb-32'>
          <h1 className='sm:text-4xl text-2xl font-extrabold w-full sm:px-16 px-6 mt-20'>Зөвлөгөө</h1>

          <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 sm:px-16 px-6 mt-10'>
            <div className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative sm:h-96 h-40 sm:p-4 rounded-xl'>
              <img src={yesh2} alt="yesh" className='scale-65 sm:scale-100 rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center  items-center absolute border-1 border-black border-solid '>ЭЕШ</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3 w-40 '>ЭЕШ-д хэрэгтэй зааврууд </h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </div>
            <div className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative sm:h-96 h-40 sm:p-4 rounded-xl'>
              <img src={sat2} alt="yesh" className='scale-65 sm:scale-100 rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center absolute border-1 border-black border-solid '>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3 w-30 '>Шалгалтын талаар</h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </div>
            <div className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative sm:h-96 h-40 sm:p-4 rounded-xl'>
              <img src={sat2} alt="yesh" className='scale-65 sm:scale-100 rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center absolute border-1 border-black border-solid '>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3 sw-40 '>SAT-д туслах стратеги</h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </div>
          </div>
        </div>
        <Footer/>


    </div>
  )
}

export default Home
