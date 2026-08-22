import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function POST(req: Request, context: any) {
  const { params } = context as { params: { sourceId: string } };
  const res = await proxyToApi(
    req,
    BACKEND_ROUTES.MERGE_COMPANIES(params.sourceId),
  );
  return res;
}
