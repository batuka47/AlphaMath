import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MaterialChoose from '../components/materialChoose'
import yesh2 from '../assets/icon/yesh2.svg'
import onol2 from '../assets/icon/onol2.svg'
import sat2 from '../assets/icon/sat2.svg'
import Test from '../components/Test'
import { useNavigate } from 'react-router-dom'

function EYSH(){
    const year = []; // Initialize an empty array for years
    for (let i = 2006; i <= 2024; i++) {
        year.push({ id: i - 2006, title: i }); // Push each year as an object with a title property
    }

    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [tasks, setTasks] = useState([
        { id: 1, img: 'path/to/task1.jpg', text: 'Task 1 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 2, img: 'path/to/task2.jpg', text: 'Task 2 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 3, img: 'path/to/task3.jpg', text: 'Task 3 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 4, img: 'path/to/task4.jpg', text: 'Task 4 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 5, img: 'path/to/task5.jpg', text: 'Task 5 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 6, img: 'path/to/task6.jpg', text: 'Task 6 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 7, img: 'path/to/task7.jpg', text: 'Task 7 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
        { id: 8, img: 'path/to/task8.jpg', text: 'Task 8 text', labelA: 'A', labelB: 'B', labelC: 'C', labelD: 'D', labelE: 'E' },
    ])

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
        <h1 className="text-4xl w-full text-center mb-12 mt-6 font-bold">Элсэлтийн Ерөнхий Шалгалт</h1>
        <div className='p-10 flex flex-col gap-10'>

        <h1 className="text-3xl pl-24 font-bold">Он оны ЭЕШ-ийн тестүүд</h1>
        <div className='flex justify-center items-center'>     
            <div className="grid grid-cols-3 gap-6 gap-y-5 w-11/12">
                {
                    year.map((data)=>{
                        return <MaterialChoose year={data.title} key={data.title}/>
                    })
                }
            </div>
        </div>
        </div>
        <div className='mb-32'>
          <h1 className='text-4xl font-extrabold w-full px-24 mt-20'>Зөвлөгөө</h1>

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
export default EYSH