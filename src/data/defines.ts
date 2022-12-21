const USER = {
    ID: 'Id',
    DOCUMENT: 'Documento'
}

const MEE_URL = {
    API: process.env.URL_API || '/api'
}

const AUTH = {
    API: {
        TIME_EXPIRATION: 60 * 70 * 24
    }
}

export { USER, MEE_URL, AUTH }