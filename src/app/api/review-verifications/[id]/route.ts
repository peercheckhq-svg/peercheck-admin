import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyToApi(req, BACKEND_ROUTES.VERIFICATION_DETAIL(encodeURIComponent(id)));
}
