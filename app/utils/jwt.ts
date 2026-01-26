import { NextRequest } from "next/server"

export const getJwtSecret = () => {
    const stage = process.env.NODE_ENV as string | undefined
    const isProd = stage === 'prod' || stage === 'production'
    
    if (isProd) {
        return process.env.PROD_JWT_SECRET ?? process.env.JWT_SECRET ?? process.env.PROD_SUPABASE_JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET
    }
    
    return process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET
}

export const getBearerToken = (request: NextRequest): string | null => {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    return authHeader.slice("Bearer ".length)
}
