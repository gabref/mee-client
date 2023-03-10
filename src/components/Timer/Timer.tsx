import { useEffect, useState } from "react"
import ProgressBar from "./ProgressBar"
import TimerValues from "./TimerValues"
import style from './Timer.module.css'
import Router from "next/router"

const ONE_SECOND = 1000 // milliseconds

type TimerProps = {
    initialMinutes?: number,
    showNumbers?: boolean,
    onEndTimer?: () => void;
}

function Timer({ initialMinutes, showNumbers = false, onEndTimer }: TimerProps) {

    initialMinutes = Math.min((initialMinutes || 30), 30)

    const [minutes, setMinutes] = useState(Math.min(initialMinutes, 30))
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            } else if (minutes > 0) {
                setMinutes(minutes - 1)
                setSeconds(59)
            } else {
                if (onEndTimer)
                    onEndTimer()
            }
        }, ONE_SECOND)

        return () => clearInterval(interval)
    }, [minutes, seconds])

    return (
        <div className={style.timer}>
            { showNumbers && (
                <TimerValues minutes={minutes} seconds={seconds} />
            )}
            <ProgressBar percentage={minutes * (10/3)} />
        </div>
    )
}

export default Timer