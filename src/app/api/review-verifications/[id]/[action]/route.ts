import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function PATCH(req: Request, context: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await context.params;
  if (action !== "approve" && action !== "reject") {
    return Response.json({ message: "Unknown verification action." }, { status: 404 });
  }
  return proxyToApi(req, BACKEND_ROUTES.VERIFICATION_ACTION(encodeURIComponent(id), action));
}
