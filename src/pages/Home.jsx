import { useState } from 'react'
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
        <div className='w-full flex flex-row items-center h-[600px] bg-[#F5DAC6] '>
          <div className=' w-1/2 flex flex-col justify-center ml-20 gap-4'>
            <h1 className='text-4xl relative font-extrabold'>Таны Академик 
              <img src={spark} alt="spark" className='absolute -left-16  -top-14' />
              <br /><span className='text-[#E75234]'>Амжилтын Гараа</span> эндээс...
            </h1>
            <p className='text-xl font-bold'>SAT, ЭЕШ шалгалтуудын бэлтгэл болон Онолын <br/> Математик цөм бүрэн</p>
            <div className='text-white rounded-lg bg-[#E75234] flex justify-center items-center w-32 h-12'>Эхлэх</div>
          </div>
          <div className=' w-1/2 flex flex-col justify-center items-center relative'>
            <img src={welcome} alt="welcome" className='w-10/12 mr-5' />
            <img src={alphacon} alt="alphacon" className='absolute scale-75 -bottom-16 -left-16' style={{ animation: 'spin 10s linear infinite' }} />
          </div>
        </div>

        <div>
          <h1 className='text-4xl font-extrabold w-full px-16 mt-20'>Цэс сонгох</h1>
          <div className='grid grid-cols-3 gap-4 px-16 mt-10'>
            <div className='w-full flex flex-col justify-between relative bg-[#96add6b2] h-56  p-4 rounded-3xl'>
              <div className='w-16 h-16 rounded-full flex justify-center items-center bg-[#2760A6]'>
                <img src={arrowTR} alt="arrowTR" className='scale-75' />
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl'>ЭЕШ</h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
                <img src={yesh} alt="yesh" className='scale-75 absolute -top-2 -right-2' />
            </div>
            <div className='w-full flex flex-col justify-between relative bg-[#F8B8AFb2] h-56  p-4 rounded-3xl'>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl'>SAT</h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
              <div className='w-16 h-16 rounded-full flex justify-center items-center bg-[#E7836F]'>
                <img src={arrowTR} alt="arrowTR" className='scale-75' />
              </div>
                <img src={sat} alt="yesh" className='scale-75 absolute -bottom-2 -right-2' />
            </div>
            <div className='w-full flex flex-col justify-between relative bg-[#C9CFD1b2] h-56  p-4 rounded-3xl'>
              <div className='w-16 h-16 rounded-full flex justify-center items-center bg-[#2760A6]'>
                <img src={arrowTR} alt="arrowTR" className='scale-75' />
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl w-16'>Онолын математик</h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
                <img src={onol} alt="yesh" className='scale-75 absolute -top-2 -right-2' />
            </div>
          </div>
        </div>
        
        <div className='mb-32'>
          <h1 className='text-4xl font-extrabold w-full px-16 mt-20'>Зөвлөгөө</h1>

          <div className='grid grid-cols-3 gap-4 px-16 mt-10'>
            <div className='w-full flex flex-col border-1 border-[#E7836F] border-solid justify-between relative h-96  p-4 rounded-xl'>
              <img src={yesh2} alt="yesh"/>
              <div className='flex flex-row justify-start gap-2 items-center w-full'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>ЭЕШ</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6]'></div>
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl'>ЭЕШ-д хэрэгтэй зааврууд </h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
            </div>
            <div className='w-full flex flex-col justify-between border-1 border-[#E7836F] border-solid h-96  p-4 rounded-xl'>
              <img src={sat2} alt="yesh" className='' />
              <div className='flex flex-row justify-start gap-2 items-center w-full'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#E7836F]'></div>
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl'>Шалгалтын талаар</h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
            </div>
            <div className='w-full flex flex-col justify-between border-1 border-[#E7836F] border-solid h-96  p-4 rounded-xl'>
              <img src={onol2} alt="yesh" className='' />
              <div className='flex flex-row justify-start gap-2 items-center w-full'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center border-1 border-black border-solid'>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#E7836F]'></div>
              </div>
              <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl '>SAT-д туслах стратеги</h1>
                <p className='text-[13px] w-64 '>Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed skdfni oisfnwein</p>
              </div>
            </div>
          </div>
        </div>
        <Footer/>


    </div>
  )
}

export default Home
