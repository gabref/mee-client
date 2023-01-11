import { useEffect, useState } from 'react'
import style from './ProgressBar.module.css'

type TProgressProps = { 
    percentage: number, 
}

const ProgressBar = ({ percentage }: TProgressProps) => {
    const [width, setWidth] = useState(100)

    function percentageLimits (min: number, value: number, max: number) {
        return Math.min(Math.max(min, value), max)
    }

    useEffect(() => {
        const width = percentageLimits(0, Math.floor(percentage), 100)
        setWidth(width)
    }, [percentage])
		
	return (
        <div className={style.parentDiv} >
            <div style={{ 'width': `${width}%` }} className={style.childDiv} >
            </div>
        </div>
	)
}

export default ProgressBar