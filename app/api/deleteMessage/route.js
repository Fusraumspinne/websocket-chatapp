import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Message from "@/models/message";

export async function POST(req) {
  try {
    const { id } = await req.json();

    await connectMongoDB();

    const deletedMessage = await Message.findOneAndDelete({ id });
    if (!deletedMessage) {
        return NextResponse.json({ message: "Nachricht nicht gefunden" },{ status: 404 });
    }

    return NextResponse.json({ message: "Nachricht wurde gelöscht" },{ status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Ein Fehler ist beim Löschen der Nachricht aufgetreten" },{ status: 500 });
  }
}