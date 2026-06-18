import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Test from '../components/Test'
import back from '../assets/icon/pointDown.svg'
import { supabase } from '../lib/supabase'
import { renderLatex } from '../lib/renderMath'
import { getSlots, slotPlaceholderRegex } from '../lib/secondProblem'

function SecondSectionQuestion({ problem, answers, onAnswerChange }) {
    const slots = getSlots(problem)
    const names = slots.map(s => s.name)
    const placeholderRe = slotPlaceholderRegex(names)

    const renderWithInputs = (text) => {
        if (!text) return null
        if (!placeholderRe) return <span>{renderLatex(text)}</span>
        const parts = text.split(placeholderRe)
        return parts.map((part, i) => {
            const match = part.match(/^\[(.+)\]$/)
            if (match && names.includes(match[1])) {
                const name = match[1]
                const key  = `${problem.id}-${name}`
                return (
                    <input key={i} type="text"
                        className="inline-block min-w-10 h-8 border-b-2 border-gray-600 text-center text-lg font-bold focus:border-blue-500 focus:outline-none bg-blue-50 rounded mx-0.5 align-middle px-1"
                        value={answers?.[key] || ''}
                        onChange={e => onAnswerChange(key, e.target.value)}
                        placeholder={name}
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
            {problem.img && (
                <img src={problem.img} alt=""
                    className="max-w-xl w-full h-auto object-contain rounded-lg border border-gray-200 cursor-zoom-in my-4"
                    onClick={() => window.open(problem.img, '_blank')}
                />
            )}
            {slots.length > 0 && (
                <div className="flex flex-row flex-wrap gap-3 mt-5">
                    {slots.map(slot => {
                        const key = `${problem.id}-${slot.name}`
                        return (
                            <div key={slot.name} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1">
                                <span className="font-bold text-base italic text-gray-600">{slot.name}</span>
                                <span className="text-gray-400">=</span>
                                <input type="text"
                                    className="min-w-10 h-8 border-b-2 border-gray-400 text-center text-lg font-bold focus:border-blue-500 focus:outline-none bg-transparent px-1"
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
    problem:        PropTypes.object.isRequired,
    answers:        PropTypes.object,
    onAnswerChange: PropTypes.func.isRequired,
}
SecondSectionQuestion.defaultProps = { answers: {} }

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
                    <button className="px-6 py-2 rounded-full bg-gray-200 font-bold hover:bg-gray-300" onClick={onCancel}>Буцах</button>
                    <button className="px-6 py-2 rounded-full bg-[#E75234] text-white font-bold hover:bg-[#c94220]" onClick={onConfirm}>Дуусгах</button>
                </div>
            </div>
        </div>
    )
}

function MockTest() {
    const { id }     = useParams()
    const navigate   = useNavigate()

    const [mockTest,         setMockTest]         = useState(null)
    const [loading,          setLoading]          = useState(true)
    const [selectedAnswers,  setSelectedAnswers]  = useState({})
    const [secondAnswers,    setSecondAnswers]    = useState({})
    const [showConfirm,      setShowConfirm]      = useState(false)
    const [resumeData,       setResumeData]       = useState(null)

    const sessionKey = `alphamath_mock_${id}`

    useEffect(() => {
        supabase.from('mock_tests').select('*').eq('id', id).single()
            .then(({ data, error }) => {
                if (!error && data) setMockTest(data)
                setLoading(false)
            })
    }, [id])

    useEffect(() => {
        try {
            const raw = localStorage.getItem(sessionKey)
            if (!raw) return
            const saved = JSON.parse(raw)
            if (saved && Object.keys(saved.selectedAnswers || {}).length > 0)
                setResumeData(saved)
        } catch { /* ignore corrupt data */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (Object.keys(selectedAnswers).length === 0 && Object.keys(secondAnswers).length === 0) return
        localStorage.setItem(sessionKey, JSON.stringify({ selectedAnswers, secondAnswers, savedAt: Date.now() }))
    }, [selectedAnswers, secondAnswers, sessionKey])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Ачааллаж байна…</p>
            </div>
        )
    }

    if (!mockTest) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-xl">Тест олдсонгүй</p>
                <Link to="/EYSH" className="px-6 py-2 bg-[#F5DAC6] rounded-full font-bold">Буцах</Link>
            </div>
        )
    }

    const tasks      = mockTest.problem || []
    const secondProb = mockTest.second_problem || []
    const totalQ     = tasks.length
    const answeredCount = Object.keys(selectedAnswers).length
    const pct        = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0

    const handleAnswerSelect  = (questionId, answer) =>
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }))
    const handleSecondAnswer  = (key, value) =>
        setSecondAnswers(prev => ({ ...prev, [key]: value }))

    const handleSubmitConfirmed = () => {
        localStorage.removeItem(sessionKey)
        setShowConfirm(false)
        navigate(`/EYSH/mock/${id}/Result`, {
            state: { mockTest, userAnswers: selectedAnswers, secondAnswers }
        })
    }

    return (
        <div>
            <Header />

            {/* Sticky progress bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 lg:px-20 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">{answeredCount}/{totalQ}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
                        <div className="bg-[#E75234] h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#E75234] flex-shrink-0">{pct}%</span>
                </div>
                <button onClick={() => setShowConfirm(true)}
                    className="flex-shrink-0 px-4 py-1.5 bg-[#E75234] text-white text-xs font-bold rounded-full hover:bg-[#c94220] transition-colors">
                    Дуусгах
                </button>
            </div>

            {showConfirm && (
                <ConfirmModal answeredCount={answeredCount} totalQ={totalQ}
                    onConfirm={handleSubmitConfirmed}
                    onCancel={() => setShowConfirm(false)} />
            )}

            {resumeData && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center gap-4 max-w-lg w-[90%]">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-sm">Өмнөх хэсгийг үргэлжлүүлэх үү?</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {Object.keys(resumeData.selectedAnswers || {}).length} асуултын хариулт хадгалагдсан байна
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { localStorage.removeItem(sessionKey); setResumeData(null) }}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-bold hover:bg-gray-200 transition-colors">
                            Дахин эхлэх
                        </button>
                        <button onClick={() => { setSelectedAnswers(resumeData.selectedAnswers || {}); setSecondAnswers(resumeData.secondAnswers || {}); setResumeData(null) }}
                            className="px-4 py-2 rounded-xl bg-[#E75234] text-white text-sm font-bold hover:bg-[#c94220] transition-colors">
                            Үргэлжлүүлэх
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col px-4 sm:px-8 lg:px-20 mt-8">
                <div className="w-full flex flex-col items-center">
                    <div className="border-b-4 border-black w-full flex flex-row items-center justify-between mb-4">
                        <Link to="/EYSH" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors py-1">
                            <img src={back} alt="back" className="rotate-90 w-5 h-5" />
                            <span className="text-xs hidden sm:inline">Буцах</span>
                        </Link>
                        <h1 className="font-bold text-base sm:text-2xl">{mockTest.title}</h1>
                        <h1 className="font-bold text-base sm:text-2xl">Математик</h1>
                    </div>
                    <h1 className="font-bold text-sm sm:text-2xl mt-2 text-center">
                        Нэгдүгээр хэсэг. СОНГОХ ДААЛГАВАР
                    </h1>
                </div>

                {/* Section 1: Multiple choice */}
                <div>
                    <h2 className="font-bold text-base sm:text-xl mt-6 mb-1 text-[#2760A6]">
                        Бодлого 1-ээс {totalQ}
                    </h2>
                    {tasks.map(t => (
                        <Test key={t.id} id={t.id} img={t.img} text={t.text}
                            labelA={t.labelA} labelB={t.labelB} labelC={t.labelC} labelD={t.labelD} labelE={t.labelE}
                            onAnswerSelect={handleAnswerSelect}
                            selectedAnswer={selectedAnswers[t.id]}
                            isBookmarked={false}
                            onBookmark={null}
                        />
                    ))}
                </div>

                {/* Section 2: Open-ended */}
                {secondProb.length > 0 && (
                    <div className="mt-16">
                        <div className="border-b-4 border-black w-full mb-6" />
                        <h1 className="font-bold text-2xl text-center mb-2">
                            Хоёрдугаар хэсэг. НӨХӨХ ТЕСТ ({secondProb.length} бодлого)
                        </h1>
                        {secondProb.map(prob => (
                            <SecondSectionQuestion key={prob.id} problem={prob}
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

export default MockTest
