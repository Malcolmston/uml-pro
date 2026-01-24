import { getJwtSecret } from "./jwt"

const encoder = new TextEncoder()

const base64UrlDecode = (input: string): string => {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded =
        normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    return atob(padded)
}

const base64UrlEncode = (bytes: Uint8Array): string => {
    let binary = ""
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
    })
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

const verifySignature = async (
    data: string,
    signature: string,
    secret: string
): Promise<boolean> => {
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    )
    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
    const expected = base64UrlEncode(new Uint8Array(signed))
    return expected === signature
}

export const isJwtValidEdge = async (token: string): Promise<boolean> => {
    const jwtSecret = getJwtSecret()
    if (!jwtSecret) return false

    const parts = token.split(".")
    if (parts.length !== 3) return false

    const [headerPart, payloadPart, signaturePart] = parts
    try {
        const header = JSON.parse(base64UrlDecode(headerPart))
        if (header?.alg !== "HS256") return false

        const payload = JSON.parse(base64UrlDecode(payloadPart))
        if (typeof payload?.exp === "number" && payload.exp * 1000 < Date.now()) {
            return false
        }

        return await verifySignature(
            `${headerPart}.${payloadPart}`,
            signaturePart,
            jwtSecret
        )
    } catch {
        return false
    }
}
