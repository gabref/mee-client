import RoomWatcher from "@components/ui/RoomWatcher";
import { TRoom } from "@customTypes/types";
import { EVENTS } from "@data/events";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";


export default function Test() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ selectedRoom, setSelectedRoom ] = useState<TRoom | null>({
        broadcaster: {
            name: '',
            socketId: ''
        },
        room: {
            available: true,
            preview: '',
            ready: true,
            roomName: '',
            title: '',
        },
        user: {
            expirationTime: new Date().getTime(),
            name: '',
            socketId: ''
        }
    });
    const randomRoom = {
        broadcaster: {
            name: '',
            socketId: ''
        },
        room: {
            available: true,
            preview: '',
            ready: true,
            roomName: '',
            title: '',
        },
        user: {
            expirationTime: new Date().getTime(),
            name: '',
            socketId: ''
        }
    } 


    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + EVENTS.NAMESPACE.CLIENT
        const newSocket = io(socketUrl)
        setSocket(newSocket)
    }, [socket])

    return (
        socket ? 
            <RoomWatcher 
                socket={socket}
                room={selectedRoom ? selectedRoom : randomRoom}
                setSelectedRoom={setSelectedRoom} 
            />
         : (
            'No socket'
        )
    )
}

// 4000 + 500 + 1000 + 1000 - 600 - 100 - 30 - 60 - 2000 - 554