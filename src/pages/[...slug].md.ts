import type { APIRoute, GetStaticPaths } from "astro";
import { LOCALES, localizePath } from "../i18n/locales";
import { getDocs, toMarkdown, type Doc } from "../lib/docs";

export const getStaticPaths = (async () => {
  const paths = [];
  for (const locale of LOCALES) {
    for (const doc of await getDocs(locale)) {
      paths.push({ params: { slug: localizePath(locale, `/${doc.route}`).slice(1) }, props: { doc } });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ doc: Doc }> = ({ props }) =>
  new Response(toMarkdown(props.doc), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
