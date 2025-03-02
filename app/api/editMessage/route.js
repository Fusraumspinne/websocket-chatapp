import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Message from "@/models/message";

export async function POST(req) {
  try {
    const { id, newMessage } = await req.json();
    
    await connectMongoDB();
    
    const updatedMessage = await Message.findOneAndUpdate(
      { id },
      { message: newMessage },
    );
    
    if (!updatedMessage) {
      return NextResponse.json({ message: "Nachricht nicht gefunden" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Nachricht wurde aktualisiert", updatedMessage }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Ein Fehler ist beim Aktualisieren der Nachricht aufgetreten" }, { status: 500 });
  }
}
