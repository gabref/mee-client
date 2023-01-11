import { TDBUser } from 'src/config/custom/types'
import { AUTH, MEE_URL } from 'src/config/data/defines'
import Router from 'next/router'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { createContext, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'

type TSignInData = {
    doc: string
}

type TAuthContext = {
    isAuthenticated: boolean,
    userState: TDBUser | null,
    signIn: (data: TSignInData) => Promise<void>,
    handleLogOut: () => Promise<void>
}

const AuthContext = createContext({} as TAuthContext)

function AuthProvider({ children }: any) {
    const [userState, setUserState] = useState<TDBUser | null>(null)

    // if user != null, return true
    const isAuthenticated = !!userState

    useEffect(() => {
        const { 'mee.token-auth': token } = parseCookies()
        const loginPath = Router.pathname.startsWith('/login')

        if (!(token && !loginPath)) return

        updateUserInfo()
         
        async function updateUserInfo() {
            const user = await recoverUserInfo(token)
            if (user) setUserState(user)
            else setUserState(null)
        }
    }, [])

    async function recoverUserInfo (token: string) {
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

            return user
        } catch (err) {
            console.error('Error happened: ' + err)
        }
    }

    async function signIn({ doc }: TSignInData) {
        const { token, user } = await signInRequest(doc)

        setCookie(undefined, 'mee.token-auth', token, {
            maxAge: AUTH.API.TIME_EXPIRATION
        })
        if (user) setUserState(user)

        if (user.roles.indexOf('host') != -1){
            Router.push('/admin/rooms')
        }
        else
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

    async function handleLogOut() {
        destroyCookie(undefined, 'mee.token-auth')
        Router.reload()
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, userState, handleLogOut }} >
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }