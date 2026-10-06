export const CORE_REPO = "https://github.com/winterholic/Application-Intent-Protocol";
export const PORTAL_REPO = "https://github.com/winterholic/Application-Intent-Protocol-Portal";
export const MAKEAIP_REPO = "https://github.com/winterholic/Application-Intent-Protocol-Starter";

export const coreFile = (path: string) => `${CORE_REPO}/blob/main/${path}`;

/**
 * 문서 사이드바·pager·검색의 순서. 문서 하나는 정확히 한 곳에 속한다(verify-build가 검사한다).
 * 항목은 문서 id(src/content/docs 기준, 루트는 "index").
 */
export const DOC_NAV: readonly { group: string; items: readonly string[] }[] = [
  { group: "Get started", items: ["index", "why-aip", "getting-started"] },
  { group: "Concepts", items: ["concepts"] },
  { group: "Guides", items: ["guides", "examples"] },
  { group: "Reference", items: ["specification", "security"] },
  { group: "Project", items: ["status"] },
];
