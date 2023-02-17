import { handleErrors } from '@utils/apiErrorHandling'
import { ensureAuth } from '@services/auth/ensureAuth'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import { blink } from '@services/esl/blink'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') res.status(405).json({ message: 'Accepts only POST method'})

    try {
        const isAuth = await ensureAuth(req.headers.authorization!)
        if (!isAuth) throw new ApiError(403, 'Not Authenticated')

        const { eslId, color } = req.body
        if (!eslId || !color) throw new ApiError(400, 'Missing eslid or color in body')

        const responseEslApi = await blink(eslId, color)
        res.status(200).json({ isUpdated: responseEslApi })

    } catch(err) { handleErrors(err, res) }
}