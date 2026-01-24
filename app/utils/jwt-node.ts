import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getBearerToken, getJwtSecret } from "./jwt"

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
