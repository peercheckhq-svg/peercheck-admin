import proxyToApi from "@/lib/proxyToApi";
import { BACKEND_ROUTES } from "@/routes/apiRoutes";

export async function GET(req: Request) {
  return proxyToApi(req, BACKEND_ROUTES.VERIFICATIONS);
}
