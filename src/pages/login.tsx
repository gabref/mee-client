import { FormEvent, useState } from 'react'
import style from '../styles/Login.module.css'

export default function Login() {
    const [doc, setDoc] = useState('')

    const handleDocumento = function(value: any)  {
        value = value.replace(/[^0-9]/g, '')

        if (value.length <= 11) {
            value = value.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/)
            setDoc((!value[2] ? value[1] : value[1] + '.') + (!value[3] ? value[2] : value[2] + '.') + (!value[4] ? value[3] : value[3] + '-') + value[4])
        } else {
            value = value.match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/)
            setDoc((!value[2] ? value[1] : value[1] + '.') + (!value[3] ? value[2] : value[2] + '.') + (!value[4] ? value[3] : value[3] + '/') + (!value[5] ? value[4] : value[4] + '-') + value[5])
        }
    }

    const handleSubmit = async function(e: FormEvent) {
        try {
            e.preventDefault()
    
            await fetch('/api/auth', {
                method: "POST",
                body: JSON.stringify({
                    doc: doc
                }),
                headers: {
                    'Content-type': 'application/json;charset=utf-8'
                }
            })
            // REDIRECIONAR E SALVAR EM UM CONTEXT O TOKEN
        } catch (err) {
            // TODO
            console.error(err)
        }
    }

    return (
        <div className={style.loginContainer}>
            <h1>Login</h1>
            <h4 className={style.description}>Para entrar basta fazer login com seus dados da Elgin Developers Community</h4>
            <form onSubmit={handleSubmit} className={style.formContainer}>
                <input className={style.input} placeholder="CNPJ/CPF" type="text" maxLength={18} value={doc} onChange={(e) => handleDocumento(e.target.value)} required />
                <div className={style.options}>
                    <button type="submit" className="button">Entrar na sala</button>
                    <span>ou</span>
                    <a href={'https://www.elgin.com.br/automacao/developers/cadastro'} target={'_blank'}>cadastre-se</a>
                </div>
            </form>
        </div>
    )
}
