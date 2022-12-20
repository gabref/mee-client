import FormESL from '@components/cards/FormESL'
import style from './RoomWatcher.module.css'

const beingUsed = true
const token = 'dfkjs fjd k2je l2jrl2 e'

function RoomWatcher() {

    return (
        <>
            <span className={style.timeLeft}>{beingUsed ? '30 restantes' : 'Conectando...'}</span> 

            <div className={style.section}>

                <div className={style.side}>
                    <h3 className={style.title}>Pré Visualização</h3>
                    <div className={style.videoContainer}>
                        <video 
                            className={style.video}
                            poster={'/loading.gif'}
                            autoPlay={true}
                            controls={false}
                            muted={true}
                            playsInline={true}
                            // ref={useRef}
                        />
                    </div>
                </div>

                <div className={style.side}>
                    <h3 className={style.title}>Informações da Etiqueta</h3>

                    <FormESL />

                </div>

            </div>

            <div className={style.description}>
                <h3>Opções de Integração:</h3>
                <p>A Elgin disponibiliza duas formas de integrar sua solução as nossas etiquetas</p>
            </div>

            <div className={style.side}>
                <h4>Via DLL</h4>
                <p>Clique no link abaixo para ser redirecinado ao nosso GitHub onde você poderá baixar a última versão da DLL de integração.</p>
                <p>Seu token: <b>{token}</b></p>
                <br />
                <a href={'https://github.com/ElginDeveloperCommunity/'} target={'_blank'}>GitHub</a>
                <span>A documentação de uso da API está em nosso <a href={'https://github.com/ElginDeveloperCommunity/Equipamentos/tree/master/Elgin/Etiqueta%20Eletr%C3%B4nica/Documenta%C3%A7%C3%A3o'} target={'_blank'}>GitHub.</a></span>
            </div>
        </>
    )
}

export default RoomWatcher