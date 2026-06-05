// Default scoring structure when the task has no explicit scoring field
export function getDefaultScoring(totalQ) {
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
    return {
        section1: [{ from: 1, to: totalQ, points: 3 }],
        section2Points: 5,
    }
}

export function getPointsForQuestion(questionId, scoring) {
    const id = parseInt(questionId)
    for (const range of scoring.section1) {
        if (id >= range.from && id <= range.to) return range.points
    }
    return 1
}

export function getTotalPossibleScore(questions, scoring) {
    return questions.reduce((sum, q) => sum + getPointsForQuestion(q.id, scoring), 0)
}

export function getGrade(pct) {
    if (pct >= 90) return { label: 'Онцлог',    color: 'text-purple-600', bg: 'bg-purple-50' }
    if (pct >= 75) return { label: 'Сайн',       color: 'text-green-600',  bg: 'bg-green-50'  }
    if (pct >= 55) return { label: 'Дунд',       color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (pct >= 40) return { label: 'Хангалттай', color: 'text-orange-500', bg: 'bg-orange-50' }
    return              { label: 'Хангалтгүй',  color: 'text-red-500',    bg: 'bg-red-50'    }
}
