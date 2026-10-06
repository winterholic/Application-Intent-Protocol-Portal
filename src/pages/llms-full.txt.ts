import type { APIRoute } from "astro";
import { getDocs, toMarkdown } from "../lib/docs";

export const GET: APIRoute = async () => {
  const body = (await getDocs("en")).map(toMarkdown).join("\n---\n\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
