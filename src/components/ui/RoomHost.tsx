import Head from 'next/head'
import { useRef, useState } from 'react'
import style from './RoomHost.module.css'

function RoomHost() {
    const [roomName, setRoomName] = useState<string | string[]>('')
    const [selectedDevice, setSelectedDevice] = useState('')
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const videoRef = useRef<HTMLVideoElement>(null)
    const [beingUsed, setBeingUsed] = useState(false)
    const [description, setDescription] = useState('')

    function handle() {
        // socketIo.emit('description', roomName, localStorage.getItem('token'), description)}
    }

    return (
        <>
            <Head>
                <title>Host Sala</title>
                <link rel="icon" href="/favicon.png" />
            </Head>

            <div className={style.container}>

                <div className={style.section}>
                    <div className={style.side}>
                        <h3>Pré-visualização</h3>
                        <br />
                        <video className={style.video} 
                               poster="/loading.gif" 
                               autoPlay={true} 
                               controls={false} 
                               muted={true} 
                               playsInline={true} 
                               ref={videoRef} />
                    </div>

                    <div className={style.side}>
                        <h3>Painel de controles</h3>
                        <br />

                        <p><b>RoomId:</b> {roomName}</p>
                        <p><b>Em uso:</b> {beingUsed ? 'Sim' : 'Não'}</p>
                        {beingUsed ? <p><b>Usuário:</b> samuel.silva@elgin.com.br</p> : ''}

                        <label><b>Câmera:</b> </label>
                        <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
                            <option value="" disabled>Selecione uma câmera</option>
                            {devices.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}
                        </select><br />

                        <label><b>Descrição da sala:</b> </label>
                        <input id="description" 
                               type="text" 
                               value={description} 
                               className={style.input}
                               onChange={(e) => setDescription(e.target.value)} 
                        />
                        <p>Exemplo: Stellar XL3, Stellar L3@ e Stellar XXXL3</p>
                        <button onClick={() => handle()}>Atualizar descrição</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RoomHost