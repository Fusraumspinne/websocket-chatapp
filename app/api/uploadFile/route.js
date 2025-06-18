import { NextResponse } from "next/server";

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function POST(req) {
  const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadRes = await fetch(
    "https://content.dropboxapi.com/2/files/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/chatapp/${file.name}`,
          mode: "add",
          autorename: true,
          mute: false,
        }),
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    }
  );

  const uploadResult = await parseResponse(uploadRes);

  if (!uploadRes.ok) {
    return NextResponse.json(
      {
        error:
          uploadResult.error || uploadResult.error_summary || "Upload failed",
      },
      { status: 500 }
    );
  }

  const shareRes = await fetch(
    "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: uploadResult.path_display,
        settings: { requested_visibility: "public" },
      }),
    }
  );

  const shareResult = await parseResponse(shareRes);

  if (!uploadRes.ok) {
    console.error("Dropbox Upload Error:", uploadResult);
    return NextResponse.json(
      {
        error:
          uploadResult.error || uploadResult.error_summary || "Upload failed",
      },
      { status: 500 }
    );
  }
  if (!shareRes.ok) {
    console.error("Dropbox Share Error:", shareResult);
    return NextResponse.json(
      {
        error: shareResult.error || shareResult.error_summary || "Share failed",
      },
      { status: 500 }
    );
  }

  const directLink = shareResult.url
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace("?dl=0", "?raw=1");

  return NextResponse.json({
    url: directLink,
    path: uploadResult.path_display,
  });
}
