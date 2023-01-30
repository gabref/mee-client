import { TRoom, TRoomInfo, TUser } from '@customTypes/types'
import { CODE, EVENTS } from '@data/events'
import { IMAGES } from '@data/imagesConfig'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import style from './RoomHost.module.css'

function RoomHost({ room, socket, setRooms, peerConnections }: 
                  { room: TRoom, socket: Socket, 
                    setRooms: Dispatch<SetStateAction<TRoom[]>>
                    peerConnections: Map<string, RTCPeerConnection | null> }) {

    const [inputOk, setInputOk] = useState(true)
    const [inputMessage, setInputMessage] = useState('')
    const [descriptionMessage, setDescriptionMessage] = useState('')
    const [ready, setReady] = useState(false)
    const [videoIsOn, setVideoIsOn] = useState(false)
    const [image, setImage] = useState<string>('')
    const descriptionRef = useRef<HTMLInputElement>(null)
    const [iRoom, setIRoom] = useState<TRoom>(room)
    const [userInfo, setUserInfo] = useState<TUser | null>(null)
    const [btnVideoEnabled, setBtnVideoEnabled] = useState(false)

    const [selectedDevice, setSelectedDevice] = useState('')
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const [beingUsed, setBeingUsed] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    let localStream: MediaStream | null
    let randomStream: MediaStream
    const config = {
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

    function checkDescriptions() {
        if (!descriptionRef.current?.value) {
            setInputMessage('Escreva o nome da nova sala')
            setInputOk(false)
            return false
        }
        if (image === '') {
            setDescriptionMessage('Escolha uma imagem')
            return false
        }
        return true
    }

    function updateDescriptionAndImage() {
        const cont = checkDescriptions()
        if (!cont) return

        setInputOk(true)
        socket.emit(EVENTS.ADMIN.UPDATE_DESCRIPTION_IMAGE, {
            room: iRoom,
            description: descriptionRef.current?.value,
            image: image
        }, function(callback: number) {
            if (callback != CODE.ROOM.OK) return
            setBtnVideoEnabled(true)
        })
    }

    function toggleAvailableRoom () {
        const available = !iRoom.room.available

        const availableRoom: TRoom = {
            broadcaster: {
                name: iRoom.broadcaster.name,
                socketId: iRoom.broadcaster.socketId,
                id: iRoom.broadcaster.id
            },
            room: {
                roomName: iRoom.room.roomName,
                title: iRoom.room.title,
                preview: iRoom.room.preview,
                ready: iRoom.room.ready,
                available: available
            },
            user: available ? null : userInfo
        }
        socket.emit(EVENTS.ADMIN.TOGGLE_AVAILABLE, { availableRoom: availableRoom }, function (callback: TRoom) {
            setIRoom(callback)
        })

        if (iRoom.room.available && !!userInfo?.socketId) {
            socket.emit(EVENTS.ADMIN.END, iRoom.room.roomName)
        }
    }

    function deleteRoom() {
        socket.emit(EVENTS.ADMIN.DELETE_ROOM, { iRoom: iRoom, clientSocketId: userInfo?.socketId }, function ({ rooms, clientSocketId }: { rooms: TRoom[], clientSocketId: string | undefined }) {
            // callback is an array of updated rooms
            setRooms(rooms)

            closeVideo(clientSocketId, iRoom.room.roomName)
            if (!clientSocketId) return
            peerConnections.delete(clientSocketId)
        })
    }

    function handleVideoButton() {
        const isOn = !videoIsOn
        setVideoIsOn(!videoIsOn)

        isOn ? 
            socket.emit(EVENTS.ADMIN.READY, iRoom.room.roomName) :
            socket.emit(EVENTS.ADMIN.UNREADY, iRoom.room.roomName)

        isOn ? 
            socket.emit(EVENTS.ADMIN.START_VIDEO, iRoom.room.roomName) :
            socket.emit(EVENTS.ADMIN.STOP_VIDEO, userInfo?.socketId, iRoom.room.roomName)
    }

    function handleGetUserMediaErr(err: Error) {
        console.error(`[${new Date().toLocaleDateString()}] Error ${err.name}: ${err.message}`)
        switch(err.name) {
            case 'NotFoundError':
                alert('Unable to open your video because no camera was found.')
                break
            case 'SecurityError':
            case 'PermissionDeniedError':
                alert('For the application to work, you need to accept the video permisisons')
                break
            default:
                alert('Error opening your camera...' + err.message)
                break
        }
        // make sure shuts down the host end of the RTCPeerConnection so is ready to try again
        // stop the webcam preview as well by pausing the <video> element,
        // then stopping each of the getUserMedia() tracks on it
        if (videoRef.current?.srcObject) {
            videoRef.current.pause()
            localStream?.getTracks().forEach(track => track.stop())
        }
    }

    // triggers permission request
    async function getMediaDevices() {
        return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        })
    }

    async function openCamera(cameraId: string) {
        return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                deviceId: cameraId,
                aspectRatio: {
                    ideal: 1.33333 // 3:2 aspect is preferred
                }
            }
        })
    }

    // fetch an array of devices of type 'videoinput'
    async function getConnectedVideoCameras() {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices()
        return mediaDevices.filter(device => device.kind == 'videoinput')
    }

    // Triggered on changes to media devices and update list
    async function onDeviceChanges() {
        const newCameraList = await getConnectedVideoCameras()
        setDevices(newCameraList)
    }

    function handleDeviceChange(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedDevice(event.target.value)

        if (beingUsed && videoRef.current?.srcObject && localStream && userInfo?.socketId) {
            const [ videoTrack ] = localStream.getVideoTracks()
            const senders = peerConnections.get(userInfo.socketId)?.getSenders().find(s => s.track?.kind === videoTrack.kind)
            senders?.replaceTrack(videoTrack)
        }
    }

    function closeVideo(id: string | undefined, roomName: string ) {
        if (roomName != room.room.roomName) return
        console.log('*** Closing the video')
        const clientSocketId = id || ''
        let peerConnection = peerConnections.get(clientSocketId)
        if (peerConnection) {
            // disconnect all event listeners
            peerConnection.onicecandidate = null
            peerConnection.onnegotiationneeded = null
            // stop all transceivers on the connection
            console.log(peerConnection.getTransceivers())
            peerConnection.getTransceivers().forEach(transceiver => {
                transceiver.stop()
            })
            // stop the webcam preview as well by pausing the <video> element,
            // then stopping each of the getUserMedia() tracks on it
            if (videoRef.current?.srcObject) {
                videoRef.current.pause()
                videoRef.current.srcObject = null
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop())
                    localStream = null
                }
            }
            // close the peer connection
            peerConnection.close()
            peerConnection = null
            return
        }
        // same if no peer connected
        if (videoRef.current?.srcObject) {
            videoRef.current.pause()
            videoRef.current.srcObject = null
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
                localStream = null
            }
        }
    }


    useEffect(() => {
        function onReady({ room }: { room: TRoom }) {
            if (room.room.roomName !== iRoom.room.roomName) return
            if (!room.room.ready) return
            setReady(true)
            setIRoom(room)
        }

        function onUnready({ room }: { room: TRoom }) {
            if (room.room.roomName !== iRoom.room.roomName) return
            if (room.room.ready) return
            setReady(false)
            setIRoom(room)
        }

        async function getVideo( roomName: string ) {
            if (roomName != room.room.roomName) return
            console.log('*** Starting the video')
            try {
                if(!videoRef.current) return
                localStream = await openCamera(selectedDevice)
                videoRef.current.srcObject = localStream
                socket.emit(EVENTS.ADMIN.BROADCASTER, {
                    room: iRoom.room.roomName,
                    user: iRoom.user?.name
                })
            } catch (err) {
                if (err instanceof Error) handleGetUserMediaErr(err)
                else console.error(err)
            }
        }

        async function onWatcher( clientSocketId: string, roomName: string ) {
            try {
                if (roomName != room.room.roomName) return
                console.log('watcher', clientSocketId)
                const peerConnection = new RTCPeerConnection(config)
                peerConnections.set(clientSocketId, peerConnection)
                
                if (localStream)
                    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream || randomStream ))
    
                /** Handles |icecandidate| events by forwarding the specified ICE candidate (created by our local
                 * ICE agent) to the other peer trhough the signaling server */
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate)
                        socket.emit(EVENTS.ADMIN.CANDIDATE, clientSocketId, event.candidate )
                }

                // called by the webrtc layer to let us know when it's time to
                // begin, resume, or restart ICE negotiation
                peerConnection.onnegotiationneeded = async (event) => {
                    console.log(`*** Negotiation needed ***`)
                    try {
                        console.log('--> Creating offer ')
                        const offerSDP = await peerConnection.createOffer({ iceRestart: true })

                        // if the connection hasn't yet achieved the 'stable' state, return
                        // to  the caller. Another negotiationneded event will be fired when
                        // the state stabilizes
                        if (peerConnection.signalingState != 'stable') return

                        // establish the offer as the local peer's current description
                        console.log('---> Setting local description to the offer')
                        await peerConnection.setLocalDescription(offerSDP) // triggers the onicecandidate

                        // send the offer to the remote peer
                        console.log('---> Sending the offer to the remote peer')
                        socket.emit(EVENTS.ADMIN.OFFER, 
                                    clientSocketId, 
                                    peerConnection.localDescription, 
                                    roomName )
                    } catch (err: any) { 
                        console.log('*** Following error occurred while handling the negotiationneeded event: ')
                        console.error(`[${new Date().toLocaleDateString()}] Error ${err.name}: ${err.message}`)
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }

        async function onAnswer( clientSocketId: string, remoteDescription: RTCSessionDescriptionInit, roomName: string ) {
            if (roomName != room.room.roomName) return
            console.log('got answer', clientSocketId, '---', remoteDescription)
            // Configure the remote description
            try {
                const desc = new RTCSessionDescription(remoteDescription)
                // const peerConnection = peerConnections.get(clientSocketId)
                // await peerConnection?.setLocalDescription(desc)
                peerConnections.get(clientSocketId)?.setRemoteDescription(desc)
                // await peerConnection.setRemoteDescription(desc)
            } catch (err: any) { 
                console.log('*** Following error occurred onAnswer event: ')
                console.error(`[${new Date().toLocaleDateString()}] Error ${err.name}: ${err.message}`)
            }
        }

        function onCandidate( id: string, candidate: RTCIceCandidateInit, roomName: string ) {
            if (roomName != room.room.roomName) return
            console.log('got ice candidate')
            const candidateInit = new RTCIceCandidate(candidate)
            peerConnections.get(id)?.addIceCandidate(candidateInit)
            // peerConnection.addIceCandidate(candidateInit)
        }

        function onDisconnectPeer({ id, roomName }: { id: string, roomName: string }) {
            console.log('disconnnect peer')
            if (roomName != room.room.roomName) return
            closeVideo(id, roomName)
            peerConnections.delete(id)
            getVideo(roomName)
        }

        function onDisconnect(reason: string) {
            console.log(reason)
            closeVideo(undefined, iRoom.room.roomName)
        }

        function onJoined(room: TRoom) {
            if (room.room.roomName != iRoom.room.roomName) return
            setBeingUsed(true)

            if (!room.user) return
            setUserInfo(room.user)
        }

        function onUnjoined(roomName: string) {
            if (roomName != iRoom.room.roomName) return
            setBeingUsed(false)
            setUserInfo({ name: 'default', socketId: '', id: 'default', expirationTime: 0 })
        }

        // on mount, check if room is ready
        function checkIsReady () {
            if (iRoom.room.title === '' || iRoom.room.title === 'default')
                return
            if (iRoom.room.preview === '' || iRoom.room.preview === 'default')
                return
            setBtnVideoEnabled(true)
        }
        getMediaDevices()
        checkIsReady()
        onDeviceChanges()

        if (!socket) return
        socket.on(EVENTS.ADMIN.READY, onReady)
        socket.on(EVENTS.ADMIN.UNREADY, onUnready)
        socket.on(EVENTS.ADMIN.START_VIDEO, getVideo)
        socket.on(EVENTS.ADMIN.STOP_VIDEO, closeVideo)
        socket.on(EVENTS.ADMIN.EMIT.WATCHER, onWatcher)
        socket.on(EVENTS.ADMIN.EMIT.ANSWER, onAnswer)
        socket.on(EVENTS.ADMIN.EMIT.CANDIDATE, onCandidate)
        socket.on(EVENTS.DISCONNECT_PEER, onDisconnectPeer)
        socket.on(EVENTS.DISCONNECT, onDisconnect)

        socket.on(EVENTS.CLIENT.JOINED, onJoined)
        socket.on(EVENTS.CLIENT.UNJOINED, onUnjoined)

        navigator.mediaDevices.addEventListener('devicechange', onDeviceChanges)

        window.onunload = window.onbeforeunload = () => {
            socket.emit(EVENTS.ADMIN.END, iRoom.room.roomName)
            socket.disconnect()
        }

        return () => {
            socket.off(EVENTS.ADMIN.READY, onReady)
            socket.off(EVENTS.ADMIN.UNREADY, onUnready)
            socket.off(EVENTS.ADMIN.START_VIDEO, getVideo)
            socket.off(EVENTS.ADMIN.STOP_VIDEO, closeVideo)
            socket.off(EVENTS.ADMIN.EMIT.WATCHER, onWatcher)
            socket.off(EVENTS.ADMIN.EMIT.ANSWER, onAnswer)
            socket.off(EVENTS.ADMIN.EMIT.CANDIDATE, onCandidate)
            socket.off(EVENTS.DISCONNECT_PEER, onDisconnectPeer)
            socket.off(EVENTS.DISCONNECT, onDisconnect)

            socket.off(EVENTS.CLIENT.JOINED, onJoined)
            socket.off(EVENTS.CLIENT.UNJOINED, onUnjoined)

            navigator.mediaDevices.removeEventListener('devicechange', onDeviceChanges)
        }
    }, [ socket, selectedDevice ])

    return (
        <>
            <div className={style.container}>

                <button 
                    className={style.closeButton}
                    onClick={deleteRoom}     
                >X</button>

                <div className={style.section}>
                    <div className={style.side}>
                        <h3>Pré-visualização</h3>
                        <br />
                        <video className={style.video} 
                               poster="/loading.gif" 
                               autoPlay={true} 
                               controls={false} 
                               muted={true} 
                               playsInline={true} 
                               ref={videoRef} />
                        <button 
                            onClick={handleVideoButton} 
                            className={`${iRoom.room.available ? style.buttonDisabled : 
                                            btnVideoEnabled ? 'button' : style.buttonDisabled}`}
                            disabled={iRoom.room.available ? true : 
                                        btnVideoEnabled ? false : true }
                        >{  videoIsOn ? 'Close Video' : 'Start Video' }</button>
                    </div>

                    <div className={style.side}>
                        <h3>Painel de controles</h3>
                        <br />

                        <p><b>RoomName:</b> {room.room.roomName}</p>
                        <p><b>Em uso:</b> {beingUsed ? 'Sim' : 'Não'}</p>
                        {beingUsed ? <p><b>Usuário:</b> {userInfo?.name}</p> : ''}

                        <label><b>Câmera:</b> </label>
                        <select value={selectedDevice} onChange={handleDeviceChange} id="cameras">
                            <option value="" disabled>Selecione uma câmera</option>
                            {devices.map(device => 
                                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                            )}
                        </select><br />

                        <label><b>Descrição da sala:</b> {room.room.title} </label>
                        <input id="description" 
                               type="text" 
                               placeholder='Descrição da Sala'
                               className={`${style.input} ${inputOk ? null : style.input_error}`}
                               ref={descriptionRef}
                               onFocus={() => setInputMessage('')}
                        />
                        <p className={style.paragraph}>{inputMessage}</p>
                        <br />
                        <p><b>Imagem:</b> {room.room.preview}</p>
                        <select 
                            value={image} 
                            onChange={(e) => setImage(e.target.value)} 
                            onFocus={() => setDescriptionMessage('')}
                            id="images"
                            >
                            <option value="" disabled>Selecione uma imagem</option>
                            {IMAGES.map(image => 
                                <option key={image.fileName} value={image.fileName}>{image.fileName}</option> 
                            )}
                        </select>
                        <p className={style.paragraph}>{descriptionMessage}</p>
                        <button 
                            className='button' 
                            onClick={() => updateDescriptionAndImage()}
                            style={{'marginTop': '10px'}}
                        > Atualizar descrição e imagem </button>
                        { ready && (
                            <button 
                                className='button' 
                                onClick={() => toggleAvailableRoom()} 
                                style={{'marginTop': '10px'}}
                            >{ iRoom.room.available ? 'Indisponibilizar' : 'Disponibilizar Sala' }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default RoomHost