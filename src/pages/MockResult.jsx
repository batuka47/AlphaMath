import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getDefaultScoring, getPointsForQuestion, getGrade } from '../lib/scoring'
import { getSlots } from '../lib/secondProblem'

function MockResult() {
    const location = useLocation()
    const navigate = useNavigate()

    const { mockTest, userAnswers = {}, secondAnswers = {} } = location.state || {}

    useEffect(() => {
        if (!location.state || !mockTest) navigate('/EYSH')
    }, [location.state, mockTest, navigate])

    if (!mockTest) return null

    const questions  = mockTest.problem || []
    const secondProb = mockTest.second_problem || []
    const totalQ     = questions.length
    const scoring    = getDefaultScoring(totalQ)

    // Section 1 scoring
    let sec1Earned = 0, sec1Possible = 0
    const sec1Rows = questions.map(q => {
        const correct    = q.answer
        const userAnswer = userAnswers[q.id] || ''
        const pts        = getPointsForQuestion(q.id, scoring)
        const earned     = correct && userAnswer === correct ? pts : 0
        sec1Earned   += earned
        sec1Possible += pts
        return { id: q.id, correct, userAnswer, pts, earned }
    })

    // Section 2 scoring
    const sec2PtsEach = 5
    let sec2Earned = 0, sec2Possible = 0
    const sec2Rows = secondProb.map(prob => {
        const slots       = getSlots(prob).filter(s => s.name && s.value !== '')
        const totalSlots  = slots.length
        const correctSlots = slots.filter(
            s => secondAnswers[`${prob.id}-${s.name}`] === String(s.value)
        ).length
        const earned = totalSlots > 0
            ? Math.round((correctSlots / totalSlots) * sec2PtsEach)
            : 0
        sec2Earned   += earned
        sec2Possible += sec2PtsEach
        return { id: prob.id, slots, correctSlots, totalSlots, earned, maxPts: sec2PtsEach }
    })

    const totalEarned   = sec1Earned + sec2Earned
    const totalPossible = sec1Possible + sec2Possible
    const percentage    = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0
    const grade         = getGrade(percentage)

    const correctCount = sec1Rows.filter(r => r.earned > 0).length
    const skippedCount = sec1Rows.filter(r => !r.userAnswer).length
    const wrongCount   = sec1Rows.filter(r => r.userAnswer && r.earned === 0).length

    return (
        <div>
            <Header />
            <div className="flex flex-col justify-center items-center px-4 sm:px-10 py-8 gap-6">

                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-xl sm:text-3xl font-extrabold">Тест амжилттай дууслаа!</h1>
                    <p className="text-base sm:text-xl font-semibold text-gray-600">{mockTest.title}</p>
                </div>

                <div className="flex flex-row gap-5 flex-wrap justify-center">
                    <div className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#E75234]">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#E75234]">{totalEarned}</span>
                        <span className="text-xs sm:text-sm text-gray-500">/ {totalPossible} оноо</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#2760A6]">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#2760A6]">{percentage}%</span>
                        <span className={`text-xs sm:text-sm font-bold ${grade.color}`}>{grade.label}</span>
                    </div>
                </div>

                <div className="flex flex-row gap-10 text-center">
                    <div>
                        <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                        <p className="text-sm text-gray-500">Зөв</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
                        <p className="text-sm text-gray-500">Буруу</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-400">{skippedCount}</p>
                        <p className="text-sm text-gray-500">Хариулаагүй</p>
                    </div>
                </div>

                {/* Section 1 table */}
                <div className="w-full max-w-4xl">
                    <h2 className="text-xl font-extrabold mb-3">
                        Нэгдүгээр хэсэг —{' '}
                        <span className="text-[#E75234]">{sec1Earned}</span>
                        <span className="text-gray-500 text-base"> / {sec1Possible} оноо</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-center text-sm">
                            <thead>
                                <tr className="bg-[#F5DAC6] font-bold">
                                    <th className="border border-gray-300 px-3 py-2">№</th>
                                    <th className="border border-gray-300 px-3 py-2">Зөв</th>
                                    <th className="border border-gray-300 px-3 py-2">Таны</th>
                                    <th className="border border-gray-300 px-3 py-2">Оноо</th>
                                    <th className="border border-gray-300 px-3 py-2">Дүн</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sec1Rows.map(row => (
                                    <tr key={row.id}
                                        className={row.earned > 0 ? 'bg-green-50' : row.userAnswer ? 'bg-red-50' : 'bg-gray-50'}>
                                        <td className="border border-gray-300 px-3 py-1">{row.id}</td>
                                        <td className="border border-gray-300 px-3 py-1 font-bold">
                                            {row.correct || <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1">
                                            {row.userAnswer || <span className="text-gray-400">–</span>}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1 text-gray-500">{row.pts}</td>
                                        <td className="border border-gray-300 px-3 py-1 font-bold">
                                            {row.earned > 0
                                                ? <span className="text-green-600">+{row.earned}</span>
                                                : <span className="text-red-400">0</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2 table */}
                {sec2Rows.length > 0 && (
                    <div className="w-full max-w-4xl">
                        <h2 className="text-xl font-extrabold mb-3">
                            Хоёрдугаар хэсэг —{' '}
                            <span className="text-[#E75234]">{sec2Earned}</span>
                            <span className="text-gray-500 text-base"> / {sec2Possible} оноо</span>
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-center text-sm">
                                <thead>
                                    <tr className="bg-[#F5DAC6] font-bold">
                                        <th className="border border-gray-300 px-3 py-2">Бодлого</th>
                                        <th className="border border-gray-300 px-3 py-2">Хариултууд</th>
                                        <th className="border border-gray-300 px-3 py-2">Оноо</th>
                                        <th className="border border-gray-300 px-3 py-2">Дүн</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sec2Rows.map(row => (
                                        <tr key={row.id}>
                                            <td className="border border-gray-300 px-3 py-2 font-bold">{row.id}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-xs">
                                                <div className="flex flex-row flex-wrap justify-center gap-2">
                                                    {row.slots.map(slot => {
                                                        const correct = slot.value
                                                        const user    = secondAnswers[`${row.id}-${slot.name}`] || ''
                                                        const isRight = user === String(correct)
                                                        return (
                                                            <div key={slot.name}
                                                                className={`flex items-center gap-1 rounded px-2 py-0.5 ${isRight ? 'bg-green-50' : user ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                                <span className="italic text-gray-500">{slot.name}</span>
                                                                <span className={`font-bold ${isRight ? 'text-green-600' : user ? 'text-red-500' : 'text-gray-400'}`}>
                                                                    {user || '–'}
                                                                </span>
                                                                <span className="text-gray-400 text-[10px]">({correct})</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 text-gray-500">{row.maxPts}</td>
                                            <td className="border border-gray-300 px-3 py-2 font-bold">
                                                {row.earned > 0
                                                    ? <span className="text-green-600">+{row.earned}</span>
                                                    : <span className="text-red-400">0</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">* Хаалтан дотор зөв хариулт. Хагас оноо авах боломжтой.</p>
                    </div>
                )}

                <Link to="/EYSH"
                    className="px-8 py-3 bg-[#F5DAC6] rounded-full text-xl font-bold hover:bg-[#e8c8b0] transition-colors">
                    Буцах
                </Link>
            </div>
            <Footer />
        </div>
    )
}

export default MockResult
