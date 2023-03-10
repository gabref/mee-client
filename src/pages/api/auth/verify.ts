import { TJwtPayload } from 'src/config/custom/types'
import { USER } from 'src/config/data/defines'
import { handleErrors } from '@utils/apiErrorHandling'
import { getDBData } from '@utils/getDB'
import { sign, verify } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {
    if (req.method !== 'GET') res.status(405).json({ message: 'Accepts only GET method'})

    try {
        const { authorization } = req.headers
    
        if (!authorization) throw new ApiError(403, 'Token missing')
    
        const [, token] = authorization.split(' ')
        const { id } = verify(token, process.env.JWT_PASS ?? '') as TJwtPayload

        if (!id) throw new ApiError(400, 'Something went wrong with id')
    
        // check if in databse
        const userInfo = await getDBData(id, USER.ID)

        return res.status(200).json({ user: userInfo })

    } catch(err) { handleErrors(err, res) }
}