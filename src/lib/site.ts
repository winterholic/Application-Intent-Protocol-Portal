export const SITE_URL = "https://aip-portal.vercel.app";
export const CORE_REPO = "https://github.com/winterholic/Application-Intent-Protocol";
export const PORTAL_REPO = "https://github.com/winterholic/Application-Intent-Protocol-Portal";
export const MAKEAIP_REPO = "https://github.com/winterholic/Application-Intent-Protocol-Starter";

export const coreFile = (path: string) => `${CORE_REPO}/blob/main/${path}`;

export type NavGroup = "getStarted" | "concepts" | "architecture" | "reference" | "guides" | "project";

/**
 * 문서 사이드바·pager·검색·llms.txt의 순서. 문서 하나는 정확히 한 곳에 속한다.
 * 항목은 언어 중립 문서 key(src/content/docs/<locale>/ 기준 경로, 루트는 "index").
 */
export const DOC_NAV: readonly { group: NavGroup; items: readonly string[] }[] = [
  { group: "getStarted", items: ["index", "why-aip", "getting-started"] },
  { group: "concepts", items: ["concepts", "concepts/intent", "concepts/spr", "concepts/extensions", "concepts/ai-first"] },
  { group: "architecture", items: ["architecture", "security"] },
  { group: "reference", items: ["specification"] },
  { group: "guides", items: ["guides", "examples"] },
  { group: "project", items: ["status"] },
];
