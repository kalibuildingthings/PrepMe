import { NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/elevenlabs/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const signedUrl = await getSignedUrl();
    return NextResponse.json({ signedUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
