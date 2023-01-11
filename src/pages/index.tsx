import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "src/contexts/AuthContext";

export default function Home() {
    const { userState } = useContext(AuthContext)
    return (
        <>
            <h1>Minha Etiqueta Elgin</h1>
            <br />
            <p>Bem-vindo a Plataforma de homologação remota da Elgin Developers</p>
            <br />
            <br />
            <Link 
                className='button'
                href={ userState ? 
                        userState?.roles.indexOf('host') != -1 ? 
                            '/admin/rooms' : 
                            '/rooms' :
                        '/login' }
                > { userState ? 'Salas' : 'Login' }
            </Link>
        </>
    )
}
