import { connectMongoDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import Message from "@/models/message"

export async function POST(req) {
    try {
        const { roomName, page = 1, pageSize = 20 } = await req.json()
        await connectMongoDB()
        const skip = (page - 1) * pageSize
        const messages = await Message.find({ roomName })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
        return NextResponse.json({ messages })
    } catch (error) {
        return NextResponse.json({ message: "Ein Fehler ist beim abrufen der Nachrichten aufgetreten" })
    }
}