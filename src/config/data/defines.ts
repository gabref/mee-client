const USER = {
    ID: 'Id',
    DOCUMENT: 'Documento'
}

const MEE_URL = {
    API: process.env.URL_API || '/api'
}

const AUTH = {
    API: {
        TIME_EXPIRATION: 60 * 60 * 24 // 24 hours
    },
    ESL: {
        TIME_EXPIRATION: 60 * 30 // 30 minutes
    }
}

export { USER, MEE_URL, AUTH }