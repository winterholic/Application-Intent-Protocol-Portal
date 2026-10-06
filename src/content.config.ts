import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const collections = {
  docs: defineCollection({
    // id = src/content/docs 기준 경로에서 확장자와 하위 `/index`를 뺀 값. 문서 루트는 "index".
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/docs",
      generateId: ({ entry }) => entry.replace(/\.md$/, "").replace(/\/index$/, ""),
    }),
    schema: z.object({
      title: z.string(),
      /** 페이지 요지 한두 문장. 제목 아래 lead와 llms.txt 설명에 쓴다. */
      description: z.string(),
      /**
       * 내용이 AIP Core 기준으로 어디까지 확인됐는지.
       * - stub: 자리만 있고 내용은 AIP Core 확정 대기
       * - sourced: AIP Core에서 확정된 내용만 출처와 함께 옮김
       */
      status: z.enum(["stub", "sourced"]),
      /** sourced 문서의 AIP Core 출처. 저장소 루트 기준 경로. */
      source: z.array(z.string()).default([]),
      /** AIP Core 기준으로 내용을 마지막으로 대조한 날짜. */
      checked: z.coerce.date().optional(),
    }),
  }),
};
