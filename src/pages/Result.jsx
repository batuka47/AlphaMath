import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect } from 'react'
import Task from '../datas/Task'

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { year } = useParams();
  const [yearPart, variant] = year.split('-');
  const yearIndex = parseInt(yearPart) - 2006;

  // Get task data
  const taskData = Task();
  const sortedTasks = taskData.sort((a, b) => {
    if (a.variant < b.variant) return -1;
    if (a.variant > b.variant) return 1;
    return 0;
  });

  const task = sortedTasks.find(t => parseInt(t.id) === yearIndex && t.variant === variant);

  // Destructure with default values
  const { userAnswers, totalScore } = location.state || {};

  // Check if location.state is available
  useEffect(() => {
    if (!location.state) {
      navigate('/EYSH'); // Redirect if no state is found
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className='px-4 py-8 flex justify-center'>
        <div className='bg-white shadow-md rounded-lg overflow-hidden max-w-[600px] w-full'>
          <div className='bg-[#F5DAC6] p-6 text-center'>
            <h1 className='text-3xl font-bold text-gray-800'>Тест амжилттай дууслаа!</h1>
            <p className='text-xl text-gray-600 mt-2'>{year} оны {variant} вариант</p>
          </div>
          
          <div className='p-2 sm:p-6'>
            <div className="overflow-x-auto flex justify-center">
              <table className="w-full border-collapse min-w-[280px] max-w-[500px] text-sm sm:text-base">
                <thead className='bg-gray-200'>
                  <tr>
                    <th className="border p-1 sm:p-2 text-left w-[15%]">Даалгавар</th>
                    <th className="border p-1 sm:p-2 text-left w-[35%]">Зөв хариулт</th>
                    <th className="border p-1 sm:p-2 text-left w-[35%]">Таны хариулт</th>
                    <th className="border p-1 sm:p-2 text-left w-[15%]">Оноо</th>
                  </tr>
                </thead>
                <tbody>
                  {task && task.problem.map((problem) => {
                    let points = 0;
                    const numId = parseInt(problem.id);
                    const userAnswer = userAnswers[problem.id] || '';
                    
                    if (userAnswer === problem.answer) {
                      if (numId >= 1 && numId <= 8) {
                        points = 1;
                      } else if (numId >= 9 && numId <= 27) {
                        points = 2;
                      } else if (numId >= 28 && numId <= 36) {
                        points = 3;
                      }
                    }
                    
                    return (
                      <tr key={problem.id} className={`${points > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <td className="border p-1 sm:p-2">{problem.id}</td>
                        <td className="border p-1 sm:p-2">{problem.answer}</td>
                        <td className="border p-1 sm:p-2">{userAnswer || <span className="text-gray-500">Хариулаагүй</span>}</td>
                        <td className="border p-1 sm:p-2">{points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className='mt-6 text-center'>
              <p className='text-2xl font-bold text-gray-800'>
                Нийт авсан оноо: <span className='text-green-600'>{totalScore}</span> / 72
              </p>
            </div>
          </div>
          
          <div className='bg-gray-100 p-6 text-center'>
            <button 
              onClick={() => navigate('/EYSH')} 
              className='px-8 py-3 bg-[#F5DAC6] text-gray-800 rounded-full hover:bg-[#E5C0A6] transition duration-300'
            >
              Буцах
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default Result
