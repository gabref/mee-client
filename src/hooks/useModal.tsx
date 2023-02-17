import { useState } from 'react'

type ModalParams = {
    title: string, 
    message: string, 
    error?: boolean
}

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState({ message: '', title: '', error: false })

  const toggleModal = () => {
    setIsOpen(!isOpen);
  }

  function handleToggleModal({ title, message, error = false }: ModalParams) {
    setModal({ title, message, error })
    toggleModal()
  }

  return {
    isOpen,
    toggleModal,
    modal,
    handleToggleModal
  };
}
