import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Pencil, Save, X, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuestionEditor, SecondProblemEditor } from '@/components/admin/ExamEditorComponents'

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
        setSecondProbs(prev => [...prev, { id: String(prev.length + 1), text: '', slots: [{ name: 'a', value: '' }] }])
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

    const missing    = questions.filter(q => !q.answer).length
    const pathPrefix = `${exam.year}-${exam.variant}/`

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
                                onRemove={() => removeQuestion(i)}
                                pathPrefix={pathPrefix} />
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
                                pathPrefix={pathPrefix}
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
