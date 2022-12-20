import style from './RoomHostList.module.css'
import { lessRooms, myrooms } from '@data/testData'
import RoomHost from './RoomHost'
import { useState } from 'react'

const loading = false

function RoomHostList() {
    const [rooms, setRooms] = useState(lessRooms)

    function handleNewRoom() {
        const newRoom = {
            roomId: '',
            description: 'olá',
            preview: 'conjunto-1',
            available: false
        }
        setRooms(prevRooms => [...prevRooms, newRoom])
    }

    return (
        <div className={style.roomsList}>
            {!loading ? rooms.map(({ roomId, preview, description, available }) => (
                <RoomHost />
            )) : 'Carregando...'}            

            <div className={style.newRoomContainer}>
                <input type="text" placeholder='Nome da Nova Sala' />
                <button className='button' onClick={handleNewRoom}>Criar Sala</button>
            </div>
        </div>
    )
}

export default RoomHostList