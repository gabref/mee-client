import RoomCard from "@components/cards/RoomCard";
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Socket } from "socket.io-client"

import style from './RoomWatcherList.module.css'
import { EVENTS } from "@data/events";
import { TRoom } from "@customTypes/types";

function RoomWatcherList({ socket, setSelectedRoom }: { socket: Socket, setSelectedRoom: Dispatch<SetStateAction<TRoom | null>> }) {
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

        if (!socket) return
        socket.on('connect', socketConnect)
        socket.on(EVENTS.ADMIN.CREATE_ROOM, onUpdate)
        socket.on(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, onUpdate)
        socket.on(EVENTS.ADMIN.DELETE_ROOM, onUpdate)
        socket.on(EVENTS.ADMIN.TOGGLE_AVAILABLE, onUpdate)

        return () => {
            socket.off('connect', socketConnect)
            socket.off(EVENTS.ADMIN.CREATE_ROOM, onUpdate)
            socket.off(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, onUpdate)
            socket.off(EVENTS.ADMIN.DELETE_ROOM, onUpdate)
            socket.off(EVENTS.ADMIN.TOGGLE_AVAILABLE, onUpdate)
        }
    }, [ socket ])

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
                    ) : 'Nenhuma Sala Disponível no momento'
                    : (
                    'Carregando...'
                )}
            </div>
        </div>
    )
}

export default RoomWatcherList