import Modal from "@components/Modals/AlertModal/AlertModal";
import RoomWatcher from "@components/Room/RoomWatcher";
import { TRoom } from "@customTypes/types";
import { EVENTS } from "@data/events";
import useModal from "@hooks/useModal";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";


export default function Test() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ selectedRoom, setSelectedRoom ] = useState<TRoom | null>({
        broadcaster: {
            name: '',
            socketId: '',
            id: ''
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
            socketId: '',
            id: ''
        }
    });
    const randomRoom: TRoom = {
        broadcaster: {
            name: '',
            socketId: '',
            id: ''
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
            socketId: '',
            id: ''
        }
    } 


    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + EVENTS.NAMESPACE.CLIENT
        const newSocket = io(socketUrl)
        setSocket(newSocket)
        return () => {
            socket?.disconnect
        }
    }, [setSocket])

    const { isOpen, toggleModal } = useModal()
    function handleOk () {
        toggleModal()
        console.log('ciao')
    }

    return (
        socket ? 
            <RoomWatcher 
                socket={socket}
                room={selectedRoom ? selectedRoom : randomRoom}
                setSelectedRoom={setSelectedRoom} 
            />
         : (
            <>
                <button onClick={toggleModal}>open modal</button>
                <Modal 
                    isOpen={isOpen} 
                    toggle={toggleModal} 
                    title={'Erro na Chamada'}
                    description={'lorem ipsum jfkdl sjf dlk fjlkdjw kflj wlkjfdw klj fçq dçlwkajc lçkj df alfçkd '} 
                    cta={'OK'} 
                    ctaAction={handleOk}
                    error
                />
            </>
        )
    )
}

// 4000 + 500 + 1000 + 1000 - 600 - 100 - 30 - 60 - 2000 - 554