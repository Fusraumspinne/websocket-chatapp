import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Message from "@/models/message";

export async function POST(req) {
    try {
        await connectMongoDB();
        const messages = await Message.find({});
        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ message: "Ein Fehler ist beim Abrufen der Nachrichten aufgetreten" });
    }
}