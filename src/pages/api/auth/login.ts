import { AUTH, USER } from 'src/config/data/defines'
import { handleErrors } from '@utils/apiErrorHandling'
import { getDBData } from '@utils/getDB'
import { sign } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {
    if (req.method !== 'POST') res.status(405).json({ message: 'Accepts only POST method'})

    try {
        const { doc } = JSON.parse( req.body )
        
        if (!doc) throw new ApiError(400, 'Missing "doc" in body')
    
        // get user
        const userInfo = await getDBData(doc, USER.DOCUMENT)
    
        // verify password
    
        // autenticate user
        const token = sign({ id: userInfo.id, roles: userInfo.roles }, process.env.JWT_PASS ?? '', {
            expiresIn: AUTH.API.TIME_EXPIRATION,
            
        })
    
        return res.status(200).json({ token: token, user: userInfo })

    } catch(err) { handleErrors(err, res) }
}