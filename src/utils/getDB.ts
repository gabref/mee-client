import mysql from 'mysql2/promise'
import { ApiError } from 'next/dist/server/api-utils'

type TDBUser = {
    id: string,
    doc: string,
    nome: string,
    nomeFantasia: string,
    telefone: string
    email: string,
}

export async function getDBData (userDoc: string | string[], searchWhere: string): Promise<TDBUser> {
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
    return { id, doc, nome, nomeFantasia, email, telefone }
}