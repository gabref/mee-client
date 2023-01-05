import Logger from "@utils/logger"
import { ApiError } from "next/dist/server/api-utils"

export default async function sendData(productInfo: string) {
    const data = {
        'storeCode': process.env.HANSHOW_STORE_CODE,
        'customerStoreCode': process.env.HANSHOW_STORE,
        'batchNo': '202004091103',
        'items': [ productInfo ]
    }
    
    const res = await fetch(process.env.HANSHOW_URL!, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json;charset=utf-8',
            'client-id': process.env.HANSHOW_CLIENT_ID!,
            'client-secret': process.env.HANSHOW_CLIENT_SECRET!
        }
    })

    const resData: any = await res.json()
    Logger.info(data)

    if (resData.hasOwnProperty('itemCount'))
        return true
    else if (resData.hasOwnProperty('message')) {
        Logger.error('Erro no envio: ' + resData.message)
        return false
    } else 
        throw new ApiError(502, 'Bad Gateway')
}