import RoomCard from "@components/Room/RoomCard";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"

import style from './RoomWatcherList.module.css'
import { EVENTS } from "@data/events";
import { TRoom } from "@customTypes/types";
import Router from "next/router";
import { AuthContext } from "src/contexts/AuthContext";

function RoomWatcherList({ socket, setSelectedRoom }: { socket: Socket, setSelectedRoom: Dispatch<SetStateAction<TRoom | null>> }) {
    const { userState } = useContext(AuthContext)
    const [rooms, setRooms] = useState<TRoom[]>([])
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        function socketConnect() {
            socket.emit(EVENTS.CLIENT.GET_ROOMS, function(roomsArray: TRoom[]) {
                setRooms(roomsArray)
            })
            setIsConnected(true)
        }

        function onUpdate({ rooms }: { rooms: TRoom[] }) {
            setRooms(rooms)
        }

        function onDisconnect() {
            Router.reload()
        }

        if (!socket) return
        if (!userState) return
        socket.on('connect', socketConnect)
        socket.on(EVENTS.ADMIN.CREATE_ROOM, onUpdate)
        socket.on(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, onUpdate)
        socket.on(EVENTS.ADMIN.DELETE_ROOM, onUpdate)
        socket.on(EVENTS.ADMIN.TOGGLE_AVAILABLE, onUpdate)
        socket.on(EVENTS.CLIENT.JOINED, onUpdate)
        socket.on(EVENTS.CLIENT.UNJOINED, onUpdate)
        socket.on(EVENTS.ADMIN.GET_ROOMS, onUpdate)
        socket.on(EVENTS.DISCONNECT, onDisconnect)

        return () => {
            socket.off('connect', socketConnect)
            socket.off(EVENTS.ADMIN.CREATE_ROOM, onUpdate)
            socket.off(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, onUpdate)
            socket.off(EVENTS.ADMIN.DELETE_ROOM, onUpdate)
            socket.off(EVENTS.ADMIN.TOGGLE_AVAILABLE, onUpdate)
            socket.off(EVENTS.CLIENT.JOINED, onUpdate)
            socket.off(EVENTS.CLIENT.UNJOINED, onUpdate)
            socket.off(EVENTS.ADMIN.GET_ROOMS, onUpdate)
            socket.off(EVENTS.DISCONNECT, onDisconnect)
        }
    }, [ socket, userState ])

    return (
        <div>
            <h1>Salas</h1>
            <br />

            <div className={style.roomsList}>
                {isConnected ? 
                    rooms.length > 0 ? (
                        rooms.map((room) => (
                            <RoomCard
                                key={room.room.roomName}
                                room={room}
								setSelectedRoom={setSelectedRoom} 
                            />
                        ))
                    ) : `Nenhuma Sala Disponível no momento`
                    : (
                        <div className={style.loading}>
                            <p>Carregando...</p>
                            <button 
                                className='button' 
                                onClick={() => Router.reload()}
                                >Recarregar Página
                            </button>
                        </div>
                )}
            </div>
        </div>
    )
}

export default RoomWatcherList