import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /**
         * 문서 내용이 AIP Core 기준으로 어디까지 확인됐는지.
         * - stub: 자리만 있고 내용은 AIP Core 확정 대기
         * - sourced: AIP Core에서 확정된 내용만 출처와 함께 옮김
         */
        status: z.enum(["stub", "sourced"]),
        /** sourced 문서의 AIP Core 출처 경로. */
        source: z.array(z.string()).optional(),
      }),
    }),
  }),
};
