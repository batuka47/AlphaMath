import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function AdminBookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    supabase
      .from('bookmarks')
      .select('id, user_id, year, variant, question_id, question_text, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return }
        setBookmarks(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = bookmarks.filter(b =>
    b.user_id?.includes(search) ||
    String(b.year).includes(search) ||
    b.variant?.toLowerCase().includes(search.toLowerCase()) ||
    b.question_text?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    const { error: err } = await supabase.from('bookmarks').delete().eq('id', id)
    if (!err) setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Bookmarks</h1>
      <p className="text-sm text-muted-foreground mb-6">All bookmarked questions across all users.</p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Could not load data: {error}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search user, year, question…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            {loading ? 'Loading…' : `${filtered.length} bookmark${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No bookmarks found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Q#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{b.user_id?.slice(0, 8)}…</TableCell>
                    <TableCell>{b.year}</TableCell>
                    <TableCell><span className="font-bold">{b.variant}</span></TableCell>
                    <TableCell>{b.question_id}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{b.question_text || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(b.id)}>
                        Delete
                      </Button>
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
