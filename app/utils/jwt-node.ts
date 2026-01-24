import jwt from "jsonwebtoken"
import { getBearerToken, getJwtSecret } from "./jwt"
import { NextRequest } from "next/server"

export const getUserIdFromRequest = (request: NextRequest): number | null => {
    const token = getBearerToken(request)
    if (!token) {
        return null
    }

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
        return null
    }

    try {
        const payload = jwt.verify(token, jwtSecret)
        if (typeof payload === "string" || !payload?.sub) {
            return null
        }

        const userId = Number(payload.sub)
        return Number.isFinite(userId) ? userId : null
    } catch {
        return null
    }
}

export type JwtSignPayload = jwt.JwtPayload & { sub: string | number }

export const signJwt = (
    payload: JwtSignPayload,
    options: jwt.SignOptions
): string | null => {
    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
        return null
    }

    return jwt.sign(payload, jwtSecret, options)
}
