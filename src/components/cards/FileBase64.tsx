import { IMG } from "@data/defines"
import { ChangeEvent, Dispatch, ImgHTMLAttributes, SetStateAction, useReducer, useRef, useState } from "react"
import style from './FileBase64.module.css'

type TProps = {
    setImage: Dispatch<SetStateAction<string>>
}

const MaxBase64Length = 65000
const MaxSizeInBytes = Math.ceil( MaxBase64Length / 4) * 3

export default function FileBase64({ setImage }: TProps) {
    const [compressedImage, setCompressedImage] = useState(IMG.ELGIN_DEV_COM)
    const [compressedSize, setCompressedSize] = useState('0')
    const [originalSize, setOriginalSize] = useState('0')
    
    function convertFileBase64 (file: Blob) : Promise<string> {
        return new Promise((resolve, reject)  => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
                const res = fileReader.result
                if (!res) resolve('null')
                else if (typeof res == 'string') resolve(res)
                else {
                    const enc = new TextDecoder('utf-8')
                    resolve(enc.decode(res))
                }
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    function formatBytes(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    async function compressImage(file: File, { 
        resizingFactor = 1, 
        quality = 1,
        type = file.type 
    }) {
        // get as image data
        const imageBitmap = await createImageBitmap(file)

        // draw canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        const originalWidth = imageBitmap.width
        const originalHeight = imageBitmap.height

        const canvasWidth = originalWidth * resizingFactor
        const canvasHeight = originalHeight * resizingFactor

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        context?.drawImage(
            imageBitmap,
            0, 0,
            originalWidth * resizingFactor,
            originalHeight * resizingFactor
        )
        // reducing the quality of the image
        const blob =  await new Promise<Blob>((resolve) => {
            canvas.toBlob(blob => {
                if (blob)
                    resolve(blob)
            }, type, quality)
        })

        return new File([blob], file.name, {
            type: blob.type
        })
    }

    async function uploadFile (event: ChangeEvent<HTMLInputElement>) {
        try {
            if (!event.target.files) return 
            const file = event.target.files[0]
            if (!file) return
            
            setOriginalSize(formatBytes(file.size))

            let compressedFile: File

            if (file.size > MaxSizeInBytes) {
                alert('O arquivo da imagem deve ser menos que 47,61KB, aguarde a compressão da imagem para um tamanho adequado')
                compressedFile = await compressImage(file, {
                    quality: 0.5,
                    resizingFactor: 0.9
                })
                let newSize = compressedFile.size
                while (newSize > MaxSizeInBytes) {
                    compressedFile = await compressImage(compressedFile, {
                        quality: 0.5,
                        resizingFactor: 0.5
                    })
                    newSize = compressedFile.size
                }
            } else compressedFile = file

            setCompressedSize(formatBytes(compressedFile.size))
            const cbase64 = await convertFileBase64(compressedFile)
            setCompressedImage(cbase64)
            setImage(cbase64)

        } catch (error) {
            console.error('Error in file upload: ', error)
        }
    }

    return (
        <div className={style.container}>  
            <input 
                className={style.file}
                type="file"     
                accept="image/*"
                onChange={uploadFile}
                name="img" 
                id="img" 
            />
            <label htmlFor="img" className={style.btn}>
                <span>Selecionar Imagem</span>
            </label>

            <div className={style.img}>
                <img id='compressedImage' src={compressedImage} />
            </div>
            <table className={style.table}>
                <tr>
                    <td>Original Size:</td>
                    <td>{originalSize}</td>
                </tr>
                <tr>
                    <td>Compressed Size:</td>
                    <td>{compressedSize}</td>
                </tr>
            </table>
        </div>
    )
}