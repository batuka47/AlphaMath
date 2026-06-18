import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Pencil, Save, X, PlusCircle } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SecondProblemEditor } from '@/components/admin/ExamEditorComponents'

// ── Math preview helpers ───────────────────────────────────────────────────────

function renderMath(text) {
    if (!text) return null
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const html = katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true })
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        }
        if (part.startsWith('$') && part.endsWith('$')) {
            const html = katex.renderToString(part.slice(1, -1), { throwOnError: false, displayMode: false })
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        }
        return part
    })
}

function LaTeXField({ value, onChange, placeholder, rows = 2, disabled }) {
    const hasLatex = value && value.includes('$')
    return (
        <div className="flex flex-col gap-1">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                spellCheck={false}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50"
            />
            {hasLatex && (
                <div className="px-3 py-2 bg-[#F5DAC6]/30 border border-[#E75234]/20 rounded-lg text-sm leading-relaxed text-gray-800">
                    {renderMath(value)}
                </div>
            )}
        </div>
    )
}

function LaTeXInput({ value, onChange, placeholder, disabled }) {
    const hasLatex = value && value.includes('$')
    return (
        <div className="flex flex-col gap-0.5">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                spellCheck={false}
                className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50"
            />
            {hasLatex && (
                <div className="px-2 py-1 bg-[#F5DAC6]/30 border border-[#E75234]/20 rounded-md text-sm text-gray-800">
                    {renderMath(value)}
                </div>
            )}
        </div>
    )
}

// ── Question card (same UI as AdminImport manual entry) ────────────────────────

function QuestionCard({ question, idx, onChange, onRemove, disabled }) {
    const q   = question
    const set = (field, val) => onChange({ ...q, [field]: val })

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2760A6]">Q{idx + 1}</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                        <button type="button" onClick={() => set('type', 'mc')} disabled={disabled}
                            className={`px-2.5 py-1 transition-colors ${q.type !== 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        >A–E</button>
                        <button type="button" onClick={() => set('type', 'text')} disabled={disabled}
                            className={`px-2.5 py-1 transition-colors ${q.type === 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        >Text</button>
                    </div>
                </div>
                <button onClick={onRemove} disabled={disabled}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                    <Trash2 size={15} />
                </button>
            </div>

            <div className="mb-3">
                <LaTeXField
                    value={q.text}
                    onChange={val => set('text', val)}
                    placeholder="Question text — use $LaTeX$ for math"
                    rows={2}
                    disabled={disabled}
                />
            </div>

            {q.type !== 'text' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {['A', 'B', 'C', 'D', 'E'].map(letter => (
                            <div key={letter} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 w-4">{letter}</span>
                                <LaTeXInput
                                    value={q[`label${letter}`] || ''}
                                    onChange={val => set(`label${letter}`, val)}
                                    placeholder={`Option ${letter}`}
                                    disabled={disabled}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Answer:</span>
                        <select
                            value={q.answer}
                            onChange={e => set('answer', e.target.value)}
                            disabled={disabled}
                            className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E75234] disabled:opacity-50"
                        >
                            <option value="">— select —</option>
                            {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </>
            )}

            {q.type === 'text' && (
                <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-600 mt-2">Answer:</span>
                    <LaTeXField
                        value={q.answer}
                        onChange={val => set('answer', val)}
                        placeholder="Enter the answer — use $LaTeX$ for math"
                        rows={2}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    )
}

// ── Edit view ─────────────────────────────────────────────────────────────────

function EditView({ test, onBack }) {
    const [title,       setTitle]       = useState(test.title || '')
    const [description, setDescription] = useState(test.description || '')
    const [questions,   setQuestions]   = useState(test.problem || [])
    const [secondProbs, setSecondProbs] = useState(test.second_problem || [])
    const [saving,      setSaving]      = useState(false)
    const [saved,       setSaved]       = useState(false)
    const [error,       setError]       = useState('')
    const [section,     setSection]     = useState('mc')

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
        setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, id: String(i + 1) })))
        setSaved(false)
    }

    function addSecondProb() {
        setSecondProbs(prev => [...prev, { id: String(prev.length + 1), text: '', slots: [{ name: 'a', value: '' }] }])
        setSaved(false)
    }

    async function handleSave() {
        if (!title.trim()) { setError('Title is required.'); return }
        setSaving(true); setError(''); setSaved(false)
        const { error: dbErr } = await supabase
            .from('mock_tests')
            .update({ title: title.trim(), description: description.trim(), problem: questions, second_problem: secondProbs })
            .eq('id', test.id)
        setSaving(false)
        if (dbErr) { setError(dbErr.message); return }
        setSaved(true)
    }

    const pathPrefix = `mock-${test.id}/`
    const missing    = questions.filter(q => !q.answer).length

    return (
        <div className="px-8 py-8 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Edit — {test.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{questions.length} MC · {secondProbs.length} open-ended</span>
                        {missing > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">{missing} missing answers</Badge>
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

            {/* Title & description */}
            <div className="flex flex-col gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => { setTitle(e.target.value); setSaved(false) }}
                        placeholder="e.g. Жишиг тест #1"
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Description (optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => { setDescription(e.target.value); setSaved(false) }}
                        placeholder="Short description shown on the EYSH page"
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                    />
                </div>
            </div>

            {/* Section toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold w-fit mb-5">
                <button type="button" onClick={() => setSection('mc')}
                    className={`px-4 py-2 transition-colors ${section === 'mc' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >Section 1 · Multiple Choice ({questions.length})</button>
                <button type="button" onClick={() => setSection('open')}
                    className={`px-4 py-2 transition-colors ${section === 'open' ? 'bg-[#2760A6] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >Section 2 · Задгай ({secondProbs.length})</button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {section === 'mc' && (
                <>
                    <div className="space-y-4 mb-4">
                        {questions.map((q, i) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                idx={i}
                                onChange={updated => updateQuestion(i, updated)}
                                onRemove={() => removeQuestion(i)}
                                disabled={saving}
                            />
                        ))}
                    </div>
                    <button type="button" onClick={addQuestion} disabled={saving}
                        className="flex items-center gap-2 text-sm text-[#2760A6] hover:text-[#1a4a80] font-medium mb-6 disabled:opacity-50 transition-colors">
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
                            <SecondProblemEditor key={q.id} question={q} pathPrefix={pathPrefix}
                                onChange={u => { setSecondProbs(prev => prev.map((p, j) => j === i ? u : p)); setSaved(false) }}
                                onRemove={() => { setSecondProbs(prev => prev.filter((_, j) => j !== i)); setSaved(false) }}
                            />
                        ))}
                    </div>
                    <button type="button" onClick={addSecondProb} disabled={saving}
                        className="flex items-center gap-2 text-sm text-[#2760A6] hover:text-[#1a4a80] font-medium mt-4 mb-2 disabled:opacity-50 transition-colors">
                        <PlusCircle size={16} /> Add Open-ended Question
                    </button>
                </>
            )}

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

// ── New test form ─────────────────────────────────────────────────────────────

function NewTestForm({ onCreated }) {
    const [title,  setTitle]  = useState('')
    const [desc,   setDesc]   = useState('')
    const [saving, setSaving] = useState(false)
    const [error,  setError]  = useState('')

    async function handleCreate() {
        if (!title.trim()) { setError('Title is required.'); return }
        setSaving(true); setError('')
        const { data, error: dbErr } = await supabase
            .from('mock_tests')
            .insert({ title: title.trim(), description: desc.trim(), problem: [], second_problem: [] })
            .select()
            .single()
        setSaving(false)
        if (dbErr) { setError(dbErr.message); return }
        onCreated(data)
    }

    return (
        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-4">
            <p className="text-sm font-semibold text-gray-700">New Жишиг тест</p>
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title — e.g. Жишиг тест #1"
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#E75234]"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Description (optional)"
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#E75234]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button size="sm" onClick={handleCreate} disabled={saving}
                className="self-start bg-[#E75234] hover:bg-[#c94220] text-white">
                {saving ? 'Creating…' : 'Create'}
            </Button>
        </div>
    )
}

// ── Main list ─────────────────────────────────────────────────────────────────

export default function AdminMockTests() {
    const [tests,    setTests]    = useState([])
    const [loading,  setLoading]  = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [editing,  setEditing]  = useState(null)
    const [showNew,  setShowNew]  = useState(false)

    const load = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('mock_tests')
            .select('id, title, description, problem, second_problem, created_at')
            .order('created_at', { ascending: false })
        setTests(data || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (test) => {
        if (!confirm(`Delete "${test.title}"? This cannot be undone.`)) return
        setDeleting(test.id)
        await supabase.from('mock_tests').delete().eq('id', test.id)
        setTests(prev => prev.filter(t => t.id !== test.id))
        setDeleting(null)
    }

    const handleCreated = (newTest) => {
        setShowNew(false)
        setEditing(newTest)
    }

    if (editing) {
        return <EditView test={editing} onBack={() => { setEditing(null); load() }} />
    }

    return (
        <div className="px-8 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-extrabold text-gray-900">Жишиг тест</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={load}>
                        <RefreshCw size={14} className="mr-1.5" />Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowNew(v => !v)}
                        className="bg-[#E75234] hover:bg-[#c94220] text-white">
                        + New Test
                    </Button>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Mock tests shown on the /EYSH page under "Жишиг тест".
            </p>

            {showNew && <NewTestForm onCreated={handleCreated} />}

            <Card className="mt-4">
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">
                        {loading ? 'Loading…' : `${tests.length} test${tests.length !== 1 ? 's' : ''}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
                    ) : tests.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center gap-3">
                            <p className="text-sm text-muted-foreground">No mock tests yet.</p>
                            <Button size="sm" onClick={() => setShowNew(true)}
                                className="bg-[#E75234] hover:bg-[#c94220] text-white">
                                Create your first test
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Open-ended</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tests.map(t => {
                                    const qs      = t.problem || []
                                    const sp      = t.second_problem || []
                                    const missing = qs.filter(q => !q.answer).length
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-bold">
                                                {t.title}
                                                {t.description && (
                                                    <p className="text-xs font-normal text-muted-foreground">{t.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{qs.length}</span>
                                                    {missing > 0 && (
                                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                                            {missing} missing
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{sp.length}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm"
                                                        className="text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                                        onClick={() => setEditing(t)}>
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        disabled={deleting === t.id}
                                                        onClick={() => handleDelete(t)}>
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
