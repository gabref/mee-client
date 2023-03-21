import style from '../styles/Jornada.module.css'

export default function Jornada () {
    return (
        <>
            <h1><strong>Jornada</strong> de Desenvolvimento</h1>

            <div className={style.contentContainer}>
                <h2 className={style.title}><strong>Etiquetas Eletrônicas</strong></h2>
                <p><strong>1. </strong>Veja e teste o funcionamneto das Etiquetas Eletrônicas por meio da nossa plataforma de homologação remota.</p>
                <p><strong>2. </strong> Acesse <a href="/rooms">aqui</a>: faça Login com sua conta cadastrada no portal da Elgin Developer Community, acesse uma sala disponível e teste.</p>
                <p><strong>3. </strong>Agora chegou a hora de você testar</p>
            </div>


            <div className={style.contentContainer}>
                <h2 className={style.title}>Bora <strong>desenvolver</strong>?</h2>
                <p><strong>1. </strong>Baixe a biblioteca para utilizar no seu projeto.</p>
                <p><strong>2. </strong>Acesse a Documentação aqui para seu estudo.</p>
                <p><strong>3. </strong>Comece seu desenvolvimento, e para os testes, use as etiquetas em uma das salas disponível, e conforme a documentação, use o token disponível abaixo do formulário nas salas.</p>
            </div>

            <div className={style.contentContainer}>
                <h2 className={style.title}><strong>Finalizei</strong> a homologação</h2>
                <p><strong>1. </strong>Agora é hora de fechar a parceira conosco! Entre em contato com: xxxx</p>
                <p><strong>2. </strong>Você receberá as credenciais para substituir nas funções.</p>
            </div>

            <div className={style.contentContainer}>
                <h2 className={style.title}><strong>Chegaram </strong>meus equipamentos</h2>
                <p><strong>1. </strong>Configuração da Antena</p>
                <p><strong>2. </strong>Posicionamento das Etiquetas</p>
                <p><strong>3. </strong>Associar produtos às etiquetas</p>
            </div>
        </>
    )
}