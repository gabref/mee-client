import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import style from './Header.module.css'

function Header() {
    const router = useRouter()
    const [showNav, setShowNav] = useState(false)

    function handleShowBar () {
        setShowNav(!showNav)
    }

    return (
        <header>
            <Head>
                <title>Minha Etiqueta Elgin</title>
                <meta name="Minha Etiqueta Elgin" content="Plataforma de Homologação remota de Etiquetas Eletrônicas Elgin" />
                <link rel="icon" href="/favicon.png" />
            </Head>

            <div className={style.container}>
                <nav className={style.nav}>
                    <Link href={''} >
                        <Image src={'/elgin-logo.gif'} alt={'Elgin Logo'} width={94} height={40} />
                    </Link>

                    <input type="checkbox" className={style.menuIcon} onClick={handleShowBar}/>
                    <div className={`${style.hamburgerLines}`}>
                        <span className={`${style.line} ${style.line1}`}></span>
                        <span className={`${style.line} ${style.line2}`}></span>
                        <span className={`${style.line} ${style.line3}`}></span>
                    </div>

                    <div className={`${style.navDesktop} ${showNav && style.showNav}`}>
                        <ul>
                            <li className={router.pathname == '/' ? style.active : ''}>
                                <Link href={'/'} >
                                    Início
                                </Link>
                            </li>
                            <li className={router.pathname == '/rooms' ? style.active : ''} >
                                <a href={'/rooms'} >
                                    Salas
                                </a>
                            </li>
                            <li className={router.pathname == '/jornada' ? style.active : ''}>
                                <Link href={'/jornada'} >
                                    Jornada
                                </Link>
                            </li>
                            <li>
                                <a href='https://github.com/ElginDeveloperCommunity' 
                                   target={'_blank'} 
                                   rel={'noopener noreferrer'}>
                                        GitHub
                                </a>
                            </li>
                            <li>
                                <a href='https://elgin.com.br/automacao/developers' 
                                   target={'_blank'} 
                                   rel={'noopener noreferrer'}>
                                    Developers Community
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header