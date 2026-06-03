import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function UsernameModal() {
    const { needsUsername, saveUsername } = useAuth()
    const [username, setUsername] = useState('')
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState('')

    if (!needsUsername) return null

    async function handleSubmit(e) {
        e.preventDefault()
        if (!username.trim()) return
        setLoading(true); setError('')
        const err = await saveUsername(username.trim())
        setLoading(false)
        if (err) setError(err.message)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-extrabold text-gray-900">Хэрэглэгчийн нэр сонгох</h2>
                    <p className="text-sm text-gray-500">Бусад хэрэглэгчид таныг энэ нэрээр харна.</p>
                </div>

                {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Хэрэглэгчийн нэр"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E75234]"
                    />
                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="bg-[#E75234] text-white rounded-xl py-3 font-bold hover:bg-[#c94220] disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Хадгалж байна...' : 'Хадгалах'}
                    </button>
                </form>
            </div>
        </div>
    )
}
