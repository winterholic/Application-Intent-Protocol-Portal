import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const collections = {
  docs: defineCollection({
    // id = "<locale>/<path>", 하위 `/index`는 뺀다. 예: en/index, en/concepts/intent, ko/status
    loader: glob({
      pattern: "*/**/*.md",
      base: "./src/content/docs",
      generateId: ({ entry }) => entry.replace(/\.md$/, "").replace(/^([^/]+\/.+)\/index$/, "$1"),
    }),
    schema: z.object({
      title: z.string(),
      /** 페이지 요지 한두 문장. 제목 아래 lead와 llms.txt 설명에 쓴다. */
      description: z.string(),
      /**
       * 영어 원본에만 쓴다. 번역은 영어 원본의 값을 따른다.
       * - stub: 자리만 있고 내용은 AIP Core 확정 대기
       * - sourced: AIP Core에서 확인되는 내용만 출처와 함께 옮김
       */
      status: z.enum(["stub", "sourced"]).optional(),
      /** 영어 원본에만. AIP Core 저장소 루트 기준 출처 경로. */
      source: z.array(z.string()).optional(),
      /** 영어 원본에만. AIP Core 기준으로 내용을 마지막으로 대조한 날짜. */
      checked: z.coerce.date().optional(),
      /** 번역에만. 번역할 때의 영어 원본 translationHash. */
      translatedFrom: z.string().optional(),
    }),
  }),
};
