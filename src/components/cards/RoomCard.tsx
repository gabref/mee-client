import Image from "next/image"
import style from './RoomCard.module.css'

function RoomCard({ roomId, preview, description, available }: { roomId: string, preview: string, description: string, available: boolean }) {
    return (
        <div key={roomId} className={style.container}>
            <Image src={`/images/${preview}.png`} alt='...' width={200} height={200} />
            <h4>{!description ? 'Em preparação' : description}</h4>
            <span>{available ? 'Sala disponível' : (description ? 'Em uso' : 'Aguarde...')}</span>
        </div>
    )
}

export default RoomCard