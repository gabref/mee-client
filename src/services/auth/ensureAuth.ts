import { TJwtPayload } from "src/config/custom/types"
import { USER } from "src/config/data/defines"
import { verify } from "jsonwebtoken"
import { ApiError } from "next/dist/server/api-utils"
import { getDBData } from "@utils/getDB"

async function ensureAuth(authorization: string) {
    if (!authorization) throw new ApiError(403, 'Token missing')

    const [, token] = authorization.split(' ')

    const { id }= verify(token, process.env.JWT_ESL_PASS ?? '') as TJwtPayload
        
    if (!id) throw new ApiError(400, 'Something went wrong with id')
    
    // check if in databse
    const userInfo = await getDBData(id, USER.ID)
    
    if (!userInfo) throw new ApiError(401, 'No user found')
    
    return true
}

export { ensureAuth }