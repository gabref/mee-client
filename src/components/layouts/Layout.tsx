import Header from "@components/Header";
import Head from "next/head";
import style from './Layout.module.css'

function Layout(props: any) {
    return (
        <>

            <Header />

            <main className={style.container}>
                {props.children} 
            </main>
        </>
    )
}

export default Layout