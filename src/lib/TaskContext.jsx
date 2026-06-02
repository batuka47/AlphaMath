import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import getStaticTasks from '../datas/Task'

const TaskContext = createContext({ tasks: [], refresh: () => {} })

function applyDynamic(staticTasks, dynamic) {
    const map = new Map(
        staticTasks.map(t => [`${2006 + parseInt(t.id)}-${t.variant}`, t])
    )
    dynamic.forEach(t =>
        map.set(`${2006 + parseInt(t.id)}-${t.variant}`, t)
    )
    return [...map.values()].filter(t => t.problem?.length >= 5)
}

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => getStaticTasks())
    const staticTasks = getStaticTasks()

    const refresh = useCallback(() => {
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
                setTasks(applyDynamic(staticTasks, dynamic))
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { refresh() }, [refresh])

    return (
        <TaskContext.Provider value={{ tasks, refresh }}>
            {children}
        </TaskContext.Provider>
    )
}

export function useTasks() {
    return useContext(TaskContext).tasks
}

export function useTaskRefresh() {
    return useContext(TaskContext).refresh
}
