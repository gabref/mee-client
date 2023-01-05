import { handleErrors } from "@utils/apiErrorHandling";
import { ensureAuth } from "@services/auth/ensureAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') res.status(405).json({ message: 'Accepts only GET method'})

    try {
        const isAuth = await ensureAuth(req.headers.authorization!)
        if (!isAuth) throw new ApiError(403, 'Not Authenticated')

        res.status(200).json({
            clientId: process.env.HANSHOW_CLIENT_ID!,
            clientSecret: process.env.HANSHOW_CLIENT_SECRET!,
            user: process.env.HANSHOW_USER!,
            password: process.env.HANSHOW_PASS!,
            site: process.env.HANSHOW_SITE!,
            store: process.env.HANSHOW_STORE!,
            storeCode: process.env.HANSHOW_STORE_CODE!
        })

    } catch(err) { handleErrors(err, res) }
}