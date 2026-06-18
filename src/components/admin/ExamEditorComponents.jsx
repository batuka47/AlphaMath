import { useState, useRef } from 'react'
import { Trash2, Upload, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSlots, withSlots } from '@/lib/secondProblem'

const ANSWER_OPTIONS = ['', 'A', 'B', 'C', 'D', 'E']

async function uploadImageFile(file, pathPrefix) {
    const ext  = file.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `${pathPrefix}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
        .from('exam-images')
        .upload(path, file, { contentType: file.type || 'image/png', upsert: true })
    if (error) throw new Error(error.message)
    return supabase.storage.from('exam-images').getPublicUrl(path).data.publicUrl
}

export function ImageField({ value, onChange, pathPrefix }) {
    const ref = useRef(null)
    const [busy, setBusy] = useState(false)
    const [err,  setErr]  = useState('')

    async function handlePick(file) {
        if (!file) return
        setBusy(true); setErr('')
        try {
            onChange(await uploadImageFile(file, pathPrefix))
        } catch (e) {
            setErr(e.message)
        } finally {
            setBusy(false)
            if (ref.current) ref.current.value = ''
        }
    }

    return (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 shrink-0 w-7">img</span>
                <input
                    type="text"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Image URL — or upload a file →"
                    className="flex-1 h-7 rounded-lg border border-gray-200 px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#E75234] text-gray-500"
                />
                <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    disabled={busy}
                    className="flex items-center gap-1 text-xs font-semibold text-[#2760A6] hover:text-[#1a4a80] border border-blue-200 rounded-lg px-2 py-1 shrink-0 disabled:opacity-50 transition-colors"
                >
                    {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {busy ? 'Uploading…' : 'Upload'}
                </button>
                {value && (
                    <button type="button" onClick={() => onChange('')}
                        title="Remove image"
                        className="text-gray-300 hover:text-red-400 shrink-0 transition-colors">
                        <X size={14} />
                    </button>
                )}
                <input ref={ref} type="file" accept="image/*" className="hidden"
                    onChange={e => handlePick(e.target.files[0])} />
            </div>
            {err && <p className="text-xs text-red-500 pl-9">{err}</p>}
            {value && (
                <img src={value} alt="" className="max-h-32 rounded-lg border border-gray-100 object-contain bg-gray-50 self-start" />
            )}
        </div>
    )
}

export function QuestionEditor({ question, onChange, onRemove, pathPrefix }) {
    const q    = question
    const set  = (field, val) => onChange({ ...q, [field]: val })
    const type = q.type || 'mc'

    return (
        <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-white">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-[#F5DAC6] text-[#E75234] rounded-full px-2 py-0.5">
                    #{q.id}
                </span>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                    <button type="button" onClick={() => set('type', 'mc')}
                        className={`px-2.5 py-1 transition-colors ${type !== 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >A–E</button>
                    <button type="button" onClick={() => set('type', 'text')}
                        className={`px-2.5 py-1 transition-colors ${type === 'text' ? 'bg-[#E75234] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >Text</button>
                </div>
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
            <textarea
                rows={2}
                value={q.text}
                onChange={e => set('text', e.target.value)}
                placeholder="Question text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#E75234]"
            />
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
            <ImageField value={q.img} onChange={url => set('img', url)} pathPrefix={`${pathPrefix}q${q.id}`} />
        </div>
    )
}

export function nextSlotName(slots) {
    const used = new Set(slots.map(s => s.name))
    for (const l of 'abcdefghijklmnopqrstuvwxyz') {
        if (!used.has(l)) return l
    }
    let n = 1
    while (used.has(`a${n}`)) n++
    return `a${n}`
}

export function SecondProblemEditor({ question, onChange, onRemove, pathPrefix }) {
    const q    = question
    const set  = (field, val) => onChange({ ...q, [field]: val })
    const slots = getSlots(q)

    const setSlots     = (next) => onChange(withSlots(q, next))
    const addSlot      = () => setSlots([...slots, { name: nextSlotName(slots), value: '' }])
    const renameSlot   = (i, name) => setSlots(slots.map((s, j) => j === i ? { ...s, name } : s))
    const setSlotValue = (i, value) => setSlots(slots.map((s, j) => j === i ? { ...s, value } : s))
    const removeSlot   = (i) => setSlots(slots.filter((_, j) => j !== i))

    const duplicate = (name, i) =>
        name && slots.some((s, j) => j !== i && s.name === name)

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
            <div className="flex flex-col gap-2">
                {slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
                        <span className="text-xs text-gray-400 italic shrink-0">[</span>
                        <input
                            type="text"
                            value={s.name}
                            onChange={e => renameSlot(i, e.target.value.trim())}
                            placeholder="name"
                            className={`w-16 h-7 text-xs text-center rounded border bg-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2760A6] ${duplicate(s.name, i) ? 'border-red-400 text-red-600' : 'border-gray-200 text-[#2760A6]'}`}
                        />
                        <span className="text-xs text-gray-400 italic shrink-0">] =</span>
                        <input
                            type="text"
                            value={s.value}
                            onChange={e => setSlotValue(i, e.target.value)}
                            placeholder="answer"
                            className="flex-1 h-7 text-xs border border-gray-200 rounded bg-white px-2 focus:outline-none focus:ring-1 focus:ring-[#2760A6] font-mono"
                        />
                        <button onClick={() => removeSlot(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addSlot}
                    className="self-start text-xs text-[#2760A6] hover:text-[#1a4a80] font-medium border border-dashed border-blue-200 rounded-lg px-2 py-1"
                >+ Add answer</button>
            </div>
            <ImageField value={q.img} onChange={url => set('img', url)} pathPrefix={`${pathPrefix}s${q.id}`} />
        </div>
    )
}
