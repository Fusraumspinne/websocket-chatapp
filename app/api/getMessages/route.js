import { connectMongoDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import Message from "@/models/message"

export async function POST(req) {
    try {
        const { roomName } = await req.json()
        await connectMongoDB()
        const messages = await Message.find({ roomName })
        return NextResponse.json({ messages })
    } catch (error) {
        return NextResponse.json({ message: "Error while loading messages" })
    }
}