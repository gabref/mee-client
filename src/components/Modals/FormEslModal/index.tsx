import useModal from "@hooks/useModal";
import Modal from "../AlertModal/AlertModal";

type FormEslModalProps = {
    message?: string,
    success?: boolean
}

export function FormEslModal({ 
    message = 'Envio feito com sucesso', 
    success = true
}: FormEslModalProps) {
    const { isOpen, toggleModal } = useModal()

    return (
        <>
            { success ? (
                <Modal
                    isOpen={isOpen} 
                    toggle={toggleModal} 
                    title={'Ocorreu um Erro'}
                    description={message} 
                    cta={'OK'} 
                    ctaAction={toggleModal}
                    error
                />
            )
            : (
                <Modal
                    isOpen={isOpen} 
                    toggle={toggleModal} 
                    title={'Sucesso'}
                    description={message} 
                    cta={'OK'} 
                    ctaAction={toggleModal}
                />
            )}
        </>
    )
}