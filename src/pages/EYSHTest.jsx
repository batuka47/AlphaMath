import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTasks } from '../lib/TaskContext'
import Test from '../components/Test'
import back from '../assets/icon/pointDown.svg'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { getDefaultScoring, getTotalPossibleScore } from '../lib/scoring'
import { renderLatex } from '../lib/renderMath'

// ── Section structure by total question count ─────────────────────────────────
function getSections(totalQ) {
    if (totalQ >= 36) {
        return [
            { label: 'Бодлого 1-ээс 8',          from: 0,  to: 8  },
            { label: 'Бодлого 9-өөс 28',          from: 8,  to: 28 },
            { label: 'Бодлого 29-өөс 36',         from: 28, to: 36 },
        ]
    }
    return [
        { label: `Бодлого 1-ээс ${totalQ}`, from: 0, to: totalQ },
    ]
}

// ── Second-section question component ────────────────────────────────────────
// Renders the open-ended (нөхөх тест) problems.
// The `problem` string may contain [a], [b][c] etc. — these become input boxes.
function SecondSectionQuestion({ problem, answers, onAnswerChange }) {
    const slots = ['a','b','c','d','e','f','g','h'].filter(
        l => problem[l] !== undefined
    )

    // Replace [a], [b], [c] etc. in the problem text with input boxes
    const renderWithInputs = (text) => {
        if (!text) return null
        const parts = text.split(/(\[[a-h]\])/g)
        return parts.map((part, i) => {
            const match = part.match(/^\[([a-h])\]$/)
            if (match) {
                const letter = match[1]
                const key = `${problem.id}-${letter}`
                return (
                    <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="inline-block w-10 h-8 border-b-2 border-gray-600 text-center text-lg font-bold focus:border-blue-500 focus:outline-none bg-blue-50 rounded mx-0.5 align-middle"
                        value={answers?.[key] || ''}
                        onChange={e => onAnswerChange(key, e.target.value)}
                        placeholder={letter}
                    />
                )
            }
            return <span key={i}>{renderLatex(part)}</span>
        })
    }

    return (
        <div className="mb-10 border-t pt-6">
            <h3 className="font-bold text-xl mb-3 text-[#2760A6]">{problem.id}</h3>
            {problem.text && (
                <p className="font-semibold text-base mb-4 leading-relaxed">
                    {renderWithInputs(problem.text)}
                </p>
            )}
            {problem.problem && (
                <div className="bg-gray-50 rounded-xl p-4 text-base leading-loose font-mono whitespace-pre-wrap">
                    {renderWithInputs(problem.problem)}
                </div>
            )}
            {/* Summary of all answer slots at the bottom */}
            {slots.length > 0 && (
                <div className="flex flex-row flex-wrap gap-3 mt-5">
                    {slots.map(letter => {
                        const key = `${problem.id}-${letter}`
                        return (
                            <div key={letter} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1">
                                <span className="font-bold text-base italic text-gray-600">{letter}</span>
                                <span className="text-gray-400">=</span>
                                <input
                                    type="text"
                                    maxLength={1}
                                    className="w-10 h-8 border-b-2 border-gray-400 text-center text-lg font-bold focus:border-blue-500 focus:outline-none bg-transparent"
                                    value={answers?.[key] || ''}
                                    onChange={e => onAnswerChange(key, e.target.value)}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

SecondSectionQuestion.propTypes = {
    problem:        PropTypes.shape({
        id:      PropTypes.string.isRequired,
        text:    PropTypes.string,
        problem: PropTypes.string,
    }).isRequired,
    answers:        PropTypes.object,
    onAnswerChange: PropTypes.func.isRequired,
}
SecondSectionQuestion.defaultProps = { answers: {} }

// ── Confirmation modal ────────────────────────────────────────────────────────
function ConfirmModal({ answeredCount, totalQ, onConfirm, onCancel }) {
    const unanswered = totalQ - answeredCount
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
                <h2 className="text-xl font-extrabold text-center">Тестийг дуусгах уу?</h2>
                {unanswered > 0 ? (
                    <p className="text-center text-gray-600">
                        Та <span className="font-bold text-red-500">{unanswered}</span> асуултад
                        хариулаагүй байна. Хариулаагүй асуулт тэг оноо авна.
                    </p>
                ) : (
                    <p className="text-center text-green-600 font-bold">
                        Бүх {totalQ} асуултад хариуллаа ✓
                    </p>
                )}
                <div className="flex gap-4 mt-2">
                    <button
                        className="px-6 py-2 rounded-full bg-gray-200 font-bold hover:bg-gray-300"
                        onClick={onCancel}
                    >Буцах</button>
                    <button
                        className="px-6 py-2 rounded-full bg-[#E75234] text-white font-bold hover:bg-[#c94220]"
                        onClick={onConfirm}
                    >Дуусгах</button>
                </div>
            </div>
        </div>
    )
}

ConfirmModal.propTypes = {
    answeredCount: PropTypes.number.isRequired,
    totalQ:        PropTypes.number.isRequired,
    onConfirm:     PropTypes.func.isRequired,
    onCancel:      PropTypes.func.isRequired,
}

// ── Main page ─────────────────────────────────────────────────────────────────
function EYSHTest() {
    const { year }           = useParams()
    const [yearPart, variant] = year.split('-')
    const yearIndex           = parseInt(yearPart) - 2006
    const taskData            = useTasks()
    const navigate            = useNavigate()
    const { user }            = useAuth()

    const sessionKey = `alphamath_test_${year}`

    const [selectedAnswers,   setSelectedAnswers]   = useState({})
    const [secondAnswers,     setSecondAnswers]     = useState({})
    const [showConfirm,       setShowConfirm]       = useState(false)
    const [bookmarkedIds,     setBookmarkedIds]     = useState(new Set())
    const [resumeData,        setResumeData]        = useState(null) // saved session to offer

    // On mount: check for a saved session
    useEffect(() => {
        try {
            const raw = localStorage.getItem(sessionKey)
            if (!raw) return
            const saved = JSON.parse(raw)
            if (saved && Object.keys(saved.selectedAnswers || {}).length > 0)
                setResumeData(saved)
        } catch { /* corrupt data — ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Auto-save answers to localStorage on every change
    useEffect(() => {
        if (Object.keys(selectedAnswers).length === 0 && Object.keys(secondAnswers).length === 0) return
        localStorage.setItem(sessionKey, JSON.stringify({ selectedAnswers, secondAnswers, savedAt: Date.now() }))
    }, [selectedAnswers, secondAnswers, sessionKey])

    const handleResume = () => {
        setSelectedAnswers(resumeData.selectedAnswers || {})
        setSecondAnswers(resumeData.secondAnswers || {})
        setResumeData(null)
    }

    const handleStartFresh = () => {
        localStorage.removeItem(sessionKey)
        setResumeData(null)
    }

    // Load existing bookmarks for this year+variant
    useEffect(() => {
        if (!user) return
        supabase
            .from('bookmarks')
            .select('question_id')
            .eq('user_id', user.id)
            .eq('year', parseInt(yearPart))
            .eq('variant', variant)
            .then(({ data }) => {
                if (data) setBookmarkedIds(new Set(data.map(b => b.question_id)))
            })
    }, [user, yearPart, variant])

    const handleBookmark = async (questionId, questionText) => {
        if (!user) return
        const isBookmarked = bookmarkedIds.has(questionId)
        if (isBookmarked) {
            setBookmarkedIds(prev => { const s = new Set(prev); s.delete(questionId); return s })
            await supabase.from('bookmarks').delete()
                .eq('user_id', user.id)
                .eq('year', parseInt(yearPart))
                .eq('variant', variant)
                .eq('question_id', questionId)
        } else {
            setBookmarkedIds(prev => new Set([...prev, questionId]))
            const plainText = typeof questionText === 'string'
                ? questionText.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                : ''
            await supabase.from('bookmarks').insert({
                user_id:       user.id,
                year:          parseInt(yearPart),
                variant,
                question_id:   questionId,
                question_text: plainText,
            })
        }
    }

    const task = taskData.find(
        t => parseInt(t.id) === yearIndex && t.variant === variant
    )

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-xl">Тест олдсонгүй: {year}</p>
                <Link to="/EYSH" className="px-6 py-2 bg-[#F5DAC6] rounded-full font-bold">Буцах</Link>
            </div>
        )
    }

    const tasks      = task.problem || []
    const secondProb = task.secondProblem || []
    const totalQ     = tasks.length
    const sections   = getSections(totalQ)
    const scoring    = task.scoring || getDefaultScoring(totalQ)
    const totalScore = getTotalPossibleScore(tasks, scoring)
    const answeredCount = Object.keys(selectedAnswers).length

    const handleAnswerSelect = (questionId, answer) =>
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }))

    const handleSecondAnswer = (key, value) =>
        setSecondAnswers(prev => ({ ...prev, [key]: value }))

    const handleSubmitConfirmed = () => {
        localStorage.removeItem(sessionKey)
        setShowConfirm(false)
        navigate(`/EYSH/${year}/Result`, {
            state: {
                year,
                userAnswers:   selectedAnswers,
                secondAnswers,
                scoring:       task.scoring
            }
        })
    }

    // Section 1 description — dynamic by year
    const sectionOneNote = totalQ >= 36
        ? `Нэгдүгээр хэсгийн ${totalQ} сонгох даалгавар нь нийт ${totalScore} оноотой. Даалгавар тус бүр 5 сонгох хариулттай. Тэдгээрийн зөвхөн нэг зөв хариултыг сонгож, хариултын хуудсанд будаж тэмдэглээрэй. Зураг бодит хэмжээгээр өгөгдөөгүй гэдгийг санаарай.`
        : `Нэгдүгээр хэсгийн ${totalQ} сонгох даалгавар байна. Даалгавар тус бүр 5 сонгох хариулттай. Тэдгээрийн зөвхөн нэг зөв хариултыг сонгож тэмдэглээрэй.`

    // Helper: render Test component
    const renderTest = (t) => (
        <Test
            key={t.id}
            id={t.id}
            img={t.img}
            text={t.text}
            labelA={t.labelA}
            labelB={t.labelB}
            labelC={t.labelC}
            labelD={t.labelD}
            labelE={t.labelE}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={selectedAnswers[t.id]}
            isBookmarked={bookmarkedIds.has(t.id)}
            onBookmark={user ? handleBookmark : null}
        />
    )

    const pct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0

    return (
        <div>
            <Header />

            {/* ── Sticky progress bar ── */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 lg:px-20 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">{answeredCount}/{totalQ}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
                        <div
                            className="bg-[#E75234] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-[#E75234] flex-shrink-0">{pct}%</span>
                </div>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-shrink-0 px-4 py-1.5 bg-[#E75234] text-white text-xs font-bold rounded-full hover:bg-[#c94220] transition-colors"
                >
                    Дуусгах
                </button>
            </div>

            {showConfirm && (
                <ConfirmModal
                    answeredCount={answeredCount}
                    totalQ={totalQ}
                    onConfirm={handleSubmitConfirmed}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {/* ── Resume banner ── */}
            {resumeData && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center gap-4 max-w-lg w-[90%]">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-sm">Өмнөх хэсгийг үргэлжлүүлэх үү?</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {Object.keys(resumeData.selectedAnswers || {}).length} асуултын хариулт хадгалагдсан байна
                            {resumeData.savedAt ? ` · ${new Date(resumeData.savedAt).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleStartFresh}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold hover:bg-gray-200 transition-colors">
                            Дахин эхлэх
                        </button>
                        <button onClick={handleResume}
                            className="px-4 py-2 rounded-xl bg-[#E75234] text-white text-sm font-bold hover:bg-[#c94220] transition-colors">
                            Үргэлжлүүлэх
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col px-4 sm:px-8 lg:px-20 mt-8">

                {/* ── Header ── */}
                <div className="w-full flex flex-col items-center">
                    {/* Back link + title row */}
                    <div className="border-b-4 border-black w-full flex flex-row items-center justify-between mb-4">
                        <Link to="/EYSH" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors py-1">
                            <img src={back} alt="back" className="rotate-90 w-5 h-5" />
                            <span className="text-xs hidden sm:inline">Буцах</span>
                        </Link>
                        <h1 className="font-bold text-base sm:text-2xl">Хувилбар {year}</h1>
                        <h1 className="font-bold text-base sm:text-2xl">Математик</h1>
                    </div>

                    <h1 className="font-bold text-sm sm:text-2xl mt-2 text-center">
                        Нэгдүгээр хэсэг. СОНГОХ ДААЛГАВАР
                    </h1>
                    <p className="font-semibold text-xs sm:text-base text-center max-w-3xl mt-2 leading-relaxed text-gray-700">
                        <span className="text-red-600">Санамж:</span> {sectionOneNote}
                    </p>
                </div>

                {/* ── Section 1: Multiple choice — dynamic sections ── */}
                {sections.map(sec => (
                    <div key={sec.label}>
                        <h2 className="font-bold text-base sm:text-xl mt-6 mb-1 text-[#2760A6]">{sec.label}</h2>
                        {tasks.slice(sec.from, sec.to).map(renderTest)}
                    </div>
                ))}

                {/* ── Section 2: Open-ended (Хоёрдугаар хэсэг) ── */}
                {secondProb.length > 0 && (
                    <div className="mt-16">
                        <div className="border-b-4 border-black w-full mb-6" />
                        <h1 className="font-bold text-2xl text-center mb-2">
                            Хоёрдугаар хэсэг. НӨХӨХ ТЕСТ ({secondProb.length} бодлого)
                        </h1>
                        <p className="font-semibold text-lg text-center mb-8 text-gray-700">
                            <span className="text-red-600">Санамж:</span> Хоёрдугаар хэсгийн бодлогуудын
                            хариултыг хариултын хуудасны 2-р хэсгийг бөглөх заавартай сайтар
                            танилцаарай.
                        </p>
                        {secondProb.map(prob => (
                            <SecondSectionQuestion
                                key={prob.id}
                                problem={prob}
                                answers={secondAnswers}
                                onAnswerChange={handleSecondAnswer}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-10 mb-20" />
            </div>

            <Footer />
        </div>
    )
}

export default EYSHTest