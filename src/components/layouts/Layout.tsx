import Header from "@components/layouts/Header";
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