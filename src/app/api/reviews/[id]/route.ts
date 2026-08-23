import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await proxyToApi(req, BACKEND_ROUTES.REVIEW_DETAIL(id));
  return res;
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const res = await proxyToApi(req, BACKEND_ROUTES.REVIEW_DETAIL(id));
  return res;
}
