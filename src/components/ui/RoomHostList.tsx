import style from './RoomHostList.module.css'
import RoomHost from './RoomHost'
import Head from 'next/head'
import { useContext, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { CODE, EVENTS } from '@data/events'
import { TRoom } from '@customTypes/types'
import { AuthContext } from 'src/contexts/AuthContext'

function RoomHostList({ socket }: { socket: Socket }) {
    const { userRef } = useContext(AuthContext)
    const [rooms, setRooms] = useState<TRoom[]>([])
    const [inputOk, setInputOk] = useState(true)
    const [message, setMessage] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const roomNameRef = useRef<HTMLInputElement>(null)

    const peerConnections = new Map<string, RTCPeerConnection>()

    function handleNewRoom() {
        if (!roomNameRef.current?.value) {
            setMessage('Escreva o nome da nova sala')
            setInputOk(false)
            return
        }

        const newRoom: TRoom  = {
            room: {
                roomName: roomNameRef.current.value,
                preview: 'default',
                title: 'Em preparação',
                ready: false,
                available: false
            },
            broadcaster: {
                name: userRef.current ? userRef.current.nome : 'admin',
                socketId: socket.id
            },
            user: null
        }
        
        socket.emit(EVENTS.ADMIN.CREATE_ROOM, newRoom) 
    }
    // console.log(userRef.current?.nome)

    function handleSave() {
        socket.emit(EVENTS.ADMIN.SAVE_ROOMS)
    }

    useEffect(() => {
        function socketConnect() {
            setIsConnected(true)
            socket.emit(EVENTS.ADMIN.GET_ROOMS, 
                        { adminSocketId: socket.id },
                        function(roomsArray: TRoom[]) {
                            setRooms(roomsArray)
                        })
        }

        function onRoomCreated({ roomCode, room }: { roomCode: number, room: TRoom }) {
            if (roomCode !== CODE.ROOM.OK) {
                setMessage('Essa sala já existe, escolha outro nome')
                setInputOk(false)
                return
            }

            roomNameRef.current!.value = ''
            setRooms(prevRooms => [...prevRooms, room])
            setInputOk(true)
            return
        }

        if (!socket) return
        socket.on('connect', socketConnect)
        socket.on(EVENTS.ADMIN.ROOM_CREATED, onRoomCreated)

        return () => {
            socket.off('connect', socketConnect)
            socket.off(EVENTS.ADMIN.ROOM_CREATED, onRoomCreated)
        }
    }, [ socket ])

    return (
        <div>
            <Head>
                <title>Host Sala</title>
                <link rel="icon" href="/favicon.png" />
            </Head>

            {isConnected ? (
                <div>
                    <div className={style.roomsList}>
                        {rooms.map((room) => (
                            <RoomHost 
                                key={room.room.roomName} 
                                room={room} 
                                socket={socket} 
                                setRooms={setRooms}
                                peerConnections={peerConnections}
                            />
                        ))}

                        <div className={style.newRoomContainer} key='newRoom'>
                            <input
                                type="text"
                                placeholder='Nome da Nova Sala'
                                className={`${inputOk ? null : style.input_error}`}
                                ref={roomNameRef}
                            />
                            <p className={style.paragraph}>{message}</p>
                            <button className='button' onClick={handleNewRoom}>Criar Sala</button>
                        </div>

                        {rooms.length > 0 && 
                            <div className={style.saveContainer} >
                                <p>Salvar Nomes e descrições das Salas</p>
                                <button className='button' onClick={handleSave}>Salvar Configurações</button>
                            </div>
                        }
                    </div>
                </div>
            ) : 'Carregando...'}
        </div>
    )
}

export default RoomHostList