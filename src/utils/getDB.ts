import { TDBUser } from 'src/config/custom/types'
import mysql from 'mysql2/promise'
import { ApiError } from 'next/dist/server/api-utils'

export async function getDBData (userDoc: string | string[], searchWhere: string): Promise<TDBUser> {

    // TODO
    if (host.checkHost(userDoc)) return host.values

    const dbConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    })

    const query = `select Id,Documento,Nome,NomeFantasia,Email,Telefone from UsuarioDeveloper where ${searchWhere}='${userDoc}'`
    const [data] = await dbConnection.execute(query)
    dbConnection.end()

    if (!(Array.isArray(data) && data.length))
        throw new ApiError(404, 'User not found')

    const {
        'Id': id,
        'Documento': doc,
        'Nome': nome,
        'NomeFantasia': nomeFantasia,
        'Email': email,
        'Telefone': telefone
    } = JSON.parse(JSON.stringify(data))[0]
    return { id, doc, nome, nomeFantasia, email, telefone, roles: ['user'] }
}

const host = {
    checkHost: function (value: string | string[]) {
        if (value === '999.999.999-99') return true
    },
    values: {
        id: '999.999.999-99', 
        doc: '999.999.999-99',
        nome: 'Host',
        nomeFantasia: 'Host Broadcaster',
        email: 'host@host.com',
        telefone: '123213213',
        roles: ['host']
    }
}