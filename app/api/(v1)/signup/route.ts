import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {firstName, lastName, email, username, password, cofPassword} = body;

        if( !firstName || !lastName || !email || !username || !password || !cofPassword ) {
            return new Response("Missing required fields", {status: 400})
        }

        if( password !== cofPassword ) {
            return new Response("Passwords do not match", {status: 400})
        }

        if (!Database.isInitialized) {
            await Database.initialize()
        }

        const userRepo = Database.getRepository(User)
        const user = await userRepo.findOne({
            withDeleted: true,
            where: [{ email: identifier }, { username: identifier }]
        })

        if ( user.deletedAt ) {
            return  NextResponse.json(
                {error: "User was deleted", time: user.deletedAt},
                {status: 400});
        }

        if( user != null ) {
            returnNextResponse.json(
                {error: "User already exists, please signin"},
                {status: 400}
            )
        }

        const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.username = username;
        user.password = password;
        await userRepo.save(user);

        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) {
            return NextResponse.json(
                { error: "JWT secret not configured" },
                { status: 500 }
            )
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, jwtSecret, { expiresIn: "1h" })

        return NextResponse.json(
            {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            },
            { status: 201 }
        )
    }
}
