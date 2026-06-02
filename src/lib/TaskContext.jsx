import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import getStaticTasks from '../datas/Task'

const TaskContext = createContext([])

export function TaskProvider({ children }) {
    // Start with static built-in data — zero loading delay for existing exams
    const [tasks, setTasks] = useState(() => getStaticTasks())

    useEffect(() => {
        // Overlay with any exams the teacher has added via the admin panel
        supabase
            .from('exams')
            .select('year, variant, scoring, problem, second_problem')
            .then(({ data }) => {
                if (!data?.length) return

                const dynamic = data.map(e => ({
                    id:            String(e.year - 2006),
                    variant:       e.variant,
                    scoring:       e.scoring,
                    problem:       e.problem       || [],
                    secondProblem: e.second_problem || [],
                }))

                setTasks(prev => {
                    // Build map keyed by "year-variant", dynamic rows override static
                    const map = new Map(
                        prev.map(t => [`${2006 + parseInt(t.id)}-${t.variant}`, t])
                    )
                    dynamic.forEach(t =>
                        map.set(`${2006 + parseInt(t.id)}-${t.variant}`, t)
                    )
                    return [...map.values()].filter(t => t.problem?.length >= 5)
                })
            })
    }, [])

    return (
        <TaskContext.Provider value={tasks}>
            {children}
        </TaskContext.Provider>
    )
}

export function useTasks() {
    return useContext(TaskContext)
}
