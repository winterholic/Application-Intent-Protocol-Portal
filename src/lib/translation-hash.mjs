// 번역 동기화 기준값. 영어 원본의 title·description·본문이 바뀌면 값이 바뀌고,
// 번역의 `translatedFrom`과 다르면 그 번역은 영어보다 뒤처진 것이다.
// Astro 빌드와 scripts/i18n-status.mjs 가 같은 함수를 쓴다.
import { createHash } from "node:crypto";

/** @param {{ title: string, description: string, body: string }} source */
export function translationHash({ title, description, body }) {
  return createHash("sha256").update(`${title}\n${description}\n${body.trim()}\n`).digest("hex").slice(0, 12);
}
