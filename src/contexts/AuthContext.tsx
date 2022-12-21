import { TDBUser } from '@customTypes/types'
import { AUTH, MEE_URL } from '@data/defines'
import Router from 'next/router'
import { parseCookies, setCookie } from 'nookies'
import { createContext, useEffect, useState } from 'react'

type TSignInData = {
    doc: string
}

type TAuthContext = {
    isAuthenticated: boolean,
    isAdmin: boolean,
    user: TDBUser | null,
    signIn: (data: TSignInData) => Promise<void>
}

const AuthContext = createContext({} as TAuthContext)

function AuthProvider({ children }: any) {
    const [user, setUser] = useState<TDBUser | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    // if user != null, return true
    const isAuthenticated = !!user

    useEffect(() => {
        const { 'mee.token-auth': token } = parseCookies()
        const path = Router.pathname.startsWith('/login')

        if (!(token && !path)) return

        recoverUserInfo(token)
    }, [])

    async function recoverUserInfo(token: string) {
        try {
            const res = await fetch(MEE_URL.API + '/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            if (res.status != 200)
                throw new Error('Couldn\'t retrieve user info = statusCode ' + res.status)

            const { user }: { user: TDBUser } = await res.json()
            setUser(user)
            if (user.isAdmin) setIsAdmin(true)
        } catch (err) {
            console.error('Error happened: ' + err)
        }
    }

    async function signIn({ doc }: TSignInData) {
        const { token, user } = await signInRequest(doc)

        setCookie(undefined, 'mee.token-auth', token, {
            maxAge: AUTH.API.TIME_EXPIRATION
        })

        setUser(user)

        if (user.isAdmin) setIsAdmin(true)
        else setIsAdmin(false)

        Router.push('/rooms')
    }

    async function signInRequest(docNumber: string) {
        const res = await fetch(MEE_URL.API + '/auth/login', {
            method: 'POST',
            body: JSON.stringify({ doc: docNumber })
        })
        if (res.status != 200)
            throw new Error('SignIn Request Error = statusCode ' + res.status)

        const { token, user }: { token: string, user: TDBUser } = await res.json()
        
        if (token === undefined) throw new Error('Token Generation Error')
        if (user === undefined) throw new Error('User Error')

        return { token, user }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, signIn, user }} >
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }