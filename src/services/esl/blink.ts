import { login } from "./login"

export async function blink(eslId: string, color: string) {
    try {
        const id = await login()

        const { HANSHOW_STORE, HANSHOW_STORE_CODE } = process.env

        const data = [
                {
                    // 'eslId': eslId,
                    'goodsId': `${HANSHOW_STORE}/${HANSHOW_STORE_CODE}/${eslId}`,
                    'led_color': [color],
                    'led_count': '200'
                }
            ]
    
        const res = await fetch(`https://saas-poc-usa.hanshowcloud.net/esl/setEslControl;jsessionid=${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json;charset=utf-8',
            'client-id': process.env.HANSHOW_CLIENT_ID!,
            'client-secret': process.env.HANSHOW_CLIENT_SECRET!
        }})
    
        const resData = await res.json()
    
        return resData
    } catch (error) {
        console.error('deu erro na matriz', error)
    }
}