import { NextRequest, NextResponse } from "next/server"

const jwtSecret = process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET
const encoder = new TextEncoder()

/**
 * Decodes a Base64URL-encoded string into its original string representation.
 * Replaces URL-safe characters with their standard Base64 equivalents,
 * adds necessary padding, and decodes the resulting string.
 *
 * @param {string} input - The Base64URL-encoded string to decode.
 * @returns {string} The decoded string.
 */
const base64UrlDecode = (input: string): string => {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded =
        normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    return atob(padded)
}

/**
 * Encodes a given Uint8Array into a Base64 URL-safe string.
 *
 * This function converts a binary input into a Base64 string
 * and modifies the output to make it URL-safe by replacing certain
 * characters and removing padding.
 *
 * @param {Uint8Array} bytes - The input array of bytes to be encoded.
 * @returns {string} The Base64 URL-safe encoded string.
 */
const base64UrlEncode = (bytes: Uint8Array): string => {
    let binary = ""
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
    })
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

/**
 * Asynchronously verifies the integrity and authenticity of a message by comparing a provided signature to a newly generated HMAC signature.
 *
 * @param {string} data - The message or data to verify.
 * @param {string} signature - The base64url-encoded HMAC signature to verify against.
 * @param {string} secret - The secret key used to sign the data.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the provided signature matches the generated signature, or `false` otherwise.
 */
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

/**
 * Asynchronously validates the given JSON Web Token (JWT).
 *
 * This function checks the structure of the token, ensures it consists of three parts
 * (header, payload, and signature), and verifies the following:
 * - The signing algorithm matches the expected value ("HS256").
 * - The token’s expiration time has not passed.
 * - The signature of the token is valid using the provided secret key.
 *
 * @param {string} token - The JWT as a string to be validated.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the token is valid,
 * and `false` otherwise (e.g., if the token is malformed, expired, or the signature is invalid).
 */
const isJwtValid = async (token: string): Promise<boolean> => {
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

export async function proxy(request: NextRequest) {
    if (request.method === "OPTIONS") {
        return NextResponse.next()
    }

    const pathname = request.nextUrl.pathname
    const publicPaths = [
        "/api/(v1)/signin",
        "/api/(v1)/signup",
        "/api/(v1)/status",
        "/api/(v1)/(public)/graphql",
    ]
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null

    if (!token || !(await isJwtValid(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/api/(public)/graphql/:path*", "/api/(v1)/:path*"],
}
