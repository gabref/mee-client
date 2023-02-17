import Timer from "@components/Timer/Timer"
import { TRoom } from "@customTypes/types"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
import style from './RoomCard.module.css'

function RoomCard({ room, setSelectedRoom }: { room: TRoom, setSelectedRoom: Dispatch<SetStateAction<TRoom | null>> }) {
    
    function handleClick() {
        if (!room.room.available) return
        setSelectedRoom(room)
    }

    function timeDiffInMinutes(expirationDateInMilliseconds: number) {
        const currentDateInMilliseconds = new Date().getTime()
        const timeDiffInMilliseconds = expirationDateInMilliseconds - currentDateInMilliseconds
        return Math.floor(timeDiffInMilliseconds / (1000 * 60))
    }

    return (
        <div 
            key={room.room.roomName} 
            className={`${room.room.available ? style.container : style.containerDisabled}`}
            onClick={handleClick}
        >
            <h4>{room.room.roomName}</h4>
            <Image 
                src={`/images/${room.room.preview}.png`} 
                alt={room.room.roomName} 
                width={200} 
                height={200} 
                priority
            />
            <h4>
                {!room.room.title ? 'Em preparação' : room.room.title}
            </h4>
            <span>
                {room.room.ready ? 
                    (room.room.available ? 'Sala Disponível' : 
                        (room.user ? 'Em uso' : 'Aguarde...')) : 'Aguarde...'}
            </span>
            <div className={style.timer}>
                { (!room.room.available && room.user?.expirationTime ) && (
                    <>
                        <Timer initialMinutes={timeDiffInMinutes(room.user?.expirationTime)} />
                        { console.log(timeDiffInMinutes(room.user?.expirationTime))}
                    </>
                )}
            </div>
        </div>
    )
}

export default RoomCard