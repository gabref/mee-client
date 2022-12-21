import Link from "next/link";

export default function Home() {
    return (
        <>
            <h1>Minha Etiqueta Elgin</h1>
            <br />
            <p>Bem-vindo a Plataforma de homologação remota da Elgin Developers</p>
            <br />
            <br />
            <Link href={'/rooms'} className='button'>Salas</Link>
        </>
    )
}
