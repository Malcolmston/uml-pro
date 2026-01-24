import { NextResponse } from "next/server"
import { getStatusResponse } from "../utils/status"

export async function GET() {
  const { status, body } = await getStatusResponse()
  return NextResponse.json(body, { status })
}
