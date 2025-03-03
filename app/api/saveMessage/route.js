import { connectMongoDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import Message from "@/models/message"

export async function POST(req) {
    try {
        const { id, message, userName, roomName, timestamp, edited } = await req.json();
        await connectMongoDB()
        await Message.create({ id, message, userName, roomName, timestamp, edited });

        return NextResponse.json({ message: "Nachricht wurde gespeichert" }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Ein Fehler ist beim abrufen der Nachrichten aufgetreten" }, { status: 500 })
    }
}