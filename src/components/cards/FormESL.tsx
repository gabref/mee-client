import { FormEvent, useState } from 'react'
import style from './FormESL.module.css'

function FormESL() {
    const [sku, setSku] = useState('')
    const [itemName, setItemName] = useState('')
    const [price1, setPrice1] = useState('')
    const [price2, setPrice2] = useState('')
    const [qrCode, setQrCode] = useState('')
    const [ean, setEan] = useState('')
    const [rsrvBlob, setRsrvBlob] = useState('')
    
    const [promo, setPromo] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/esl/updateEsl', {
                method: 'POST',
                body: JSON.stringify({
                    sku: sku,
                    itemName: itemName,
                    price1: price1,
                    qrCode: qrCode,
                    rsrvBlob: rsrvBlob,
                    ean: ean
                })
            })
            const resJson = await res.json()
            if (res.status === 200) {
                setSku('')
                setItemName('')
                setPrice1('')
                setQrCode('')
                setRsrvBlob('')
                setEan('')
                setMessage('Envio feito com sucesso')
            } else {
                setMessage('Ocorreu um erro')
            }
        } catch (error) {
            console.error(error)
            setMessage('Ocorreu um erro')
        }
    }

    function handleImage(file: any) {
        // setPreview(URL.createObjectURL(file))
        // setImage(file)
    }

    return (
        <form className={style.form} onSubmit={handleSubmit}>
            <input type="text" 
                placeholder="ID da Etiqueta" 
                onChange={(e) => setSku(e.target.value)} />
            <input type="text" 
                placeholder="Nome do produto" 
                onChange={(e) => setItemName(e.target.value)} />
            <input type="text" 
                placeholder="Preço do produto (R$)" 
                onChange={(e) => setPrice1(e.target.value)} />
            <input type="text" 
                placeholder="QR Code" 
                onChange={(e) => setQrCode(e.target.value)} />
            <input type="text" 
                placeholder="Código do produto" 
                onChange={(e) => setEan(e.target.value)} />
            {/* file handler */}
            <input type="file" 
                placeholder="Imagem do produto" 
                onChange={(e) => handleImage(e.target.files![0])} />
            {/* Promoção Handler */}
            <>
                <div className={style.promocao}>
                    <label htmlFor="">Preço promocional</label>
                    <input type="checkbox"
                        className={style.checkbox} 
                        checked={promo}
                        onChange={(e) => setPromo(!promo)} />
                </div>
                <input type="text" 
                    placeholder='Preço do Produto Promocional'
                    value={price2}
                    disabled={!promo}
                    onChange={(e) => setPrice2(e.target.value)}/>
            </>
            {/* Submit */}
            <button type='submit' className='button'>Atualizar Etiqueta</button>
            <p>{message}</p>
            {/* <div className="message">
                {message ? <p>{message}</p> : null}
            </div> */}
        </form>
    )
}

export default FormESL