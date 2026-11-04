import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await proxyToApi(req, BACKEND_ROUTES.REVIEW_UNPUBLISH(id));
  return res;
}
