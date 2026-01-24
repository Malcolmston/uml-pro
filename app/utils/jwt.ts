import { NextRequest } from "next/server"

export const getJwtSecret = () =>
    process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET

export const getBearerToken = (request: NextRequest): string | null => {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    return authHeader.slice("Bearer ".length)
}
