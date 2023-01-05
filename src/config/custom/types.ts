export type TDBUser = {
    id: string,
    doc: string,
    nome: string,
    nomeFantasia: string,
    telefone: string
    email: string,
    isAdmin: boolean
}

export type TJwtPayload = {
    id: string
}

export type TRoom = {
    broadcaster: TUser,
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
    name: string
}