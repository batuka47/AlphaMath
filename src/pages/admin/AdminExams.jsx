import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Pencil, Save, X, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ANSWER_OPTIONS = ['', 'A', 'B', 'C', 'D', 'E']

// ── Question editor ───────────────────────────────────────────────────────────

function QuestionEditor({ question, onChange, onRemove }) {
    const q    = question
    const set  = (field, val) => onChange({ ...q, [field]: val })
    const type = q.type || 'mc'

    return (
        <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-white">
            {/* header row: id badge + type toggle + answer selector/delete */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-[#F5DAC6] text-[#E75234] rounded-full px-2 py-0.5">
                    #{q.id}
                </span>

                {/* type toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => set('type', 'mc')}
                        className={`px-2.5 py-1 transition-colors ${type !== 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >A–E</button>
                    <button
                        type="button"
                        onClick={() => set('type', 'text')}
                        className={`px-2.5 py-1 transition-colors ${type === 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >Text</button>
                </div>

                {/* answer selector (MC only) */}
                {type !== 'text' && (
                    <select
                        value={q.answer}
                        onChange={e => set('answer', e.target.value)}
                        className="ml-auto h-7 rounded-md border border-gray-200 bg-white px-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                    >
                        {ANSWER_OPTIONS.map(o => (
                            <option key={o} value={o}>{o || '— no answer —'}</option>
                        ))}
                    </select>
                )}

                {onRemove && (
                    <button onClick={onRemove} title="Delete question"
                        className={`text-gray-300 hover:text-red-400 transition-colors ${type !== 'text' ? 'ml-1' : 'ml-auto'}`}>
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* question text */}
            <textarea
                rows={2}
                value={q.text}
                onChange={e => set('text', e.target.value)}
                placeholder="Question text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#E75234]"
            />

            {/* MC: A–E option inputs */}
            {type !== 'text' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A','B','C','D','E'].map(letter => (
                        <div key={letter} className="flex items-center gap-2">
                            <span className={`text-xs font-bold w-5 shrink-0 ${q.answer === letter ? 'text-[#E75234]' : 'text-gray-400'}`}>
                                {letter}
                            </span>
                            <input
                                type="text"
                                value={q[`label${letter}`] || ''}
                                onChange={e => set(`label${letter}`, e.target.value)}
                                placeholder={`Option ${letter}`}
                                className="flex-1 h-8 rounded-lg border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Text: free-form answer input */}
            {type === 'text' && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 shrink-0">Answer:</span>
                    <input
                        type="text"
                        value={q.answer || ''}
                        onChange={e => set('answer', e.target.value)}
                        placeholder="Enter the correct answer"
                        className="flex-1 h-8 rounded-lg border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                    />
                </div>
            )}

            {/* Image URL */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 shrink-0 w-7">img</span>
                <input
                    type="text"
                    value={q.img || ''}
                    onChange={e => set('img', e.target.value)}
                    placeholder="Image URL (leave blank for none)"
                    className="flex-1 h-7 rounded-lg border border-gray-200 px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#E75234] text-gray-500"
                />
                {q.img && (
                    <a href={q.img} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#2760A6] hover:underline shrink-0">view</a>
                )}
            </div>
        </div>
    )
}

// ── Edit view ─────────────────────────────────────────────────────────────────

const ANSWER_SLOTS = ['a','b','c','d','e','f']

function SecondProblemEditor({ question, onChange, onRemove }) {
    const q = question
    const set = (field, val) => onChange({ ...q, [field]: val })
    const usedSlots = ANSWER_SLOTS.filter(s => s in q)

    const addSlot = () => {
        const next = ANSWER_SLOTS.find(s => !(s in q))
        if (next) onChange({ ...q, [next]: '' })
    }
    const removeSlot = (s) => {
        const copy = { ...q }
        delete copy[s]
        onChange(copy)
    }

    return (
        <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-white">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-100 text-[#2760A6] rounded-full px-2 py-0.5">#{q.id}</span>
                {onRemove && (
                    <button onClick={onRemove} className="ml-auto text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            <textarea
                rows={3}
                value={q.text || ''}
                onChange={e => set('text', e.target.value)}
                placeholder="Question text (may contain $LaTeX$ and [a], [b] blanks)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#2760A6]"
            />
            <div className="flex flex-wrap gap-2">
                {usedSlots.map(s => (
                    <div key={s} className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
                        <span className="text-xs font-bold text-gray-500 italic">[{s}] =</span>
                        <input
                            type="text"
                            value={q[s] || ''}
                            onChange={e => set(s, e.target.value)}
                            placeholder="answer"
                            className="w-20 h-6 text-xs border-none bg-transparent focus:outline-none font-mono"
                        />
                        <button onClick={() => removeSlot(s)} className="text-gray-300 hover:text-red-400">
                            <X size={10} />
                        </button>
                    </div>
                ))}
                {usedSlots.length < ANSWER_SLOTS.length && (
                    <button
                        type="button"
                        onClick={addSlot}
                        className="text-xs text-[#2760A6] hover:text-[#1a4a80] font-medium border border-dashed border-blue-200 rounded-lg px-2 py-1"
                    >+ slot</button>
                )}
            </div>
        </div>
    )
}

function EditView({ exam, onBack }) {
    const [questions,    setQuestions]    = useState(exam.problem || [])
    const [secondProbs,  setSecondProbs]  = useState(exam.second_problem || [])
    const [saving,       setSaving]       = useState(false)
    const [saved,        setSaved]        = useState(false)
    const [error,        setError]        = useState('')
    const [section,      setSection]      = useState('mc')  // 'mc' | 'open'

    function updateQuestion(idx, updated) {
        setQuestions(prev => prev.map((q, i) => i === idx ? updated : q))
        setSaved(false)
    }

    function addQuestion() {
        setQuestions(prev => {
            const nextId = String(prev.length + 1)
            return [...prev, { id: nextId, type: 'mc', text: '', labelA: '', labelB: '', labelC: '', labelD: '', labelE: '', answer: '' }]
        })
        setSaved(false)
    }

    function removeQuestion(idx) {
        setQuestions(prev => {
            const next = prev.filter((_, i) => i !== idx)
            return next.map((q, i) => ({ ...q, id: String(i + 1) }))
        })
        setSaved(false)
    }

    function addSecondProb() {
        setSecondProbs(prev => [...prev, { id: String(prev.length + 1), text: '', a: '' }])
        setSaved(false)
    }

    async function handleSave() {
        setSaving(true); setError(''); setSaved(false)
        const { error: dbErr } = await supabase
            .from('exams')
            .update({ problem: questions, second_problem: secondProbs })
            .eq('id', exam.id)
        setSaving(false)
        if (dbErr) { setError(dbErr.message); return }
        setSaved(true)
    }

    const missing = questions.filter(q => !q.answer).length

    return (
        <div className="px-8 py-8 max-w-3xl">
            {/* header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Edit — {exam.year} {exam.variant}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{questions.length} MC · {secondProbs.length} open-ended</span>
                        {missing > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                {missing} missing answers
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onBack} disabled={saving}>
                        <X size={14} className="mr-1.5" />Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}
                        className="bg-[#E75234] hover:bg-[#c94220] text-white">
                        <Save size={14} className="mr-1.5" />
                        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Section toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold w-fit mb-5">
                <button
                    type="button"
                    onClick={() => setSection('mc')}
                    className={`px-4 py-2 transition-colors ${section === 'mc' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >Section 1 · Multiple Choice ({questions.length})</button>
                <button
                    type="button"
                    onClick={() => setSection('open')}
                    className={`px-4 py-2 transition-colors ${section === 'open' ? 'bg-[#2760A6] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >Section 2 · Задгай ({secondProbs.length})</button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {section === 'mc' && (
                <>
                    <div className="flex flex-col gap-3">
                        {questions.map((q, i) => (
                            <QuestionEditor key={q.id} question={q}
                                onChange={u => updateQuestion(i, u)}
                                onRemove={() => removeQuestion(i)} />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addQuestion}
                        disabled={saving}
                        className="flex items-center gap-2 text-sm text-[#2760A6] hover:text-[#1a4a80] font-medium mt-4 mb-2 disabled:opacity-50 transition-colors"
                    >
                        <PlusCircle size={16} /> Add Question
                    </button>
                </>
            )}

            {section === 'open' && (
                <>
                    {secondProbs.length === 0 && (
                        <p className="text-sm text-muted-foreground mb-4">No open-ended questions yet.</p>
                    )}
                    <div className="flex flex-col gap-3">
                        {secondProbs.map((q, i) => (
                            <SecondProblemEditor
                                key={q.id}
                                question={q}
                                onChange={u => { setSecondProbs(prev => prev.map((p, j) => j === i ? u : p)); setSaved(false) }}
                                onRemove={() => { setSecondProbs(prev => prev.filter((_, j) => j !== i)); setSaved(false) }}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addSecondProb}
                        disabled={saving}
                        className="flex items-center gap-2 text-sm text-[#2760A6] hover:text-[#1a4a80] font-medium mt-4 mb-2 disabled:opacity-50 transition-colors"
                    >
                        <PlusCircle size={16} /> Add Open-ended Question
                    </button>
                </>
            )}

            {/* sticky save at bottom */}
            <div className="sticky bottom-6 flex justify-end mt-6">
                <Button onClick={handleSave} disabled={saving}
                    className="shadow-lg bg-[#E75234] hover:bg-[#c94220] text-white px-8">
                    <Save size={15} className="mr-2" />
                    {saving ? 'Saving…' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}

// ── Main list ─────────────────────────────────────────────────────────────────

export default function AdminExams() {
    const [exams,    setExams]    = useState([])
    const [loading,  setLoading]  = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [editing,  setEditing]  = useState(null)

    const load = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('exams')
            .select('id, year, variant, problem, second_problem, created_at')
            .order('year', { ascending: false })
        setExams(data || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (exam) => {
        if (!confirm(`Delete ${exam.year} ${exam.variant}? This cannot be undone.`)) return
        setDeleting(exam.id)
        await supabase.from('exams').delete().eq('id', exam.id)
        setExams(prev => prev.filter(e => e.id !== exam.id))
        setDeleting(null)
    }

    if (editing) {
        return <EditView exam={editing} onBack={() => { setEditing(null); load() }} />
    }

    return (
        <div className="px-8 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-extrabold text-gray-900">Manage Exams</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={load}>
                        <RefreshCw size={14} className="mr-1.5" />Refresh
                    </Button>
                    <Link to="/admin/import">
                        <Button size="sm" className="bg-[#E75234] hover:bg-[#c94220] text-white">
                            + Add Exam
                        </Button>
                    </Link>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
                Exams added via PDF upload. Built-in exams (2006–2024) are not listed here.
            </p>

            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">
                        {loading ? 'Loading…' : `${exams.length} exam${exams.length !== 1 ? 's' : ''}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
                    ) : exams.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center gap-3">
                            <p className="text-sm text-muted-foreground">No exams added yet.</p>
                            <Link to="/admin/import">
                                <Button size="sm" className="bg-[#E75234] hover:bg-[#c94220] text-white">
                                    Upload your first exam
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Answers</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.map(e => {
                                    const qs      = e.problem || []
                                    const filled  = qs.filter(q => q.answer).length
                                    const missing = qs.length - filled
                                    return (
                                        <TableRow key={e.id}>
                                            <TableCell className="font-bold">{e.year}</TableCell>
                                            <TableCell>{e.variant}</TableCell>
                                            <TableCell>{qs.length}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{filled}/{qs.length}</span>
                                                    {missing > 0 && (
                                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                                            {missing} missing
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm"
                                                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                                        onClick={() => setEditing(e)}>
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        disabled={deleting === e.id}
                                                        onClick={() => handleDelete(e)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
