import { useState, useEffect } from 'react'
import { Users, ClipboardList, TrendingUp, Bookmark, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import GradeBadge from '@/components/admin/GradeBadge'

function StatCard({ icon: Icon, label, value, sub, color = 'text-gray-900' }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    )
}

function RlsBanner() {
    const [open, setOpen] = useState(false)
    const sql = `-- Run in Supabase Dashboard → SQL Editor
CREATE POLICY "Users can read own or admin reads all" ON test_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[]));

CREATE POLICY "Users can read own or admin reads all" ON bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = ANY(ARRAY['k2naysaa@gmail.com']::text[]));`

    return (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">RLS policy missing — admin queries are blocked</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                        Run the SQL below in the{' '}
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">
                            Supabase SQL Editor
                        </a>{' '}
                        or see <code className="bg-amber-100 px-1 rounded">supabase/admin_policies.sql</code>.
                    </p>
                    <button onClick={() => setOpen(o => !o)} className="text-xs text-amber-700 underline mt-1">
                        {open ? 'Hide SQL' : 'Show SQL'}
                    </button>
                    {open && (
                        <pre className="mt-2 bg-white border border-amber-200 rounded p-3 text-xs overflow-x-auto text-gray-800">
                            {sql}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const [stats,      setStats]      = useState(null)
    const [recent,     setRecent]     = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState(null)
    const [rlsBlocked, setRlsBlocked] = useState(false)

    useEffect(() => {
        const load = async () => {
            const [
                { count: totalTests, error: e1 },
                { data: rows,        error: e2 },
                { count: bmCount,    error: e3 },
            ] = await Promise.all([
                supabase.from('test_results').select('*', { count: 'exact', head: true }),
                supabase.from('test_results').select('user_id, year, variant, score, total_possible, percentage, created_at').order('created_at', { ascending: false }).limit(200),
                supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
            ])

            if (e1 || e2 || e3) { setError((e1 || e2 || e3).message); setLoading(false); return }

            const data = rows || []

            if (!data.length) {
                const { data: own } = await supabase.from('test_results').select('id').limit(1)
                if (!own?.length) setRlsBlocked(true)
            }

            const uniqueUsers = new Set(data.map(r => r.user_id)).size
            const avg         = data.length ? Math.round(data.reduce((s, r) => s + (r.percentage || 0), 0) / data.length) : 0
            const yearFreq    = {}
            data.forEach(r => { yearFreq[r.year] = (yearFreq[r.year] || 0) + 1 })
            const topYear     = Object.entries(yearFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

            setStats({ totalTests: totalTests || 0, uniqueUsers, avgScore: avg, bmCount: bmCount || 0, topYear })
            setRecent(data.slice(0, 15))
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="px-8 py-8 max-w-6xl">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Overview</h1>
            <p className="text-sm text-muted-foreground mb-8">All-time platform statistics</p>

            {error      && <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">Supabase error: {error}</div>}
            {rlsBlocked && <RlsBanner />}

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="h-24 animate-pulse bg-gray-100 rounded-xl mt-6" /></Card>)}
                </div>
            ) : stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={ClipboardList} label="Total Tests"     value={stats.totalTests.toLocaleString()} />
                    <StatCard icon={Users}         label="Unique Users"    value={stats.uniqueUsers.toLocaleString()} />
                    <StatCard icon={TrendingUp}    label="Average Score"   value={`${stats.avgScore}%`} color={stats.avgScore >= 55 ? 'text-green-600' : 'text-red-500'} />
                    <StatCard icon={Bookmark}      label="Bookmarks"       value={stats.bmCount.toLocaleString()} sub={`Top year: ${stats.topYear}`} />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
                    ) : recent.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                            {rlsBlocked ? 'Fix the RLS policy above to see data.' : 'No results yet.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent.map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{r.user_id?.slice(0, 8)}…</TableCell>
                                        <TableCell>{r.year}</TableCell>
                                        <TableCell>{r.variant}</TableCell>
                                        <TableCell>{r.score}/{r.total_possible} <span className="text-muted-foreground text-xs">({r.percentage}%)</span></TableCell>
                                        <TableCell><GradeBadge pct={r.percentage} /></TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
