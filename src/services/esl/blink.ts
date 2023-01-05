import { login } from "./login"

export async function blink(eslId: string, color: string) {
    const data = [
        {
            "eslId": eslId,
            "led_color": [color],
            "led_count": "100"
        }
    ]

    const id: string = await login()
}