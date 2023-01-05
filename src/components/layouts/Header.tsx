import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import style from './Header.module.css'

function Header() {
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

                    <div className={style.navDesktop}>
                        <ul>
                            <li><Link href={'/'}>Início</Link></li>
                            <li><Link href={'/rooms'}>Salas</Link></li>
                            <li><Link href={'/jornada'}>Jornada</Link></li>
                            <li><a href='https://github.com/ElginDeveloperCommunity' target={'_blank'} rel={'noopener noreferrer'}>GitHub</a></li>
                            <li><a href='https://elgin.com.br/automacao/developers' target={'_blank'} rel={'noopener noreferrer'}>Developers Community</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header