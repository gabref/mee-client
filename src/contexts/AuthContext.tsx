import { TDBUser } from 'src/config/custom/types'
import { AUTH, MEE_URL } from 'src/config/data/defines'
import Router from 'next/router'
import { parseCookies, setCookie } from 'nookies'
import { createContext, MutableRefObject, useEffect, useRef, useState } from 'react'

type TSignInData = {
    doc: string
}

type TAuthContext = {
    isAuthenticated: boolean,
    isAdmin: MutableRefObject<Boolean>,
    userRef: MutableRefObject<TDBUser | null>,
    signIn: (data: TSignInData) => Promise<void>
}

const AuthContext = createContext({} as TAuthContext)

function AuthProvider({ children }: any) {
    // const [user, setUser] = useState<TDBUser | null>(null)
    // const [isAdmin, setIsAdmin] = useState(false)
    const userRef = useRef<TDBUser | null>(null)
    const isAdmin = useRef<Boolean>(false)

    // if user != null, return true
    const isAuthenticated = !!userRef.current

    useEffect(() => {
        const { 'mee.token-auth': token } = parseCookies()
        const path = Router.pathname.startsWith('/login')

        if (!(token && !path)) return

        recoverUserInfo(token)
    }, [])

    async function recoverUserInfo(token: string) {
        const statusCodeOk = [200, 304]
        try {
            const res = await fetch(MEE_URL.API + '/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            if (!statusCodeOk.includes(res.status))
                throw new Error('Couldn\'t retrieve user info = statusCode ' + res.status)

            const { user }: { user: TDBUser } = await res.json()

            if (user) userRef.current = user
            if (userRef.current?.isAdmin) isAdmin.current = true
        } catch (err) {
            console.error('Error happened: ' + err)
        }
    }

    async function signIn({ doc }: TSignInData) {
        const { token, user } = await signInRequest(doc)

        setCookie(undefined, 'mee.token-auth', token, {
            maxAge: AUTH.API.TIME_EXPIRATION
        })
        if (user) userRef.current = user

        if (user.isAdmin) isAdmin.current = true // setIsAdmin(true)
        else isAdmin.current = false // setIsAdmin(false)

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
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, signIn, userRef }} >
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }