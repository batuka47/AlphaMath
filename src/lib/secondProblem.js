const LEGACY_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export function getSlots(prob) {
    if (!prob) return []
    if (Array.isArray(prob.slots)) {
        return prob.slots.map(s => ({ name: String(s.name ?? ''), value: s.value ?? '' }))
    }
    return LEGACY_LETTERS
        .filter(l => prob[l] !== undefined)
        .map(l => ({ name: l, value: prob[l] ?? '' }))
}

export function withSlots(prob, slots) {
    const copy = { ...prob }
    LEGACY_LETTERS.forEach(l => { delete copy[l] })
    copy.slots = slots.map(s => ({ name: String(s.name ?? ''), value: s.value ?? '' }))
    return copy
}

export function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function slotPlaceholderRegex(names) {
    const valid = names.filter(Boolean).map(escapeRegExp)
    if (!valid.length) return null
    return new RegExp(`(\\[(?:${valid.join('|')})\\])`, 'g')
}
