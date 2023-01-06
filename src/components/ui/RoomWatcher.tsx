import FormESL from '@components/cards/FormESL'
import { TRoom } from '@customTypes/types'
import { CODE, EVENTS } from '@data/events'
import Router from 'next/router'
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { AuthContext } from 'src/contexts/AuthContext'
import style from './RoomWatcher.module.css'

const token = 'dfkjs fjd k2je l2jrl2 e'

function RoomWatcher({ socket, room, setSelectedRoom }: 
                     { socket: Socket, room: TRoom, setSelectedRoom: Dispatch<SetStateAction<TRoom | null>> }) {

    const { userRef } = useContext(AuthContext)
    const videoRef = useRef<HTMLVideoElement>(null)

    let peerConnection: RTCPeerConnection
    const config = {
        iceServers: [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }
        ]
    }

    function handleBackButton() {
        setSelectedRoom(null)
        Router.reload()
    }

    function join() {
        if (!userRef.current) return
        const newRoom: TRoom  = {
            broadcaster: room.broadcaster,
            user: {
                name: userRef.current.nome,
                socketId: socket.id
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
                    handleBackButton()
                    console.log('something Went wrong', callback)
                    return
                }
            socket.emit(EVENTS.CLIENT.JOINED, room.room.roomName)
            socket.emit(EVENTS.CLIENT.WATCHER, room.room.roomName )
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
                    console.log(`*** ICE connection state changed to ${peerConnection.iceConnectionState} ***`)
                    switch(peerConnection.iceConnectionState) {
                        case 'closed':
                        case 'failed':
                        case 'disconnected':
                            closeVideo()
                            setTimeout(() => handleBackButton(), 2000)
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
                if(peerConnection.remoteDescription) {
                    console.log('ice candidate')
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                }
            } catch (e) {
                console.error('on candidate', e)
            }
        }

        function onDeleteRoom() {
            setTimeout(() => handleBackButton(), 2000)
        }

        function onDisconnectPeer() {
            peerConnection.close()
            setTimeout(() => handleBackButton(), 2000);
        }

        function onEndBroadcast() {
            // só pra avisar o usuário
            console.info('this stream has ended')
            closeVideo()
            setTimeout(() => handleBackButton(), 2000)
        }

        function onDisconnect(reason: string) {
            console.log(reason)
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

        window.onunload = window.onbeforeunload = () => {
            socket.disconnect()
        }

        return () => {
            // socket.off('client:broadcaster', onBroadcaster)
        socket.off(EVENTS.CLIENT.EMIT.OFFER, onOffer)
        socket.off(EVENTS.CLIENT.CANDIDATE, onCandidate)
        socket.off(EVENTS.ADMIN.DELETE_THIS_ROOM, onDeleteRoom)
        socket.off(EVENTS.DISCONNECT_PEER, onDisconnectPeer)
        socket.off(EVENTS.CLIENT.EMIT.END_BROADCAST, onEndBroadcast)
        socket.off(EVENTS.DISCONNECT, onDisconnect)
        }
    }, [socket])

    return (
        <>
            <span 
                className={`${style.back} `}
                onClick={handleBackButton}
            >Voltar</span> 
            <span className={style.timeLeft}>30 restantes</span> 

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

                    <FormESL />

                </div>

            </div>

            <div className={style.description}>
                <h3>Opções de Integração:</h3>
                <p>A Elgin disponibiliza duas formas de integrar sua solução as nossas etiquetas</p>
            </div>

            <div className={style.side}>
                <h4>Via DLL</h4>
                <p>Clique no link abaixo para ser redirecinado ao nosso GitHub onde você poderá baixar a última versão da DLL de integração.</p>
                <p>Seu token: <b>{token}</b></p>
                <br />
                <a href={'https://github.com/ElginDeveloperCommunity/'} target={'_blank'}>GitHub</a>
                <span>A documentação de uso da API está em nosso <a href={'https://github.com/ElginDeveloperCommunity/Equipamentos/tree/master/Elgin/Etiqueta%20Eletr%C3%B4nica/Documenta%C3%A7%C3%A3o'} target={'_blank'}>GitHub.</a></span>
            </div>
        </>
    )
}

export default RoomWatcher