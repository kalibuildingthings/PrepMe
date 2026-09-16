import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Please provide a valid job description URL." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PrepMeBot/1.0)" },
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Couldn't fetch that link (status ${res.status}).` }, { status: 422 });
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, nav, header, footer, noscript").remove();

    const title = $("title").first().text().trim();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    if (!bodyText || bodyText.length < 100) {
      return NextResponse.json(
        { error: "That page didn't have enough readable text. Try pasting the JD text directly instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: `${title}\n\n${bodyText}`.slice(0, 20000) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch job description" },
      { status: 500 }
    );
  }
}
