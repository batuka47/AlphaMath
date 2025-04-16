import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useEffect } from 'react'

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure with default values
  const { year = "Unknown Year", userAnswers = {} } = location.state || {};

  // Example correct answers and points
  const correctAnswers = ["A", "B", "C"];
  const points = [1, 0, 1];

  // Check if location.state is available
  useEffect(() => {
    if (!location.state) {
      navigate('/EYSH'); // Redirect if no state is found
    }
  }, [location.state, navigate]); // Dependency array includes location.state and navigate

  // Calculate total score
  const totalScore = points.reduce((a, b) => a + b, 0);

  console.log('Year:', year);

  return (
    <div>
        <Header />
        <div className='flex flex-col justify-center items-center'>
          <h1>Тест амжилттай дууслаа!</h1>
          <p>{year} оны А вариант</p>
          <h1>Хариултууд</h1>
          <table className="table-auto">
            <thead>
              <tr>
                <th>Зөв хариулт</th>
                <th>Таны хариулт</th>
                <th>Оноо</th>
              </tr>
            </thead>
            <tbody>
              {correctAnswers.map((correct, index) => (
                <tr key={index}>
                  <td>{correct}</td>
                  <td>{userAnswers[correct] || "N/A"}</td>
                  <td>{points[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Нийт авсан оноо: {totalScore} =&#8827; 800</p>
          <button>Гарах</button>
        </div>
        <Footer/>
    </div>
  )
}

export default Result
