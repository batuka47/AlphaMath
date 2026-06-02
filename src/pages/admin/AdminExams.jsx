import { useState, useEffect } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminExams() {
    const [exams,    setExams]    = useState([])
    const [loading,  setLoading]  = useState(true)
    const [deleting, setDeleting] = useState(null)

    const load = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('exams')
            .select('id, year, variant, problem, created_at')
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
                                                <Button variant="ghost" size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    disabled={deleting === e.id}
                                                    onClick={() => handleDelete(e)}>
                                                    <Trash2 size={14} />
                                                </Button>
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
