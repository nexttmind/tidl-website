import { respondAskTidl, type AskTidlRequest } from "@/lib/ask-tidl/respond";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: AskTidlRequest;
  try {
    body = (await request.json()) as AskTidlRequest;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.query || typeof body.query !== "string") {
    return Response.json(
      { success: false, message: "query is required" },
      { status: 422 },
    );
  }

  try {
    const answer = await respondAskTidl(body);
    return Response.json({ success: true, data: answer });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: "Ask Tidl failed" },
      { status: 500 },
    );
  }
}
