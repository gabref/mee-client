type TimerProps = {
    minutes: number,
    seconds: number
}

function Timer({ minutes, seconds }: TimerProps) {
    return (
        <div style={{ marginLeft: 'auto' }}>
            { 
                minutes > 1 ? minutes + ' minutos restantes' : 
                seconds < 10 ? '0' + seconds + ' segundos restantes' : 
                seconds + ' segundos restantes' 
            }
        </div>
    )
}

export default Timer