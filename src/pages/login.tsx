import { cnpjMask, cpfMask } from '@utils/mask'
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from 'src/contexts/AuthContext'
import style from '../styles/Login.module.css'

export default function Login() {
    const [doc, setDoc] = useState('')
    const { signIn } = useContext(AuthContext)

    function validate(value: string) {
        if (value.length <= 14) {
            value = cpfMask(value)
            setDoc(value)
        } else {
            value = cnpjMask(value)
            setDoc(value)
        }
    }

    async function handleSignIn(e: FormEvent) {
        try {
            e.preventDefault()
    
            await signIn({ doc })            
        } catch (err) {
            // TODO
            console.error('Erro no handle Sign In' + err)
        }
    }

    return (
        <div className={style.loginContainer}>
            <h1>Login</h1>
            <h4 className={style.description}>Para entrar basta fazer login com seus dados da Elgin Developers Community</h4>
            <form onSubmit={handleSignIn} className={style.formContainer}>
                <input className={style.input} placeholder="CNPJ/CPF" type="text" maxLength={18} value={doc} onChange={(e) => validate(e.target.value)} required />
                <div className={style.options}>
                    <button type="submit" className="button">Entrar na sala</button>
                    <span>ou</span>
                    <a href={'https://www.elgin.com.br/automacao/developers/cadastro'} target={'_blank'}>cadastre-se</a>
                </div>
            </form>
        </div>
    )
}
