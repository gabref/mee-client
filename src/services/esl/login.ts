// hanshow login api

export async function login() {
    try {
        const res = await fetch('process.env.HANSHOW_URL_LOGIN', {
            method: 'POST',
            body: JSON.stringify({
                'username': process.env.HANSHOW_USER, 
                'password': process.env.HANSHOW_PASS
            }),
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        })
        const resData = await res.json()
        return resData.data.jsessionid
    } catch (error) {
        throw new Error('no user found')
    }
}