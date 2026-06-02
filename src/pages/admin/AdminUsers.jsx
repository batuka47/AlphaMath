import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Aggregate test_results rows by user_id
function aggregateUsers(rows) {
  const map = {}
  rows.forEach(r => {
    if (!map[r.user_id]) {
      map[r.user_id] = { user_id: r.user_id, tests: 0, totalPct: 0, bestPct: 0, lastActive: r.created_at }
    }
    const u = map[r.user_id]
    u.tests++
    u.totalPct += r.percentage || 0
    if ((r.percentage || 0) > u.bestPct) u.bestPct = r.percentage
    if (r.created_at > u.lastActive) u.lastActive = r.created_at
  })
  return Object.values(map)
    .map(u => ({ ...u, avgPct: Math.round(u.totalPct / u.tests) }))
    .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    supabase
      .from('test_results')
      .select('user_id, percentage, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return }
        setUsers(aggregateUsers(data || []))
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u =>
    u.user_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Users</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Aggregated from <code>test_results</code>. To display emails, add a{' '}
        <code>profiles</code> table or enable the service role key.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Could not load data: {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by user ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            {loading ? 'Loading…' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Best Score</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-mono text-xs">{u.user_id}</TableCell>
                    <TableCell>{u.tests}</TableCell>
                    <TableCell>
                      <span className={u.avgPct >= 55 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                        {u.avgPct}%
                      </span>
                    </TableCell>
                    <TableCell>{u.bestPct}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.lastActive).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
