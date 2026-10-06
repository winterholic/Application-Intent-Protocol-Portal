import type { APIRoute, GetStaticPaths } from "astro";
import { getDocs, toMarkdown, type Doc } from "../lib/docs";

export const getStaticPaths = (async () =>
  (await getDocs()).map((doc) => ({ params: { slug: doc.route }, props: { doc } }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ doc: Doc }> = ({ props }) =>
  new Response(toMarkdown(props.doc), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
