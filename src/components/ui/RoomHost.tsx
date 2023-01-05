import { TRoom, TRoomInfo } from '@customTypes/types'
import { EVENTS } from '@data/events'
import { IMAGES } from '@data/imagesConfig'
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import style from './RoomHost.module.css'

function RoomHost({ room, socket, setRooms }: { room: TRoom, socket: Socket, setRooms: Dispatch<SetStateAction<TRoom[]>> }) {
    const [selectedDevice, setSelectedDevice] = useState('')
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const videoRef = useRef<HTMLVideoElement>(null)
    const [beingUsed, setBeingUsed] = useState(false)

    const [inputOk, setInputOk] = useState(true)
    const [inputMessage, setInputMessage] = useState('')
    const [descriptionMessage, setDescriptionMessage] = useState('')
    const [ready, setReady] = useState(false)
    const [image, setImage] = useState<string>('')
    const descriptionRef = useRef<HTMLInputElement>(null)
    // const roomRef = useRef<TRoom>(room)
    const [iRoom, setIRoom] = useState<TRoom>(room)

    function updateDescriptionAndImage() {
        if (!descriptionRef.current?.value) {
            setInputMessage('Escreva o nome da nova sala')
            setInputOk(false)
            return
        }
        if (image === '') {
            setDescriptionMessage('Escolha uma imagem')
            return
        }

        setInputOk(true)
        socket.emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            room: iRoom,
            description: descriptionRef.current.value,
            image: image
        })
    }

    function toggleAvailableRoom () {
        const available = !iRoom.room.available

        const availableRoom: TRoom = {
            broadcaster: {
                name: iRoom.broadcaster.name,
                socketId: iRoom.broadcaster.socketId,
            },
            room: {
                roomName: iRoom.room.roomName,
                title: iRoom.room.title,
                preview: iRoom.room.preview,
                ready: iRoom.room.ready,
                available: available
            },
            user: null
        }
        socket.emit(EVENTS.ADMIN.TOGGLE_AVAILABLE, { availableRoom: availableRoom }, function (callback: TRoom) {
            setIRoom(callback)
        })
    }

    function deleteRoom() {
        socket.emit(EVENTS.ADMIN.DELETE_ROOM, { iRoom }, function (callback: TRoom[]) {
            setRooms(callback)
        })
    }

    useEffect(() => {
        function onReady({ room }: { room: TRoom }) {
            if (room.room.roomName !== iRoom.room.roomName) return
            if (!room.room.ready) return
            setReady(true)
            setIRoom(room)
        }

        if (!socket) return
        socket.on(EVENTS.ADMIN.READY, onReady)

        return () => {
            socket.off(EVENTS.ADMIN.READY, onReady)
        }
    }, [ socket ])

    return (
        <>
            <div className={style.container}>

                <button 
                    className={style.closeButton}
                    onClick={deleteRoom}     
                >X</button>

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

                        <p><b>RoomName:</b> {room.room.roomName}</p>
                        <p><b>Em uso:</b> {beingUsed ? 'Sim' : 'Não'}</p>
                        {beingUsed ? <p><b>Usuário:</b> samuel.silva@elgin.com.br</p> : ''}

                        <label><b>Câmera:</b> </label>
                        <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} id="cameras">
                            <option value="" disabled>Selecione uma câmera</option>
                            {devices.map(device => 
                                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                            )}
                        </select><br />

                        <label><b>Descrição da sala:</b> {room.room.title} </label>
                        <input id="description" 
                               type="text" 
                               placeholder='Descrição da Sala'
                               className={`${style.input} ${inputOk ? null : style.input_error}`}
                               ref={descriptionRef}
                               onFocus={() => setInputMessage('')}
                        />
                        <p className={style.paragraph}>{inputMessage}</p>
                        <br />
                        <p><b>Imagem:</b> {room.room.preview}</p>
                        <select 
                            value={image} 
                            onChange={(e) => setImage(e.target.value)} 
                            onFocus={() => setDescriptionMessage('')}
                            id="images"
                            >
                            <option value="" disabled>Selecione uma imagem</option>
                            {IMAGES.map(image => 
                                <option key={image.fileName} value={image.fileName}>{image.fileName}</option> 
                            )}
                        </select>
                        <p className={style.paragraph}>{descriptionMessage}</p>
                        <button 
                            className='button' 
                            onClick={() => updateDescriptionAndImage()}
                            style={{'marginTop': '10px'}}
                        > Atualizar descrição e imagem </button>
                        { ready && (
                            <button 
                                className='button' 
                                onClick={() => toggleAvailableRoom()} 
                                style={{'marginTop': '10px'}}
                            >{ iRoom.room.available ? 'Indisponibilizar' : 'Disponibilizar Sala' }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default RoomHost