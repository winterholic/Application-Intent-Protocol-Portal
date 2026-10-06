import type { APIRoute, GetStaticPaths } from "astro";
import { getDocs, toMarkdown, type DocEntry } from "../lib/docs";

export const getStaticPaths = (async () =>
  (await getDocs()).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: DocEntry }> = ({ props }) =>
  new Response(toMarkdown(props.entry), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
