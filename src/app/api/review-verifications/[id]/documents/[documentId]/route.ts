import { cookies } from "next/headers";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function GET(req: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const token = (await cookies()).get("peercheck_access_token")?.value;
  if (!token) return Response.json({ message: "Session expired." }, { status: 401 });
  const base = process.env.API_BASE_URL;
  if (!base) return Response.json({ message: "The API is not configured." }, { status: 503 });
  const { id, documentId } = await context.params;
  const preview = new URL(req.url).searchParams.get("preview") === "1";
  try {
    const upstream = await fetch(
      `${base.replace(/\/$/, "")}${BACKEND_ROUTES.VERIFICATION_DOCUMENT(encodeURIComponent(id), encodeURIComponent(documentId))}${preview ? "?preview=1" : ""}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store", signal: req.signal },
    );
    const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    for (const name of ["content-type", "content-disposition"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return Response.json({ message: "Unable to retrieve the attached document." }, { status: 502 });
  }
}
