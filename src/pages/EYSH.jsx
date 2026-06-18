import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MaterialChoose from '../components/materialChoose'
import { useTasks } from '../lib/TaskContext'
import { supabase } from '../lib/supabase'

function EYSH() {
    const taskData = useTasks()
    const [mockTests, setMockTests] = useState([])

    useEffect(() => {
        supabase.from('mock_tests')
            .select('id, title, description, problem, second_problem, created_at')
            .order('created_at', { ascending: true })
            .then(({ data }) => setMockTests(data || []))
    }, [])

    // Build a map: year -> Set of available variants
    const availableMap = {}
    taskData.forEach(t => {
        const year = 2006 + parseInt(t.id)
        if (!availableMap[year]) availableMap[year] = new Set()
        availableMap[year].add(t.variant)
    })

    // Always show 2006-2024; also include any years from dynamic (Supabase) exams beyond 2024
    const extraYears = Object.keys(availableMap).map(Number).filter(y => y > 2024)
    const years = [
        ...Array.from({ length: 2024 - 2006 + 1 }, (_, i) => 2006 + i),
        ...extraYears,
    ].sort((a, b) => a - b)

    const totalTests = taskData.length

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero */}
            <div className="bg-[#F5DAC6] px-8 sm:px-16 py-14 flex flex-col gap-4">
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                    <span className="bg-white px-3 py-1.5 rounded-full shadow-sm text-[#2760A6]">{totalTests} тест</span>
                    <span className="bg-white px-3 py-1.5 rounded-full shadow-sm text-[#E75234]">2006–2024</span>
                    <span className="bg-white px-3 py-1.5 rounded-full shadow-sm text-gray-600">A · B · C · D хувилбар</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                    Элсэлтийн Ерөнхий Шалгалт<br />
                    <span className="text-[#E75234]">Математик</span>
                </h1>
                <p className="text-gray-600 max-w-xl">
                    2006 оноос 2024 он хүртэлх бүх хувилбаруудыг дадлагажуул. Тест дуусгасны дараа
                    зөв хариулт, оноогоо шууд харна.
                </p>
            </div>

            {/* Year grid */}
            <div className="px-6 sm:px-12 lg:px-20 py-12">
                <h2 className="text-xl font-extrabold mb-6 text-gray-800">Он сонгох</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {years.map(year => (
                        <MaterialChoose
                            key={year}
                            year={year}
                            availableVariants={availableMap[year] || new Set()}
                        />
                    ))}
                </div>
            </div>

            {/* Жишиг тест */}
            {mockTests.length > 0 && (
                <div className="px-6 sm:px-12 lg:px-20 pb-12">
                    <h2 className="text-xl font-extrabold mb-6 text-gray-800">Жишиг тест</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockTests.map(test => {
                            const qCount  = (test.problem || []).length
                            const spCount = (test.second_problem || []).length
                            return (
                                <Link
                                    key={test.id}
                                    to={`/EYSH/mock/${test.id}`}
                                    className="flex w-full flex-row rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
                                >
                                    <div className="w-1 bg-gradient-to-b from-[#E75234] to-[#2760A6] flex-shrink-0" />
                                    <div className="flex-1 px-5 py-4 flex flex-col gap-1">
                                        <h3 className="font-bold text-base text-gray-800">{test.title}</h3>
                                        {test.description && (
                                            <p className="text-xs text-gray-500">{test.description}</p>
                                        )}
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            {qCount > 0 && (
                                                <span className="text-xs bg-[#F5DAC6] text-[#E75234] font-bold px-2 py-0.5 rounded-full">
                                                    {qCount} сонгох
                                                </span>
                                            )}
                                            {spCount > 0 && (
                                                <span className="text-xs bg-blue-50 text-[#2760A6] font-bold px-2 py-0.5 rounded-full">
                                                    {spCount} задгай
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="px-6 sm:px-12 lg:px-20 pb-20">
                <h2 className="text-xl font-extrabold mb-6 text-gray-800">Зөвлөгөө</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { tag: 'Цаг', title: 'Цагаа хуваарил', body: 'Нэгдүгээр хэсэгт тус бодлогод дунджаар 2 минут. Хэт удаан болсон бодлогыг орхиод дараагийнхыг бод.' },
                        { tag: 'Дадлага', title: 'Олон хувилбар давт', body: 'Адилхан сэдэв өөр жилд дахин гардаг. Олон хувилбар давтах нь шалгалтын хэв маягийг таниулна.' },
                        { tag: 'Шинжилгээ', title: 'Алдаанаасаа сур', body: 'Тест дуусгасны дараа алдсан бодлогоо дахин бод. Алдааны дүн шинжилгээ нь хамгийн хурдан ахиц гаргах арга.' },
                    ].map(tip => (
                        <div key={tip.tag} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5DAC6] text-[#E75234] w-fit">{tip.tag}</span>
                            <h3 className="font-extrabold text-base">{tip.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{tip.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default EYSH
