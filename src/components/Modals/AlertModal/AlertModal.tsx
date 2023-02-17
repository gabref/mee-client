import useModal from '@hooks/useModal';
import styles from './style.module.css'

interface ModalType {
  toggle: () => void,
  ctaAction: () => void,
  isOpen: boolean,
  title: string,
  description: string,
  cta: string,
  error?: boolean,
}

export default function Modal({ 
  toggle, 
  ctaAction,
  isOpen,
  title,
  description,
  cta,
  error = false 
}: ModalType) {

  return (
    <>
      {isOpen && (
        <div
          className={styles.modalOverlay}
          onClick={toggle}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >

            { error ? (
              <svg 
                className={styles.icon} 
                style={{'color': 'var(--red)'}}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg 
                className={styles.icon} 
                style={{'color': 'var(--green)'}}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}

            <h1 className={styles.title}>
              {title}
            </h1>

            <p className={styles.description}>
              {description}
            </p>

            <div className={styles.buttonsContainer}>
              <button 
                className={styles.button}
                onClick={ctaAction}
              >{cta}</button>
            </div>


          </div>
        </div>
      )}
    </>
  );
}

