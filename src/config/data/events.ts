const EVENTS = {
    TEST: 'test',
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    DISCONNECT_PEER: 'disconnectPeer',
    NAMESPACE: {
        ADMIN: '/admin',
        CLIENT: '/client'
    },
    ADMIN: {
        CONNECT_ERROR: 'admin:connect_error',
        START_VIDEO: 'admin:start-video',
        STOP_VIDEO: 'admin:stop-video',
        BROADCASTER: 'admin:broadcaster',
        OFFER: 'admin:offer',
        CANDIDATE: 'admin:candidate',
        END: 'admin:end',
        EMIT: {
            WATCHER: 'admin:watcher',
            ANSWER: 'admin:answer',
            CANDIDATE: 'admin:candidate',
        },
        CREATE_ROOM: 'admin:create-room',
        DELETE_ROOM: 'admin:delete-room',
        DELETE_THIS_ROOM: 'admin:delete-this-room',
        ROOM_CREATED: 'admin:room-created',
        SAVE_ROOMS: 'admin:save-rooms',
        GET_ROOMS: 'admin:get-rooms',
        UPDATE_DESCRIPTION_IMAGE: 'admin:update-description-image',
        READY: 'admin:ready',
        UNREADY: 'admin:unready',
        TOGGLE_AVAILABLE: 'admin:make-available'
    },
    CLIENT: {
        CONNECT_ERROR: 'client:connect_error',
        CONNECTED: 'client:connected',
        WATCHER: 'client:watcher',
        ANSWER: 'client:answer',
        CANDIDATE: 'client:candidate',
        END: 'client:end',
        JOIN: 'client:join',
        JOINED: 'client:joined',
        UNJOINED: 'client:unjoined',
        EMIT: {
            BROADCASTER: 'client:broadcaster',
            OFFER: 'client:offer',
            CANDIDATE: 'client:candidate',
            END_BROADCAST: 'client:end-broadcast'
        },
        GET_ROOMS: 'client:get-rooms',
    },
}

const CODE = {
    ROOM: {
        OK: 0,
        DOESNT_EXISTS: -1,
        ALREADY_EXISTS: -2,
        NOT_EMPTY: -3,
        NO_USER: -4
    },
    SOCKET: {
        OK: 0,
        DOESNT_EXISTS: -4,
    },
    USER: {
        ALREADY_IN_ROOM: -5
    }
}

export { EVENTS, CODE }
