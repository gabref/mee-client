import { useState } from 'react'

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    setIsOpen,
    toggleModal
  };
}
