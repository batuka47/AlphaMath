import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Task from '../datas/Task';
import Test from '../components/Test';
import back from '../assets/icon/pointdOWN.svg';
import Result from '../pages/Result';

const calculateScore = (selectedAnswers, year) => {
    // Get the current task based on the year and variant
    const taskData = Task();
    const [yearPart, variant] = year.split('-');
    const yearIndex = parseInt(yearPart) - 2006;

    // Sort and find the specific task
    const sortedTasks = taskData.sort((a, b) => {
        if (a.variant < b.variant) return -1;
        if (a.variant > b.variant) return 1;
        return 0;
    });

    const task = sortedTasks.find(t => parseInt(t.id) === yearIndex && t.variant === variant);

    if (!task) {
        console.error('Task not found');
        return 0;
    }

    // Create a map of correct answers
    const correctAnswers = {};
    task.problem.forEach(problem => {
        correctAnswers[problem.id] = problem.answer;
    });

    // Calculate score with different point values
    let score = 0;
    Object.keys(selectedAnswers).forEach(questionId => {
        const numId = parseInt(questionId);
        if (selectedAnswers[questionId] === correctAnswers[questionId]) {
            if (numId >= 1 && numId <= 8) {
                score += 1; // First 8 problems: 1 point each
            } else if (numId >= 9 && numId <= 27) {
                score += 2; // Problems 9-27: 2 points each
            } else if (numId >= 28 && numId <= 36) {
                score += 3; // Problems 28-36: 3 points each
            }
        }
    });

    return score;
};

function EYSHTest() {
    const { year } = useParams();
    const [yearPart, variant] = year.split('-'); // Split the year and variant
    const yearIndex = parseInt(yearPart) - 2006;
    const taskData = Task();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const navigate = useNavigate();

    // Sort the tasks by variant
    const sortedTasks = taskData.sort((a, b) => {
        if (a.variant < b.variant) return -1;
        if (a.variant > b.variant) return 1;
        return 0;
    });

    // Find the task with the matching id and variant
    const task = sortedTasks.find(t => parseInt(t.id) === yearIndex && t.variant === variant);

    if (!task) {
        return <div>Error: Task not found for the specified year and variant.</div>;
    }

    const tasks = task.problem;

    const handleAnswerSelect = (questionId, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = () => {
        // Calculate total score based on selectedAnswers
        const totalScore = calculateScore(selectedAnswers, year);
        console.log(totalScore)

        // Navigate to Result page with year and user answers
        navigate(`/EYSH/${year}/Result`, { state: { year, userAnswers: selectedAnswers, totalScore } });
    };
    //  console.log(totalScore)
    return (
        <div>
            <Header />

            <div className="w-full flex flex-col sm:px-20 px-9 mt-12">
                <div className="w-full flex flex-col items-center relative">
                    <div className="border-b-4 border-black w-full flex flex-row justify-between">
                        <h1 className="font-bold text-2xl">Хувилбар {year}</h1>
                        <h1 className="font-bold text-2xl">Математик</h1>
                    </div>
                    <h1 className="font-extrabold sm:text-2xl text-xl mt-8">Нэгдүгээр хэсэг. СОНГОХ ДААЛГАВАР</h1>
                    <p className="font-semibold sm:text-xl ">
                        <span className="text-red-600">Санамж:</span> Нэгдүгээр хэсгийн 36 сонгох даалгавар нь нийт 72 оноотой. 
                        <br /> Даалгавар тус бүр 5 сонгох хариулттай. Тэдгээрийн зөвхөн нэг зөв хариултыг сонгож, хариултын 
                         хуудсанд будаж тэмдэглээрэй. Зураг бодит хэмжээгээр өгөгдөөгүй гэдгийг санаарай.
                    </p>
                    <Link to="/EYSH">
                        <div className='absolute sm:top-28 top-2 sm:-left-12 -left-9'>
                            <img src={back} alt="back" className='rotate-90 sm:scale-75 scale-50' />
                        </div>
                    </Link>
                </div>
                <h2 className="font-bold text-xl sm:mt-8 mt-4">Бодлого 1-ээс 8</h2>
                {tasks.slice(0, 8).map(task => (
                    <Test 
                        key={task.id} 
                        id={task.id} 
                        img={task.img} 
                        text={task.text} 
                        labelA={task.labelA} 
                        labelB={task.labelB} 
                        labelC={task.labelC} 
                        labelD={task.labelD} 
                        labelE={task.labelE}
                        onAnswerSelect={handleAnswerSelect}
                        selectedAnswer={selectedAnswers[task.id]}
                    />
                ))}
                <h2 className="font-bold text-xl sm:mt-8 mt-4">Бодлого 9-өөс 28</h2>
                {tasks.slice(8, 28).map(task => (
                    <Test 
                        key={task.id} 
                        id={task.id} 
                        img={task.img} 
                        text={task.text} 
                        labelA={task.labelA} 
                        labelB={task.labelB} 
                        labelC={task.labelC} 
                        labelD={task.labelD} 
                        labelE={task.labelE}
                        onAnswerSelect={handleAnswerSelect}
                        selectedAnswer={selectedAnswers[task.id]}
                    />
                ))}
                <h2 className="font-bold text-xl sm:mt-8 mt-4">Бодлого 29-өөс 36</h2>
                {tasks.slice(28, 36).map(task => (
                    <Test 
                        key={task.id} 
                        id={task.id} 
                        img={task.img} 
                        text={task.text} 
                        labelA={task.labelA} 
                        labelB={task.labelB} 
                        labelC={task.labelC} 
                        labelD={task.labelD} 
                        labelE={task.labelE}
                        onAnswerSelect={handleAnswerSelect}
                        selectedAnswer={selectedAnswers[task.id]}
                    />
                ))}
            </div>
            <div className="w-full flex flex-col items-center relative">
            {/* <h1 className="font-bold sm:text-2xl text-xl mt-8 ">Нэгдүгээр хэсэг. СОНГОХ ДААЛГАВАР</h1>
            <p className="font-semibold sm:text-xl text-base sm:px-20 px-9 mb-10">
                <span className="text-red-600">Санамж:</span> Даалгавруудын хариултыг бөглөхдөө хариултын хуудасны 2-р хэсгийг бөглөх
                <br /> заавартай сайтар танилцаарай. Зургийг бодит хэмжээгээр өгөөгүй гэдгийг санаарай.
            </p> */}
            <div>
                
            </div>
            {/* <Link to={`/EYSH/${year}/Result`}> */}
                <button 
                    className='w-32 h-10 bg-[#F5DAC6] mt-10 rounded-full text-xl font-bold mb-20'
                    onClick={handleSubmit}
                    >
                    submit
                </button>
            {/* </Link> */}
            </div>
            <Footer />
        </div>
    );
}

export default EYSHTest;
