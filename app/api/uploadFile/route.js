import { NextResponse } from "next/server";

const TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
    client_id: process.env.DROPBOX_APP_KEY,
    client_secret: process.env.DROPBOX_APP_SECRET,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Token-Refresh fehlgeschlagen: " + JSON.stringify(data));
  return data.access_token;
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function POST(req) {
  const accessToken = await getAccessToken();

  const data = await req.formData();
  const file = data.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({
        path: `/chatapp/${file.name}`,
        mode: "add",
        autorename: true,
        mute: false,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });
  const uploadResult = await parseResponse(uploadRes);
  if (!uploadRes.ok) {
    return NextResponse.json(
      { error: uploadResult.error || uploadResult.error_summary || "Upload failed" },
      { status: 500 }
    );
  }

  const shareRes = await fetch("https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: uploadResult.path_display,
      settings: { requested_visibility: "public" },
    }),
  });
  const shareResult = await parseResponse(shareRes);
  if (!shareRes.ok) {
    return NextResponse.json(
      { error: shareResult.error || shareResult.error_summary || "Share failed" },
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
