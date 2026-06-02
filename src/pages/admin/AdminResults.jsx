import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import GradeBadge from '@/components/admin/GradeBadge'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS        = Array.from({ length: CURRENT_YEAR - 2006 + 1 }, (_, i) => 2006 + i)
const VARIANTS     = ['A', 'B', 'C', 'D']
const PAGE_SIZE    = 50

export default function AdminResults() {
    const [results,  setResults]  = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState(null)
    const [yearF,    setYearF]    = useState('')
    const [variantF, setVariantF] = useState('')
    const [page,     setPage]     = useState(0)

    useEffect(() => {
        setLoading(true)
        setPage(0)

        let q = supabase
            .from('test_results')
            .select('id, user_id, year, variant, score, total_possible, percentage, created_at')
            .order('created_at', { ascending: false })
            .limit(500)

        if (yearF)    q = q.eq('year', parseInt(yearF))
        if (variantF) q = q.eq('variant', variantF)

        q.then(({ data, error: err }) => {
            if (err) { setError(err.message); setLoading(false); return }
            setResults(data || [])
            setLoading(false)
        })
    }, [yearF, variantF])

    const pageRows   = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    const totalPages = Math.ceil(results.length / PAGE_SIZE)

    return (
        <div className="px-8 py-8 max-w-6xl">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Test Results</h1>
            <p className="text-sm text-muted-foreground mb-6">All submissions across all users.</p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
                <select value={yearF} onChange={e => setYearF(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">All years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={variantF} onChange={e => setVariantF(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">All variants</option>
                    {VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {(yearF || variantF) && (
                    <Button variant="ghost" size="sm" onClick={() => { setYearF(''); setVariantF('') }}>
                        Clear
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">
                        {loading ? 'Loading…' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
                    ) : results.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No results found.</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Variant</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>%</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageRows.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{r.user_id?.slice(0, 8)}…</TableCell>
                                            <TableCell>{r.year}</TableCell>
                                            <TableCell className="font-bold">{r.variant}</TableCell>
                                            <TableCell>{r.score}/{r.total_possible}</TableCell>
                                            <TableCell className={r.percentage >= 55 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                                {r.percentage}%
                                            </TableCell>
                                            <TableCell><GradeBadge pct={r.percentage} /></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, results.length)} of {results.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
