import RoomCard from "@components/cards/RoomCard"
import { useState } from "react"
import style from './index.module.css'
import { myrooms } from "@data/testData"
import RoomWatcher from "@components/ui/RoomWatcher"

function Rooms() {
    const [loading, setLoading] = useState(false)
    const [rooms, setRooms] = useState([...myrooms])
    const [selectedRoom, setSelectedRoom] = useState(null)

    return (
        <>
            {selectedRoom ? (
                <>
                    <h1>Salas</h1> 
                    <br />

                    <div className={style.roomsList}>
                        {!loading ? rooms.map(({ roomId, preview, description, available }) => (
                            <RoomCard roomId={roomId} preview={preview} description={description} available={available} />
                        )) : 'Carregando...'}            
                    </div>
                </>
            ) : (
                <RoomWatcher />
            )}

        </>
    )
}

export default Rooms