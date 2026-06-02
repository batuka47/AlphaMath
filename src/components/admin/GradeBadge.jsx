import { Badge } from '@/components/ui/badge'

const GRADES = [
    { min: 90, label: 'Онцлог',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
    { min: 75, label: 'Сайн',      className: 'bg-green-100  text-green-700  border-green-200'  },
    { min: 55, label: 'Дунд',      className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { min: 40, label: 'Хангалттай',className: 'bg-orange-100 text-orange-700 border-orange-200' },
    { min:  0, label: 'Хангалтгүй',className: 'bg-red-100    text-red-700    border-red-200'    },
]

export function getGrade(pct) {
    return GRADES.find(g => pct >= g.min) ?? GRADES[GRADES.length - 1]
}

export default function GradeBadge({ pct }) {
    const grade = getGrade(pct)
    return <Badge className={`${grade.className} font-semibold`}>{grade.label}</Badge>
}
