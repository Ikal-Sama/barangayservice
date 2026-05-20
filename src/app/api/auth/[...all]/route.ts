import { auth } from "@/lib/auth";
import { protectAuthApiPost } from "@/lib/arcjet";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export async function GET(request: Request) {
  return handler.GET(request);
}

export async function POST(request: Request) {
  const blocked = await protectAuthApiPost(request);
  if (blocked) return blocked;

  return handler.POST(request);
}
