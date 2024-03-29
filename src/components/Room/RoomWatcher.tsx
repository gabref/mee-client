import Router from 'next/router'
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'

import { AuthContext } from 'src/contexts/AuthContext'
import style from './RoomWatcher.module.css'
import FormESL from '@components/Forms/FormESL'
import Timer from '@components/Timer/Timer'
import { TRoom } from '@customTypes/types'
import { MEE_URL } from '@data/defines'
import { CODE, EVENTS } from '@data/events'
import useModal from '@hooks/useModal'
import Modal from '@components/Modals/AlertModal/AlertModal'

function RoomWatcher({ socket, room, setSelectedRoom }: 
                     { socket: Socket, room: TRoom, setSelectedRoom: Dispatch<SetStateAction<TRoom | null>> }) {

    const { userState } = useContext(AuthContext)
    const [token, setToken] = useState('')
    const videoRef = useRef<HTMLVideoElement>(null)

    const timeouts: NodeJS.Timeout[] = []

    let peerConnection: RTCPeerConnection | null
    const config: RTCConfiguration = {
        iceServers: [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    // 'stun:stun.l.google.com:19302',
                    // 'stun:stun3.l.google.com:19302',
                    // 'stun:stun4.l.google.com:19302',
                ]
            }
        ]
    }

    const { isOpen, modal, toggleModal, handleToggleModal } = useModal()

    function handleBackButton() {
        socket.emit(EVENTS.CLIENT.END, userState?.id)
        setSelectedRoom(null)
        Router.reload()
    }

    function join() {
        if (!userState) return
        const newRoom: TRoom  = {
            broadcaster: room.broadcaster,
            user: {
                name: userState.name,
                socketId: socket.id,
                id: userState.id,
                kicked: false,
                expirationTime: new Date().getTime()
            },
            room: {
                roomName: room.room.roomName,
                preview: room.room.preview,
                title: room.room.title,
                ready: true,
                available: false,
            }
        }
        socket.emit(EVENTS.CLIENT.JOIN, { room: newRoom }, 
            function(callback: number) {
                if (callback != CODE.ROOM.OK) {
                    switch(callback) {
                        case CODE.USER.ALREADY_IN_ROOM: 
                            handleToggleModal({
                                title: 'Usuário Duplo',
                                message: 'Seu usuário já está utilizando uma sala',
                                error: true
                            })
                            const timeout = setTimeout(() => handleBackButton(), 1000 * 10)
                            timeouts.push(timeout)
                            break
                        default:
                            console.log('something Went wrong', callback)
                            handleToggleModal({
                                title: 'Erro',
                                message: 'Ocorreu um erro no evento `client:join`: ' + callback,
                                error: true
                            })
                            const timeoutJoin = setTimeout(() => handleBackButton(), 1000 * 10)
                            timeouts.push(timeoutJoin)
                            break
                    }
                    return
                }
            socket.emit(EVENTS.CLIENT.JOINED, room.room.roomName)
            socket.emit(EVENTS.CLIENT.WATCHER, room.room.roomName )

            getEslToken()

            const timeout = setTimeout(() => {
                if (!peerConnection) {
                    handleToggleModal({
                        title: 'Sockets Error',
                        message: 'Feche a abra novamente a sala!',
                        error: true
                    })
                    const timeout = setTimeout(() => handleBackButton(), 1000 * 10)
                    timeouts.push(timeout)
                }
            }, 10 * 1000)
            timeouts.push(timeout)
        })
    }
    
    useEffect(() => {
        
        function closeVideo() {
            console.log('*** Closing the video')
            if (peerConnection) {
                // disconnect all event listeners
                peerConnection.ontrack = null
                peerConnection.onicecandidate = null
                peerConnection.oniceconnectionstatechange = null
                // stop all transceivers on the connection
                peerConnection.getTransceivers().forEach(transceiver => {
                    transceiver.stop()
                })
                // stop the webcam preview as well by pausing the <video> element,
                // then stopping each of the getUserMedia() tracks on it
                if (videoRef.current?.srcObject) {
                    videoRef.current.pause()
                    videoRef.current.srcObject = null
                }
                peerConnection.close()
                peerConnection = null
            }
        }

        /** Accept an offer to receive video. Configure local settings, create RTCPeerConnection, 
         * get and attach local camera stream */
        async function onOffer( adminSocketId: string, remoteDescription: RTCSessionDescriptionInit ) {
            console.log('offer', adminSocketId)
            try {
                // if not already connected, create an RTCPeerConnection to be linked to the caller
                if (peerConnection) {
                    console.log('already exists', peerConnection)
                }
                peerConnection = new RTCPeerConnection(config)
    
                /** Called by the webrtc layer when events occur on the media tracks on our webrtc call.
                 * This includes when streams are added to and removed from the call
                 * In out case, we're just taking the first stream found and attaching it to 
                 * the <video> element for incoming media
                  */
                peerConnection.ontrack = (event) => {
                    console.log('*** Track event')
                    if (videoRef.current) {
                        console.log('video')
                        videoRef.current.srcObject = event.streams[0]
                    }
                }
                /** Handles |icecandidate| events by forwarding the specified ICE candidate (created by our local
                 * ICE agent) to the other peer trhough the signaling server */
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate)
                        socket.emit(EVENTS.CLIENT.CANDIDATE, 
                                    adminSocketId, 
                                    event.candidate,
                                    room.room.roomName )
                }
                /** handle |iceconnectionstatechange| events. This will detect when the ICE connection is closed, 
                 * failed, or disconnected.
                 * This is called when the state of the ICE agent changes
                 */
                peerConnection.oniceconnectionstatechange = (event) => {
                    console.log(`*** ICE connection state changed to ${peerConnection?.iceConnectionState} ***`)
                    switch(peerConnection?.iceConnectionState) {
                        case 'connected':
                            console.log('iceconnectionstate ', peerConnection.iceConnectionState)
                            break
                        case 'closed':
                        case 'failed':
                        case 'disconnected':
                            closeVideo()
                            handleToggleModal({
                                title: 'Erro de Vídeo',
                                message: 'Não foi possível conectar o seu vídeo, tente novamente mais tarde',
                                error: true
                            })
                            const timeout = setTimeout(() => handleBackButton(), 1000 * 10)
                            timeouts.push(timeout)
                            break
                        default: break
                    }
                }

                // set the remote description to the received SDP offer so that local WebRTC layer knows 
                // how to talk to the caller
                const desc = new RTCSessionDescription(remoteDescription)

                // if the connection isn't stable yet, wait for it...
                if (peerConnection.signalingState != 'stable') {
                    console.log(' --> Signaling not stable, so triggering rollback')
                    //  set local and remove descriptions for rollback, don't proceed until both return
                    await Promise.all([
                        peerConnection.setLocalDescription({ type: 'rollback' }),
                        peerConnection.setRemoteDescription(desc)
                    ])
                    return
                } else {
                    console.log(' --> Setting remote description')
                    await peerConnection.setRemoteDescription(desc)
                }

                console.log('---> Creating and sending answer to host')
                const answerSDP = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answerSDP)
                socket.emit(EVENTS.CLIENT.ANSWER, 
                            adminSocketId, 
                            peerConnection.localDescription, 
                            room.room.roomName )
            } catch (e) {
                console.error('on answer', e)
            }
        }

        function onCandidate( id: string, candidate: RTCIceCandidateInit ) {
            try {
                if(peerConnection?.remoteDescription) {
                    console.log('ice candidate')
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                }
            } catch (e) {
                console.error('on candidate', e)
            }
        }

        function onDeleteRoom() {
            closeVideo()
            handleToggleModal({
                title: 'Sala Removida',
                message: 'Essa sala foi removida pelo Host. Você será redirecionado para a página de salas',
                error: true
            })
            const timeout = setTimeout(() => handleBackButton(), 1000 * 5)
            timeouts.push(timeout)
        }

        function onDisconnectPeer() {
            closeVideo()
            handleToggleModal({
                title: 'Conexão Peer Removida',
                message: 'A conexão Peer to Peer webrtc e de websockets da sua sala foi removida. Você será redirecionado para a página de salas',
                error: true
            })
            const timeout = setTimeout(() => handleBackButton(), 1000 * 5);
            timeouts.push(timeout)
        }

        function onEndBroadcast() {
            // só pra avisar o usuário
            console.info('this stream has ended')
            closeVideo()
            handleToggleModal({
                title: 'Stream Interrompido',
                message: 'Parece que o Host da sua sala indisponibilizou essa sala. Você será redirecionado para a página de salas',
                error: true
            })
            const timeout = setTimeout(() => handleBackButton(), 1000 * 5)
            timeouts.push(timeout)
        }

        function onDisconnect(reason: string) {
            console.log('disconnect', reason)
            // closeVideo()
            // handleBackButton()
        }

        join()

        if (!socket) return 
        // socket.on('client:broadcaster', onBroadcaster)
        socket.on(EVENTS.CLIENT.EMIT.OFFER, onOffer)
        socket.on(EVENTS.CLIENT.CANDIDATE, onCandidate)
        socket.on(EVENTS.ADMIN.DELETE_THIS_ROOM, onDeleteRoom)
        socket.on(EVENTS.DISCONNECT_PEER, onDisconnectPeer)
        socket.on(EVENTS.CLIENT.EMIT.END_BROADCAST, onEndBroadcast)
        socket.on(EVENTS.DISCONNECT, onDisconnect)

        return () => {
            // socket.off('client:broadcaster', onBroadcaster)
        socket.off(EVENTS.CLIENT.EMIT.OFFER, onOffer)
        socket.off(EVENTS.CLIENT.CANDIDATE, onCandidate)
        socket.off(EVENTS.ADMIN.DELETE_THIS_ROOM, onDeleteRoom)
        socket.off(EVENTS.DISCONNECT_PEER, onDisconnectPeer)
        socket.off(EVENTS.CLIENT.EMIT.END_BROADCAST, onEndBroadcast)
        socket.off(EVENTS.DISCONNECT, onDisconnect)

        timeouts.forEach(t => clearTimeout(t))
        }
    }, [])

    async function signInRequest(docNumber: string) {
        const res = await fetch(MEE_URL.API + '/esl/auth/login', {
            method: 'POST',
            body: JSON.stringify({ doc: docNumber })
        })
        if (res.status != 200)
            throw new Error('SignIn Request Error = statusCode ' + res.status)

        const { token }: { token: string } = await res.json()
        
        if (token === undefined) throw new Error('Token Generation Error')

        return { token }
    }

    async function getEslToken() {
        try {
            if (!userState) return
            const { token: eslToken } = await signInRequest(userState.doc)
            setToken(eslToken)
        } catch(err) {
            console.log('Got Error: ' + err)
        }
    }

    return (
        <>
            <span 
                className={`${style.back} `}
                onClick={handleBackButton}
            >Voltar</span> 
            <div className={style.timer}>
                <Timer initialMinutes={30} showNumbers onEndTimer={handleBackButton} />
            </div>

            <div className={style.section}>

                <div className={style.side}>
                    <h3 className={style.title}>Pré Visualização</h3>
                    <div className={style.videoContainer}>
                        <video 
                            className={style.video}
                            poster={'/loading.gif'}
                            autoPlay={true}
                            controls={false}
                            muted={true}
                            playsInline={true}
                            ref={videoRef}
                        />
                    </div>
                </div>

                <div className={style.side}>
                    <h3 className={style.title}>Informações da Etiqueta</h3>

                    <FormESL token={token} />

                </div>

            </div>

            <div className={style.sectionDescription}>
                <div className={style.description}>
                    <h3>Opções de Integração:</h3>
                    <p>A Elgin disponibiliza duas formas de integrar sua solução as nossas etiquetas</p>
                </div>

                <div className={style.description}>
                    <h4>Via DLL</h4>
                    <p>Clique  
                        <a href={'https://github.com/ElginDeveloperCommunity/'} target={'_blank'}> aqui </a>
                         para ser redirecinado ao nosso GitHub onde você poderá baixar a última versão da DLL de integração.</p>
                    <br />
                    <p>Seu token: <b>{token}</b></p>
                    <br />
                    <span>A documentação de uso da API está em nosso <a href={'https://github.com/ElginDeveloperCommunity/Equipamentos/tree/master/Elgin/Etiqueta%20Eletr%C3%B4nica/Documenta%C3%A7%C3%A3o'} target={'_blank'}>GitHub.</a></span>
                </div>
            </div>

            <Modal
                isOpen={isOpen} 
                toggle={toggleModal} 
                title={modal.title}
                description={modal.message} 
                cta={'OK'} 
                ctaAction={handleBackButton}
                error={modal.error}
            />
        </>
    )
}

export default RoomWatcher