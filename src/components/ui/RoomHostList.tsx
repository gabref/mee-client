import style from './RoomHostList.module.css'
import { lessRooms, myrooms } from '@data/testData'
import RoomHost from './RoomHost'
import { useRef, useState } from 'react'

const loading = false

function RoomHostList() {
    const [rooms, setRooms] = useState(lessRooms)
    const [inputOk, setInputOk] = useState(true)
    const [message, setMessage] = useState('')
    const roomNameRef = useRef<HTMLInputElement>(null)

    function handleNewRoom() {
        if (!roomNameRef.current?.value) {
            setMessage('Escreva o nome da nova sala')
            setInputOk(false)
            return
        }

        const newRoom = {
            roomId: roomNameRef.current.value,
            description: 'olá',
            preview: 'conjunto-1',
            available: false
        }

        roomNameRef.current.value = ''
        setRooms(prevRooms => [...prevRooms, newRoom])
        setInputOk(true)
        return
    }

    return (
        <div className={style.roomsList}>
            {!loading ? rooms.map(({ roomId, preview, description, available }) => (
                <RoomHost key={roomId} />
            )) : 'Carregando...'}            

            <div className={style.newRoomContainer}>
                <input  
                    type="text" 
                    placeholder='Nome da Nova Sala' 
                    className={`${inputOk ? null : style.input_error}`}
                    ref={roomNameRef}
                />
                <p className={style.paragraph}>{message}</p>
                <button className='button' onClick={handleNewRoom}>Criar Sala</button>
            </div>
        </div>
    )
}

export default RoomHostList