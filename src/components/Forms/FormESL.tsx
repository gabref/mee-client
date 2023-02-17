import FileBase64 from '@components/ImageUpload/FileBase64'
import Modal from '@components/Modals/AlertModal/AlertModal'
import { IMG } from '@data/defines'
import useModal from '@hooks/useModal'
import { ChangeEvent, FormEvent, useState } from 'react'
import style from './FormESL.module.css'

function FormESL({ token }: { token: string }) {
    const { isOpen, 
            toggleModal, 
            modal, 
            handleToggleModal } = useModal()

    const [sku, setSku] = useState('')
    const [itemName, setItemName] = useState('')
    const [price1, setPrice1] = useState('')
    const [price2, setPrice2] = useState('')
    const [price1Currency, setPrice1Currency] = useState('')
    const [price2Currency, setPrice2Currency] = useState('')
    const [qrCode, setQrCode] = useState('')
    const [ean, setEan] = useState('')
    const [rsrvBlob, setRsrvBlob] = useState(IMG.ELGIN_DEV_COM)
    
    const [promo, setPromo] = useState(false)
    const [message, setMessage] = useState('')

    function maskCurrency(value: number, locale = 'pt-BR', currency = 'BRL' ) {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(value)
    }

    function formatPriceInput(value: string, maxLength = 6): { digitsString: string, currency: string } | undefined {
        const onlyDigits = value.replace(/\D+/g, '') // não deixa ser digitado nenhuma letra
        if (onlyDigits.length > maxLength) return
        const integer = onlyDigits.slice(0, -2)
        const digitsFloat = parseFloat((integer ? integer : '0') + '.' + onlyDigits.slice(-2))

        const digitsString = digitsFloat ? digitsFloat.toString() : '0.00'
        const currency = maskCurrency(digitsFloat)

        return { digitsString, currency }
    }

    function handlePrice1Change(event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        const res = formatPriceInput(value)
        if (!res) return
        setPrice1(res.digitsString);
        setPrice1Currency(res.currency)
    }

    function handlePrice2Change(event: ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        const res = formatPriceInput(value)
        if (!res) return
        setPrice2(res.digitsString);
        setPrice2Currency(res.currency)
    }

    function handleSkuChange(event: ChangeEvent<HTMLInputElement>) {
        let { value } = event.target
        value = value.replace(/[^0-9]|(\d{4})/g, "$1").slice(0, 2);
        setSku(value)
    }

    function handleQRCodeChange(event: ChangeEvent<HTMLInputElement>) {
        let { value } = event.target
        value = value.replace(/\s/g, "");
        setQrCode(value)
    }

    function handleEanChange(event: ChangeEvent<HTMLInputElement>) {
        let { value } = event.target
        value = value.replace(/\s/g, "");
        setEan(value)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/esl/updateEsl', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    sku: sku,
                    itemName: itemName,
                    price1: price1,
                    price2: price2,
                    qrCode: qrCode,
                    rsrvBlob: rsrvBlob,
                    ean: ean
                })
            })
            const resJson = await res.json()
            console.log(resJson)
            if (res.status === 200) {
                if (resJson.isUpdated){
                    setSku('')
                    setItemName('')
                    setPrice1Currency('0.00')
                    setPrice2Currency('0.00')
                    setPrice2('0.00')
                    setQrCode('')
                    setRsrvBlob('')
                    setEan('')
                    setMessage('Envio feito com sucesso')
                    handleToggleModal({
                        title: 'Sucesso', 
                        message: 'Envio feito com sucesso! Aguarde cerca de 40 segundos para visualizar as alterações na etiqueta no vídeo ao lado.'
                    })
                } else {
                    setMessage('Ocorreu um erro')
                    handleToggleModal({
                        title: 'Erro no envio',
                        message: 'Houve um erro no envio dos dados no form, tente novamente.',
                        error: true
                    })
                }
            } else {
                setMessage('Ocorreu um erro')
                handleToggleModal({
                    title: 'Erro no envio',
                    message: 'Houve um erro no envio dos dados no form. Saia e entre novamente em uma sala',
                    error: true
                })
            }
        } catch (error) {
            console.error(error)
            setMessage('Ocorreu um erro')
            handleToggleModal({
                title: 'Erro no envio',
                message: 'Deu erro na matrix',
                error: true
            })
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className={style.formContainer}>
                <div className={style.form}>
                    <div className={style.side}>
                        <input type="text" 
                            placeholder="ID da Etiqueta" 
                            value={sku}
                            onChange={handleSkuChange} />
                        <input type="text" 
                            placeholder="Nome do produto" 
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)} />
                        <input type="text" 
                            placeholder="Preço do produto (R$)" 
                            value={price1Currency}
                            onChange={handlePrice1Change} />
                        <input type="text" 
                            placeholder="QR Code" 
                            value={qrCode}
                            onChange={handleQRCodeChange} />
                        <input type="text" 
                            placeholder="Código de barras do produto (EAN)" 
                            value={ean}
                            onChange={handleEanChange} />
                        {/* Promoção Handler */}
                        <div>
                            <div className={style.checkbox}>
                                <span>Preço Promocional</span>
                                <div className={style.checkboxWrapper7}>
                                    <input 
                                        className={`${style.tgl} ${style.tglIos}`} 
                                        onChange={(e) => setPromo(!promo)}
                                        checked={promo}
                                        type="checkbox" 
                                        id='cb2' />
                                    <label 
                                        className={style.tglBtn} 
                                        htmlFor='cb2'></label>
                                </div>
                            </div>
                            <input type="text" 
                                placeholder='Preço do Produto Promocional'
                                value={price2Currency}
                                disabled={!promo}
                                onChange={handlePrice2Change}/>
                        </div>
                    </div>
                    <div className={style.side}>
                        {/* file handler */}
                        <FileBase64 setImage={setRsrvBlob} />
                    </div>
                </div>
                <button type='submit' className={`button ${style.btn}`} >Atualizar Etiqueta</button>
                <p>{message}</p>
            </div>

            <Modal
                isOpen={isOpen} 
                toggle={toggleModal} 
                title={modal.title}
                description={modal.message} 
                cta={'OK'} 
                ctaAction={toggleModal}
                error={modal.error}
            />

        </form>
    )
}

export default FormESL