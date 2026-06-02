import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTasks } from '../lib/TaskContext'
import { supabase } from '../lib/supabase'

// ── Scoring helpers ───────────────────────────────────────────────────────────

// Default scoring when task has no scoring field
function getDefaultScoring(totalQ) {
    if (totalQ >= 36) {
        return {
            section1: [
                { from: 1,  to: 8,  points: 1 },
                { from: 9,  to: 28, points: 2 },
                { from: 29, to: 36, points: 3 },
            ],
            section2Points: 5,
        }
    }
    // Older years without explicit scoring: treat all as 3pt
    return {
        section1: [{ from: 1, to: totalQ, points: 3 }],
        section2Points: 5,
    }
}

function getPointsForQuestion(questionId, scoring) {
    const id = parseInt(questionId)
    for (const range of scoring.section1) {
        if (id >= range.from && id <= range.to) return range.points
    }
    return 1
}

// Performance grade
function getGrade(pct) {
    if (pct >= 90) return { label: 'Онцлог',    color: 'text-purple-600' }
    if (pct >= 75) return { label: 'Сайн',       color: 'text-green-600'  }
    if (pct >= 55) return { label: 'Дунд',       color: 'text-yellow-600' }
    if (pct >= 40) return { label: 'Хангалттай', color: 'text-orange-500' }
    return              { label: 'Хангалтгүй',  color: 'text-red-500'    }
}

// ─────────────────────────────────────────────────────────────────────────────
function Result() {
    const location = useLocation()
    const navigate = useNavigate()

    const {
        year          = '',
        userAnswers   = {},
        secondAnswers = {},
        scoring:      passedScoring,
    } = location.state || {}

    // Compute task first — must be before any useEffect that references it
    const [yearPart, variant] = (year || '').split('-')
    const yearIndex = parseInt(yearPart) - 2006
    const taskData  = useTasks()
    const task      = taskData.find(
        t => parseInt(t.id) === yearIndex && t.variant === variant
    )

    useEffect(() => {
        if (!location.state) navigate('/EYSH')
    }, [location.state, navigate])

    // Save result to Supabase once on mount (only when coming from a completed test)
    useEffect(() => {
        if (!location.state || !task) return
        const save = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const qs = task.problem || []
            const sc = passedScoring || task.scoring || getDefaultScoring(qs.length)
            let earned = 0, possible = 0
            qs.forEach(q => {
                const pts = getPointsForQuestion(q.id, sc)
                possible += pts
                if (userAnswers[q.id] === q.answer) earned += pts
            })
            const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0
            const [yp, v] = (year || '').split('-')

            await supabase.from('test_results').insert({
                user_id:        user.id,
                year:           parseInt(yp),
                variant:        v,
                score:          earned,
                total_possible: possible,
                percentage:     pct,
                answers:        userAnswers,
                second_answers: secondAnswers,
            })
        }
        save()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!task) {
        return (
            <div>
                <Header />
                <div className="flex flex-col justify-center items-center min-h-screen gap-4">
                    <p>Тестийн мэдээлэл олдсонгүй.</p>
                    <Link to="/EYSH" className="px-6 py-2 bg-[#F5DAC6] rounded-full font-bold">Буцах</Link>
                </div>
                <Footer />
            </div>
        )
    }

    const questions  = task.problem    || []
    const secondProb = task.secondProblem || []
    const totalQ     = questions.length
    const scoring    = passedScoring || task.scoring || getDefaultScoring(totalQ)

    // ── Section 1 scoring ─────────────────────────────────────────────────────
    let sec1Earned   = 0
    let sec1Possible = 0

    const sec1Rows = questions.map(q => {
        const correct    = q.answer
        const userAnswer = userAnswers[q.id] || ''
        const pts        = getPointsForQuestion(q.id, scoring)
        const earned     = correct && userAnswer === correct ? pts : 0
        sec1Earned   += earned
        sec1Possible += pts
        return { id: q.id, correct, userAnswer, pts, earned }
    })

    // ── Section 2 scoring ─────────────────────────────────────────────────────
    const sec2PtsEach = scoring.section2Points || 5
    let sec2Earned    = 0
    let sec2Possible  = 0

    const LETTERS = ['a','b','c','d','e','f','g','h']

    const sec2Rows = secondProb.map(prob => {
        const slots       = LETTERS.filter(l => prob[l] !== undefined && prob[l] !== '')
        const totalSlots  = slots.length
        const correctSlots = slots.filter(
            l => prob[l] && secondAnswers[`${prob.id}-${l}`] === String(prob[l])
        ).length
        const earned = totalSlots > 0
            ? Math.round((correctSlots / totalSlots) * sec2PtsEach)
            : 0

        sec2Earned   += earned
        sec2Possible += sec2PtsEach

        return { id: prob.id, slots, prob, correctSlots, totalSlots, earned, maxPts: sec2PtsEach }
    })

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalEarned   = sec1Earned + sec2Earned
    const totalPossible = sec1Possible + sec2Possible
    const percentage    = totalPossible > 0
        ? Math.round((totalEarned / totalPossible) * 100)
        : 0
    const grade = getGrade(percentage)

    const correctCount = sec1Rows.filter(r => r.earned > 0).length
    const skippedCount = sec1Rows.filter(r => !r.userAnswer).length
    const wrongCount   = sec1Rows.filter(r => r.userAnswer && r.earned === 0).length

    return (
        <div>
            <Header />
            <div className="flex flex-col justify-center items-center px-4 sm:px-10 py-8 gap-6">

                {/* Title */}
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-xl sm:text-3xl font-extrabold">Тест амжилттай дууслаа!</h1>
                    <p className="text-base sm:text-xl font-semibold text-gray-600">
                        {yearPart} оны {variant} хувилбар — ЭЕШ Математик
                    </p>
                </div>

                {/* Score circles */}
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

                {/* Quick stats */}
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

                {/* ── Section 1 table ── */}
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
                                        className={
                                            row.earned > 0  ? 'bg-green-50' :
                                            row.userAnswer  ? 'bg-red-50'   :
                                                              'bg-gray-50'
                                        }>
                                        <td className="border border-gray-300 px-3 py-1">{row.id}</td>
                                        <td className="border border-gray-300 px-3 py-1 font-bold">
                                            {row.correct || <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1">
                                            {row.userAnswer ||
                                                <span className="text-gray-400">–</span>}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-1 text-gray-500">
                                            {row.pts}
                                        </td>
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

                {/* ── Section 2 table (only shown if secondProblem exists) ── */}
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
                                        {LETTERS.map(l => (
                                            <th key={l} className="border border-gray-300 px-2 py-2 italic">
                                                {l}
                                            </th>
                                        ))}
                                        <th className="border border-gray-300 px-3 py-2">Оноо</th>
                                        <th className="border border-gray-300 px-3 py-2">Дүн</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sec2Rows.map(row => (
                                        <tr key={row.id}>
                                            <td className="border border-gray-300 px-3 py-2 font-bold">
                                                {row.id}
                                            </td>
                                            {LETTERS.map(l => {
                                                const correct  = row.prob[l]
                                                const user     = secondAnswers[`${row.id}-${l}`] || ''
                                                const hasSlot  = row.slots.includes(l)
                                                const isRight  = hasSlot && correct && user === String(correct)
                                                const isWrong  = hasSlot && user && !isRight
                                                return (
                                                    <td key={l}
                                                        className={`border border-gray-300 px-2 py-2 text-xs
                                                            ${isRight ? 'bg-green-50' : isWrong ? 'bg-red-50' : ''}`}
                                                    >
                                                        {hasSlot ? (
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className={`font-bold ${isRight ? 'text-green-600' : isWrong ? 'text-red-500' : 'text-gray-400'}`}>
                                                                    {user || '–'}
                                                                </span>
                                                                <span className="text-gray-400 text-[10px]">
                                                                    ({correct})
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-200">—</span>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            <td className="border border-gray-300 px-3 py-2 text-gray-500">
                                                {row.maxPts}
                                            </td>
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
                        <p className="text-xs text-gray-400 mt-2">
                            * Хаалтан дотор зөв хариулт. Хагас оноо авах боломжтой.
                        </p>
                    </div>
                )}

                <Link
                    to="/EYSH"
                    className="px-8 py-3 bg-[#F5DAC6] rounded-full text-xl font-bold hover:bg-[#e8c8b0] transition-colors"
                >
                    Буцах
                </Link>
            </div>
            <Footer />
        </div>
    )
}

export default Result