import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";

export function handleErrors(
    err: ApiError | Error | unknown,
    res: NextApiResponse
) {
    if (err instanceof ApiError) 
        return handleApiError(err, res)
    if (err instanceof Error)
        return handleError(err, res)

    return res.status(500).json({ message: 'Unknown Error' })
}

function handleApiError(err: ApiError, res: NextApiResponse) {
    const statusCode = err.statusCode ?? 500
    const message = err.statusCode ? err.message : 'Internal Server Error'
    return res.status(statusCode).json({ message })
}

function handleError(err: Error, res: NextApiResponse) {
    if (err.message == 'invalid signature') 
        return handleApiError(new ApiError(401, 'Invalid Token'), res)

    return res.status(500).json({ message: err.message })
}