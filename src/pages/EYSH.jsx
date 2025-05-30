import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MaterialChoose from '../components/materialChoose'
import yesh2 from '../assets/icon/yesh2.svg'
import onol2 from '../assets/icon/onol2.svg'
import sat2 from '../assets/icon/sat2.svg'
import Test from '../components/Test'
import { useNavigate, Link } from 'react-router-dom'

function EYSH(){
    const year = []; // Initialize an empty array for years
    for (let i = 2014; i <= 2024; i++) {
        year.push({ id: i - 2006, title: i }); // Push each year as an object with a title property
    }

    const [selectedAnswers, setSelectedAnswers] = useState({})

    const handleAnswerSelect = (id, answer) => {
        setSelectedAnswers({ ...selectedAnswers, [id]: answer })
    }

    const navigate = useNavigate()

    const handleSubmit = () => {
        const year = "2024" // Example year
        const selectedAnswers = { "A": "A", "B": "C", "C": "B" } // Example user answers

        // Navigate to Result page with year and user answers
        navigate(`/EYSH/${year}/Result`, { state: { year, userAnswers: selectedAnswers } })
    }

    return (
       <div>
        <Header/>
        <h1 className="sm:text-4xl text-3xl w-full text-center mb-12 mt-6 font-bold">Элсэлтийн Ерөнхий Шалгалт</h1>
        <div className='sm:p-10 flex flex-col gap-10'>

        <h1 className="sm:text-3xl text-2xl w-full text-center font-bold">Он оны ЭЕШ-ийн тестүүд</h1>
        <div className='flex justify-center items-center'>     
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-6 gap-y-5 w-11/12">
                {
                    year.map((data)=>{
                        return <MaterialChoose year={data.title} key={data.title}/>
                    })
                }
            </div>
        </div>
        </div>
        <div className='mb-32'>
          <h1 className='sm:text-4xl text-2xl font-extrabold w-full sm:px-16 px-6 mt-20'>Зөвлөгөө</h1>
          <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 sm:px-16 px-6 mt-10'>
            
            <Link to="/EYSHadvice" className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative  sm:h-[500px] h-40 p-2 gap-4 sm:p-4 rounded-xl'>
              <img src={yesh2} alt="yesh" className='h-full rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center  items-center absolute border-1 border-black border-solid '>ЭЕШ</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3'>ЭЕШ-д хэрэгтэй зааврууд </h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </Link>

            <Link to="/SATstatistic"className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative sm:h-[500px] h-40 p-2 gap-4 sm:p-4 rounded-xl'>
              <img src={sat2} alt="yesh" className='h-full rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center absolute border-1 border-black border-solid '>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3'>Шалгалтын талаар</h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </Link>
            <Link to="SATstrategy" className='w-full flex sm:flex-col flex-row border-1 border-[#E7836F] border-solid sm:justify-between relative sm:h-[500px] h-40 p-2 gap-4 sm:p-4 rounded-xl'>
              <img src={onol2} alt="yesh" className='h-full rounded-xl'/>
              <div className='flex flex-col gap-2'>
              <div className='flex flex-row justify-start sm:gap-2 sm:items-center w-full pt-7'>
                <h1 className='w-8 h-4 rounded-sm text-[12px] flex justify-center items-center absolute border-1 border-black border-solid '>SAT</h1>
                <div className='w-2 h-2 rounded-full bg-[#2760A6] hidden'></div>
              </div>
                <h1 className='font-bold sm:text-xl text-base sm:pt-5 pt-3'>SAT-д туслах стратеги</h1>
                <p className='sm:text-[13px] text-[11px] sm:w-64  '>Дэлгэрэнгүй үзэх</p>
              </div>
            </Link>
          </div>
        </div>
        
        <Footer/>
       </div>
    )
}
export default EYSH