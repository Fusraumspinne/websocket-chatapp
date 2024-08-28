import { connectMongoDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import Message from "@/models/message"

export async function POST(req) {
    try {
        const { message, userName, roomName, timestamp } = await req.json()
        await connectMongoDB()
        await Message.create({ message, userName, roomName, timestamp })

        return NextResponse.json({ message: "Message saved" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Error while saving message" }, { status: 500 })
    }
}