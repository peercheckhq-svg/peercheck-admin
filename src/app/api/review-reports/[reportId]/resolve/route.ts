import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await context.params;
  const res = await proxyToApi(req, BACKEND_ROUTES.REVIEW_REPORT_RESOLVE(reportId));
  return res;
}
