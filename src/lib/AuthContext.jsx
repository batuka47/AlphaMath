import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    async function saveUsername(username) {
        const { data, error } = await supabase.auth.updateUser({
            data: { username },
        })
        if (!error) setUser(data.user)
        return error
    }

    const needsUsername = !!user && !user.user_metadata?.username

    return (
        <AuthContext.Provider value={{ user, loading, needsUsername, saveUsername }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
