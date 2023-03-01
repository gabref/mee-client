export type TDBUser = {
    id: string,
    doc: string,
    name: string,
    businessName: string,
    phoneNumber: string
    email: string,
    roles: string[]
}

export type TJwtPayload = {
    id: string
}

export type TRoom = {
    broadcaster: Omit<TUser, 'expirationTime' | 'kicked' >,
    room: TRoomInfo,
    user: TUser | null,
}

export type TRoomInfo = {
    roomName: string,
    title: string,
    preview: string,
    ready: boolean,
    available: boolean
}

export type TUser = {
    socketId: string,
    name: string,    
    id: string,
    kicked: boolean,
    expirationTime: number
}