import Header from "@components/layouts/Header";
import style from './Layout.module.css'

const isAdmin = true
function Layout(props: any) {
    return (
        <>
            <Header />

            <main className={isAdmin ? `${style.containerAdmin}` : `${style.container}`}>
                {props.children} 
            </main>
        </>
    )
}

export default Layout